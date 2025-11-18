/**
 * Client-Side Image Compression for Red Flag Detector
 * Compresses large images before upload to reduce bandwidth and storage costs
 */

import imageCompression from "browser-image-compression";

// Compression configuration
const COMPRESSION_CONFIG = {
  // Only compress if file is larger than this (in bytes)
  minSizeToCompress: 10 * 1024 * 1024, // 10 MB

  // Target size after compression (in MB)
  maxSizeMB: 5,

  // Max width/height
  maxWidthOrHeight: 2560,

  // Quality (0-1, where 1 is best quality)
  initialQuality: 0.85,

  // Use web worker for better performance
  useWebWorker: true,

  // File type to convert to (preserve original by default)
  fileType: undefined, // Will preserve original type
} as const;

export type CompressionResult = {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasCompressed: boolean;
};

/**
 * Compress image if it exceeds size threshold
 * Returns original file if:
 * - File is below size threshold
 * - File is not an image
 * - Compression fails
 */
export async function compressIfNeeded(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false,
    };
  }

  // Check if file is below threshold
  if (file.size < COMPRESSION_CONFIG.minSizeToCompress) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false,
    };
  }

  // Compress the image
  try {
    console.log(
      `[Image Compression] Compressing ${file.name} (${formatBytes(originalSize)})`
    );

    const compressedFile = await imageCompression(file, {
      maxSizeMB: COMPRESSION_CONFIG.maxSizeMB,
      maxWidthOrHeight: COMPRESSION_CONFIG.maxWidthOrHeight,
      initialQuality: COMPRESSION_CONFIG.initialQuality,
      useWebWorker: COMPRESSION_CONFIG.useWebWorker,
      fileType: COMPRESSION_CONFIG.fileType,
    });

    const compressedSize = compressedFile.size;
    const compressionRatio = compressedSize / originalSize;

    console.log(
      `[Image Compression] Compressed ${file.name}: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${(compressionRatio * 100).toFixed(1)}%)`
    );

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      wasCompressed: true,
    };
  } catch (error) {
    console.error(
      `[Image Compression] Failed to compress ${file.name}:`,
      error
    );

    // Return original file if compression fails
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false,
    };
  }
}

/**
 * Compress multiple images in parallel
 */
export function compressMultiple(files: File[]): Promise<CompressionResult[]> {
  return Promise.all(files.map((file) => compressIfNeeded(file)));
}

/**
 * Validate file type
 * Allowed: JPG, PNG, PDF
 */
export function isValidFileType(file: File): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * Max: 100 MB per file
 */
export function isValidFileSize(file: File, maxSizeMB = 100): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file (type + size)
 */
export function validateFile(
  file: File,
  maxSizeMB = 100
): { valid: boolean; error?: string } {
  if (!isValidFileType(file)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Only JPG, PNG, and PDF are allowed.`,
    };
  }

  if (!isValidFileSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: `File too large: ${formatBytes(file.size)}. Maximum size is ${maxSizeMB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: File[],
  maxFiles = 5,
  maxSizeMB = 100
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check file count
  if (files.length > maxFiles) {
    errors.push(`Too many files: ${files.length}. Maximum is ${maxFiles}.`);
    return { valid: false, errors };
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file, maxSizeMB);
    if (!result.valid && result.error) {
      errors.push(`${file.name}: ${result.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
