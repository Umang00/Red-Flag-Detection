// Resumable streams are disabled (no Redis)
// This endpoint returns 204 to indicate stream resumption is not available
export async function GET() {
  return new Response(null, { status: 204 });
}
