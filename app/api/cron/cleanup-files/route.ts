/**
 * File Cleanup Cron Job
 * Automatically deletes expired files from Cloudinary
 * Runs daily at 2 AM (configured in vercel.json)
 */

import { type NextRequest, NextResponse } from "next/server";
import { getExpiredFiles, markFileAsDeleted } from "@/lib/db/queries";
import { deleteFromCloudinary } from "@/lib/storage/cloudinary-client";

/**
 * GET /api/cron/cleanup-files
 * Delete expired files from Cloudinary and mark as deleted in database
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify cron secret (security check)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[Cleanup Cron] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("[Cleanup Cron] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cleanup Cron] Starting file cleanup...");

    // 2. Get expired files from database
    const expiredFiles = await getExpiredFiles();

    if (expiredFiles.length === 0) {
      console.log("[Cleanup Cron] No expired files to delete");
      return NextResponse.json({
        success: true,
        message: "No expired files to delete",
        deleted: 0,
        failed: 0,
      });
    }

    console.log(`[Cleanup Cron] Found ${expiredFiles.length} expired files`);

    // 3. Delete files from Cloudinary and mark as deleted
    const results = {
      deleted: [] as string[],
      failed: [] as string[],
    };

    for (const file of expiredFiles) {
      try {
        // Determine resource type from fileType
        const resourceType =
          file.fileType === "application/pdf"
            ? "raw"
            : ("image" as "image" | "raw");

        // Delete from Cloudinary
        await deleteFromCloudinary(file.cloudinaryPublicId, resourceType);

        // Mark as deleted in database
        await markFileAsDeleted({ fileId: file.id });

        results.deleted.push(file.cloudinaryPublicId);
        console.log(`[Cleanup Cron] Deleted: ${file.cloudinaryPublicId}`);
      } catch (error) {
        console.error(
          `[Cleanup Cron] Failed to delete ${file.cloudinaryPublicId}:`,
          error
        );
        results.failed.push(file.cloudinaryPublicId);
      }
    }

    // 4. Return results
    console.log(
      `[Cleanup Cron] Cleanup complete: ${results.deleted.length} deleted, ${results.failed.length} failed`
    );

    return NextResponse.json({
      success: true,
      deleted: results.deleted.length,
      failed: results.failed.length,
      details: results,
    });
  } catch (error) {
    console.error("[Cleanup Cron] Error:", error);
    return NextResponse.json(
      {
        error: `Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
