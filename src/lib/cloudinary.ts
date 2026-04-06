import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import type { ProductMedia, ProductMediaResourceType } from "@/types/product-media";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function sanitizeFolderSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "") || "catalog";
}

function sanitizePublicIdSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "") || "asset";
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function getCloudinaryProductFolder(category: string) {
  return `layana/products/${sanitizeFolderSegment(category)}`;
}

export function buildCloudinaryVideoPosterUrl(publicId: string) {
  return cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
    format: "jpg",
  });
}

function normalizeResourceType(value: string | undefined): ProductMediaResourceType {
  return value === "video" ? "video" : "image";
}

function buildMediaType(index: number) {
  if (index === 1 || index === 2) {
    return "half";
  }

  return "large";
}

function uploadBuffer(
  buffer: Buffer,
  options: {
    folder: string;
    publicIdBase: string;
  }
) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: `${options.publicIdBase}-${randomUUID().slice(0, 8)}`,
        resource_type: "auto",
        invalidate: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function uploadProductMedia(
  file: File,
  options: {
    category: string;
    productId: string;
    position: number;
    altBase: string;
  }
): Promise<ProductMedia> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    throw new Error("Only image and video uploads are supported.");
  }

  const folder = getCloudinaryProductFolder(options.category);
  const publicIdBase = `${sanitizePublicIdSegment(options.productId)}-${sanitizePublicIdSegment(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadResult = await uploadBuffer(buffer, {
    folder,
    publicIdBase,
  });

  const resourceType = normalizeResourceType(uploadResult.resource_type);
  const poster =
    resourceType === "video" ? buildCloudinaryVideoPosterUrl(uploadResult.public_id) : undefined;

  return {
    src: uploadResult.secure_url,
    alt: `${options.altBase} ${options.position + 1}`,
    type: buildMediaType(options.position),
    resourceType,
    publicId: uploadResult.public_id,
    poster,
    format: uploadResult.format,
    width: uploadResult.width,
    height: uploadResult.height,
    bytes: uploadResult.bytes,
    duration: typeof uploadResult.duration === "number" ? uploadResult.duration : undefined,
  };
}

export async function deleteCloudinaryAsset(asset: {
  publicId?: string;
  resourceType?: string;
}) {
  if (!isCloudinaryConfigured() || !asset.publicId) {
    return;
  }

  await cloudinary.uploader.destroy(asset.publicId, {
    resource_type: asset.resourceType === "video" ? "video" : "image",
    invalidate: true,
  });
}

export async function uploadHeroImage(file: File): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported for the hero image.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const publicIdBase = `hero-${randomUUID().slice(0, 8)}`;

  const result = await uploadBuffer(buffer, {
    folder: "layana/site",
    publicIdBase,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
