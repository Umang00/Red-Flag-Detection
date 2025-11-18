/**
 * Cloudinary Client for Red Flag Detector
 * Handles image and PDF uploads with auto-deletion configuration
 */

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  bytes: number;
};

/**
 * Upload file to Cloudinary
 * Supports images (JPG, PNG) and PDFs
 * Note: Does NOT store in database - that's handled by the chat API route
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder: string;
    resourceType?: "image" | "raw" | "auto";
  }
): Promise<UploadResult> {
  try {
    const { folder, resourceType = "auto" } = options;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      typeof file === "string"
        ? file
        : `data:image/jpeg;base64,${file.toString("base64")}`,
      {
        folder,
        resource_type: resourceType,
        // Auto-optimization for images
        quality: "auto:good",
        fetch_format: "auto",
        // Allow large files
        chunk_size: 6_000_000, // 6MB chunks
      }
    );

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("[Cloudinary Upload] Error:", error);
    throw new Error(
      `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // Invalidate CDN cache
    });
  } catch (error) {
    console.error("[Cloudinary Delete] Error:", error);
    throw new Error(
      `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Delete multiple files from Cloudinary
 */
export async function deleteMultipleFromCloudinary(
  publicIds: string[],
  resourceType: "image" | "raw" = "image"
): Promise<{ deleted: string[]; failed: string[] }> {
  const deleted: string[] = [];
  const failed: string[] = [];

  for (const publicId of publicIds) {
    try {
      await deleteFromCloudinary(publicId, resourceType);
      deleted.push(publicId);
    } catch (error) {
      console.error(`[Cloudinary Delete] Failed to delete ${publicId}:`, error);
      failed.push(publicId);
    }
  }

  return { deleted, failed };
}

/**
 * Get Cloudinary configuration status
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Validate Cloudinary connection
 */
export async function validateCloudinaryConnection(): Promise<boolean> {
  try {
    if (!isCloudinaryConfigured()) {
      console.error(
        "[Cloudinary] Missing configuration: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET"
      );
      return false;
    }

    // Test connection by pinging Cloudinary API
    await cloudinary.api.ping();
    return true;
  } catch (error) {
    console.error("[Cloudinary] Connection validation failed:", error);
    return false;
  }
}
