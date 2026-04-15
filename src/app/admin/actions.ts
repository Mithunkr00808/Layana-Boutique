"use server";

import { adminDb } from "@/lib/firebase/admin";
import { assertAdminSession } from "@/lib/auth/admin-session";
import {
  DEFAULT_PRODUCT_CATEGORY,
  SHOP_CATALOG_PATH,
  isKnownProductCategory,
} from "@/lib/catalog/categories";
import {
  buildCloudinaryVideoPosterUrl,
  deleteCloudinaryAsset,
  isCloudinaryConfigured,
  uploadProductMedia,
} from "@/lib/cloudinary";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { randomUUID } from "crypto";
import type { ProductMedia } from "@/types/product-media";
import { productSchema } from "@/lib/schemas/product";

type PersistedMediaInput = ProductMedia & {
  clientKey?: string;
};

function sanitizeFirestoreValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeFirestoreValue(item)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
    return Object.fromEntries(
      entries.map(([key, entryValue]) => [key, sanitizeFirestoreValue(entryValue)])
    ) as T;
  }

  return value;
}

function buildMediaLayoutType(index: number) {
  if (index === 1 || index === 2) {
    return "half";
  }

  return "large";
}

function parseJsonField<T>(formData: FormData, key: string, fallback: T): T {
  const value = formData.get(key)?.toString();

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeMediaEntry(media: Partial<PersistedMediaInput>, index: number): ProductMedia {
  const resourceType = media.resourceType === "video" ? "video" : "image";
  const publicId = media.publicId;
  const poster =
    resourceType === "video"
      ? media.poster || (publicId ? buildCloudinaryVideoPosterUrl(publicId) : undefined)
      : undefined;

  return {
    src: media.src || "",
    alt: media.alt || `Product media ${index + 1}`,
    type: buildMediaLayoutType(index),
    resourceType,
    publicId,
    poster,
    format: media.format,
    width: media.width,
    height: media.height,
    bytes: media.bytes,
    duration: media.duration,
  };
}

function normalizeMediaEntries(media: Partial<PersistedMediaInput>[]) {
  return media
    .filter((item): item is Partial<PersistedMediaInput> => Boolean(item?.src))
    .map((item, index) => normalizeMediaEntry(item, index));
}

function selectSummaryImage(media: ProductMedia[]) {
  if (!media.length) {
    return "";
  }

  // Try each media item in order, preferring images
  for (const item of media) {
    if (item.resourceType === "video") {
      const poster = item.poster || (item.publicId ? buildCloudinaryVideoPosterUrl(item.publicId) : "");
      if (poster) return poster;
      // If video has no poster, continue to next item
      continue;
    }
    // Image: use src directly
    if (item.src) return item.src;
  }

  // No usable image found in any media item
  return "";
}

export async function saveCatalogItem(formData: FormData, existingId?: string) {
  await assertAdminSession();

  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Firebase Admin not configured.");
  }

  const id = existingId || `product-${randomUUID().slice(0, 8)}`;
  const legacyImageFile = formData.get("imageFile");

  // Basic parsing
  const name = formData.get("name")?.toString() || "";
  const price = formData.get("price")?.toString() || "₹0.00";
  const discountPrice = formData.get("discountPrice")?.toString() || "";
  const quantity = parseInt(formData.get("quantity")?.toString() || "0", 10);
  const submittedCategory = formData.get("category")?.toString();
  const category = isKnownProductCategory(submittedCategory)
    ? submittedCategory
    : DEFAULT_PRODUCT_CATEGORY;
  const description = formData.get("description")?.toString() || "";
  
  const validation = productSchema.safeParse({
    name,
    price,
    discountPrice,
    quantity,
    category,
    description,
    sustainability: formData.get("sustainability")?.toString(),
    sizes: formData.get("sizes")?.toString(),
    options: formData.get("options")?.toString(),
    enableSizes: formData.get("enableSizes")?.toString()
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Validation failed" };
  }

  const legacyImageUrl = formData.get("image")?.toString() || "";
  const uploadedMedia: ProductMedia[] = [];

  const existingSummaryDoc = existingId
    ? await adminDb.collection("products").doc(existingId).get()
    : null;
  const existingDetailDoc = existingId
    ? await adminDb.collection("productDetails").doc(existingId).get()
    : null;
  const previouslyStoredMedia = existingDetailDoc?.exists
    ? normalizeMediaEntries(((existingDetailDoc.data()?.images as Partial<PersistedMediaInput>[]) || []))
    : [];

  const existingMediaInput = parseJsonField<PersistedMediaInput[]>(formData, "existingMedia", []);
  const existingMediaByKey = new Map(
    existingMediaInput
      .filter((item) => item.clientKey)
      .map((item, index) => [item.clientKey as string, normalizeMediaEntry(item, index)])
  );
  const mediaFiles = [
    ...formData
      .getAll("mediaFiles")
      .filter((value): value is File => value instanceof File && value.size > 0),
    ...(legacyImageFile instanceof File && legacyImageFile.size > 0 ? [legacyImageFile] : []),
  ];
  const pendingMediaKeys = parseJsonField<string[]>(
    formData,
    "pendingMediaKeys",
    mediaFiles.map((_, index) => `pending:${index}`)
  );
  const mediaOrder = parseJsonField<string[]>(
    formData,
    "mediaOrder",
    [
      ...existingMediaInput
        .map((item, index) => item.clientKey || `existing:${index}`)
        .filter(Boolean),
      ...pendingMediaKeys,
    ]
  );

  // The check (pendingMediaKeys.length !== mediaFiles.length) is removed because 
  // we now support client-side direct uploads where files are NOT sent to the server action.

  if (!legacyImageUrl && !isCloudinaryConfigured() && mediaFiles.length > 0) {
    throw new Error("Cloudinary is not configured.");
  }

  if (mediaOrder.length > 8) {
    throw new Error("You can upload up to 8 assets per product.");
  }

  const uploadedMediaByKey = new Map<string, ProductMedia>();
  const clientUploadedMediaInput = parseJsonField<Record<string, ProductMedia>>(formData, "uploadedMediaData", {});
  
  // Add client-side uploaded media to our key map
  Object.entries(clientUploadedMediaInput).forEach(([key, data]) => {
    uploadedMediaByKey.set(key, data);
  });

  try {
    // Only perform server-side uploads for files that weren't already uploaded by the client
    const filesToUploadOnServer = mediaFiles.filter((_, index) => !uploadedMediaByKey.has(pendingMediaKeys[index]));
    const pendingKeysForServerUpload = pendingMediaKeys.filter((key) => !uploadedMediaByKey.has(key));

    if (filesToUploadOnServer.length > 0) {
      console.log(`Starting server-side media upload for ${filesToUploadOnServer.length} remaining files. Item ID: ${id}`);
      for (const [index, file] of filesToUploadOnServer.entries()) {
        const key = pendingKeysForServerUpload[index];
        console.log(`Uploading file ${index + 1}/${filesToUploadOnServer.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        const uploaded = await uploadProductMedia(file, {
          category,
          productId: id,
          position: index,
          altBase: name || "Product asset",
        });
        console.log(`Successfully uploaded file ${index + 1} to Cloudinary.`);
        uploadedMedia.push(uploaded);
        uploadedMediaByKey.set(key, uploaded);
      }
    }
  } catch (error) {
    // If a server-side upload fails, clean up any assets we just uploaded to Cloudinary
    await Promise.allSettled(
      uploadedMedia
        .filter((item) => item.publicId)
        .map((item) =>
          deleteCloudinaryAsset({
            publicId: item.publicId,
            resourceType: item.resourceType,
          })
        )
    );
    throw error;
  }

  let orderedMedia = mediaOrder
    .map((key) => existingMediaByKey.get(key) || uploadedMediaByKey.get(key))
    .filter((item): item is ProductMedia => Boolean(item))
    .map((item, index) => ({
      ...item,
      alt: item.alt || `${name || "Product"} media ${index + 1}`,
      type: buildMediaLayoutType(index),
      poster:
        item.resourceType === "video"
          ? item.poster || (item.publicId ? buildCloudinaryVideoPosterUrl(item.publicId) : undefined)
          : undefined,
    }));

  if (orderedMedia.length === 0 && legacyImageUrl) {
    orderedMedia = [
      {
        src: legacyImageUrl,
        alt: `${name || "Product"} cover image`,
        type: "large",
        resourceType: "image",
        poster: undefined,
      },
    ];
  }

  const removedMedia = previouslyStoredMedia.filter(
    (storedMedia) =>
      storedMedia.publicId &&
      !orderedMedia.some(
        (media) =>
          media.publicId === storedMedia.publicId &&
          (media.resourceType || "image") === (storedMedia.resourceType || "image")
      )
  );

  const sizesRaw = formData.get("sizes")?.toString() || "S, M, L";
  const sizes = sizesRaw.split(",").map((s) => ({
    label: s.trim(),
    available: true,
  }));
  const summaryImage = selectSummaryImage(orderedMedia);
  const summaryAlt = `${name || "Product"} cover image`;
  const enableSizesStr = formData.get("enableSizes");
  const hasSizes = enableSizesStr === "on" || enableSizesStr === "true";
  const subCategoriesRaw = formData.get("subCategories")?.toString() || "";
  const subCategoriesArray = subCategoriesRaw.split(",").map((s) => s.trim()).filter(Boolean);

  // Create the Product summary (for lists)
  const summaryPayload: Record<string, unknown> = {
    id,
    name,
    price,
    ...(discountPrice ? { discountPrice } : {}),
    quantity,
    category,
    subCategories: subCategoriesArray,
    image: summaryImage,
    alt: summaryAlt,
    isLimited: false,
    options: formData.get("options")?.toString() || "",
    hasVideo: orderedMedia.some((item) => item.resourceType === "video"),
    mediaCount: orderedMedia.length,
  };

  // Create the Product Detail (for individual page)
  const detailPayload: Record<string, unknown> = {
    id,
    sku: `SKU-${id.toUpperCase()}`,
    categoryPath: category,
    name,
    price,
    ...(discountPrice ? { discountPrice } : {}),
    quantity,
    description,
    subCategories: subCategoriesArray,
    sustainability: formData.get("sustainability")?.toString() || "Standard production",
    images: orderedMedia,
    sizes,
    hasSizes,
    materials: formData.get("options")?.toString() || "",
  };

  try {
    const batch = adminDb.batch();
    const sanitizedSummaryPayload = sanitizeFirestoreValue(summaryPayload);
    const sanitizedDetailPayload = sanitizeFirestoreValue(detailPayload);
    const summaryCreatedAt =
      existingSummaryDoc?.data()?.createdAt ||
      existingDetailDoc?.data()?.createdAt ||
      FieldValue.serverTimestamp();
    const detailCreatedAt =
      existingDetailDoc?.data()?.createdAt ||
      existingSummaryDoc?.data()?.createdAt ||
      FieldValue.serverTimestamp();

    sanitizedSummaryPayload.createdAt = summaryCreatedAt;
    sanitizedSummaryPayload.updatedAt = FieldValue.serverTimestamp();
    sanitizedDetailPayload.createdAt = detailCreatedAt;
    sanitizedDetailPayload.updatedAt = FieldValue.serverTimestamp();

    // Set summary in "products"
    const summaryRef = adminDb.collection("products").doc(id);
    batch.set(summaryRef, sanitizedSummaryPayload, { merge: true });

    // Set detail in "productDetails"
    const detailRef = adminDb.collection("productDetails").doc(id);
    batch.set(detailRef, sanitizedDetailPayload, { merge: true });

    await batch.commit();

    await Promise.allSettled(
      removedMedia.map((item) =>
        deleteCloudinaryAsset({
          publicId: item.publicId,
          resourceType: item.resourceType,
        })
      )
    );

    revalidatePath("/admin/catalog");
    revalidatePath(SHOP_CATALOG_PATH);
    revalidatePath(`/product/${id}`);
    revalidateTag("products", "default");

    return { success: true, id };
  } catch (error) {
    await Promise.allSettled(
      uploadedMedia.map((item) =>
        deleteCloudinaryAsset({
          publicId: item.publicId,
          resourceType: item.resourceType,
        })
      )
    );
    console.error("Failed to save catalog item to Firebase:", error);
    const message = (error as Error)?.message || "Failed to save item";
    return { success: false, error: message };
  }
}

export async function deleteCatalogItem(id: string) {
  await assertAdminSession();

  try {
    const detailRef = adminDb.collection("productDetails").doc(id);
    const detailDoc = await detailRef.get();
    const mediaToDelete = detailDoc.exists
      ? normalizeMediaEntries(((detailDoc.data()?.images as Partial<PersistedMediaInput>[]) || []))
      : [];

    const batch = adminDb.batch();

    batch.delete(adminDb.collection("products").doc(id));
    batch.delete(detailRef);

    await batch.commit();

    await Promise.allSettled(
      mediaToDelete.map((item) =>
        deleteCloudinaryAsset({
          publicId: item.publicId,
          resourceType: item.resourceType,
        })
      )
    );

    revalidatePath("/admin/catalog");
    revalidatePath(SHOP_CATALOG_PATH);
    revalidateTag("products", "default");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete catalog item:", error);
    return { success: false };
  }
}
