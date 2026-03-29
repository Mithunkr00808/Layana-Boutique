"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function saveCatalogItem(formData: FormData, existingId?: string) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Firebase Admin not configured.");
  }

  const id = existingId || `product-${randomUUID().slice(0, 8)}`;
  
  // Basic parsing
  const name = formData.get("name")?.toString() || "";
  const price = formData.get("price")?.toString() || "$0.00";
  const category = formData.get("category")?.toString() || "Catalog";
  const image = formData.get("image")?.toString() || "";
  const description = formData.get("description")?.toString() || "";
  
  // Materials and sizes (simple comma split)
  const materialsRaw = formData.get("materials")?.toString() || "";
  const materials = materialsRaw.split(",").map(m => m.trim()).filter(Boolean);
  
  const sizesRaw = formData.get("sizes")?.toString() || "S, M, L";
  const sizes = sizesRaw.split(",").map(s => ({
    label: s.trim(),
    available: true
  }));

  // Create the Product summary (for lists)
  const summaryPayload = {
    id,
    name,
    price,
    category,
    image,
    alt: `${name} product image`,
    isLimited: false,
    options: formData.get("options")?.toString() || ""
  };

  // Create the Product Detail (for individual page)
  const detailPayload = {
    id,
    sku: `SKU-${id.toUpperCase()}`,
    categoryPath: category,
    name,
    price,
    description,
    materials: materials.length > 0 ? materials : ["Standard materials"],
    sustainability: formData.get("sustainability")?.toString() || "Standard production",
    images: [{ src: image, alt: summaryPayload.alt, type: "large" }],
    sizes
  };

  try {
    const batch = adminDb.batch();
    
    // Set summary in "products"
    const summaryRef = adminDb.collection("products").doc(id);
    batch.set(summaryRef, summaryPayload, { merge: true });

    // Set detail in "productDetails"
    const detailRef = adminDb.collection("productDetails").doc(id);
    batch.set(detailRef, detailPayload, { merge: true });

    await batch.commit();

    revalidatePath("/");
    revalidatePath("/admin/catalog");
    revalidatePath(`/product/${id}`);
    
    return { success: true, id };
  } catch (error) {
    console.error("Failed to save catalog item to Firebase:", error);
    return { success: false, error: "Failed to save item" };
  }
}

export async function deleteCatalogItem(id: string) {
  try {
    const batch = adminDb.batch();
    
    batch.delete(adminDb.collection("products").doc(id));
    batch.delete(adminDb.collection("productDetails").doc(id));
    
    await batch.commit();

    revalidatePath("/");
    revalidatePath("/admin/catalog");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete catalog item:", error);
    return { success: false };
  }
}
