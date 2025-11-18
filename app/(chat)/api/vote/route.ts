import { auth } from "@/app/(auth)/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Stub API route for voting functionality
 * Red Flag Detector doesn't use voting, but the boilerplate UI expects this endpoint
 * TODO: Remove this in Phase 4 when we replace the chat UI
 */

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return empty votes array (voting not implemented for Red Flag Detector)
  return NextResponse.json([]);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Silently ignore vote requests (voting not implemented for Red Flag Detector)
  return NextResponse.json({ success: true });
}
