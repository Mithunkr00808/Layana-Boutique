"use server";

import { v2 as cloudinary } from "cloudinary";
import { assertAdminSession } from "@/lib/auth/admin-session";

// Configuration is already initialized in @/lib/cloudinary usually, 
// but we'll ensure it here for the signature utility
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type SignatureResponse = {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
};

/**
 * Generates a secure signature for client-side Cloudinary uploads.
 * This ensures only authenticated admins can upload to the boutique's Cloudinary account.
 */
export async function getCloudinarySignature(params: { folder: string }): Promise<SignatureResponse> {
  await assertAdminSession();

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Cloudinary signatures for the upload endpoint usually only sign 
  // alphabetical non-file parameters. 
  const paramsToSign = {
    folder: params.folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
  };
}
