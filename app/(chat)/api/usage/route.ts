import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { usageLogs } from "@/lib/db/schema";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Get daily usage
    const dailyResult = await db
      .select({ total: sql<number>`COALESCE(${usageLogs.analysisCount}, 0)` })
      .from(usageLogs)
      .where(and(eq(usageLogs.userId, userId), eq(usageLogs.date, today)))
      .limit(1);

    const dailyUsage = dailyResult[0]?.total || 0;

    // Get monthly usage
    const monthlyResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${usageLogs.analysisCount}), 0)`,
      })
      .from(usageLogs)
      .where(
        and(
          eq(usageLogs.userId, userId),
          sql`to_char(${usageLogs.date}, 'YYYY-MM') = ${currentMonth}`
        )
      );

    const monthlyUsage = monthlyResult[0]?.total || 0;

    // Rate limits
    const dailyLimit = 2;
    const monthlyLimit = 10;

    // Calculate reset time (midnight UTC)
    const resetTime = new Date();
    resetTime.setUTCHours(24, 0, 0, 0);

    return NextResponse.json({
      dailyUsage,
      dailyLimit,
      monthlyUsage,
      monthlyLimit,
      canAnalyze: dailyUsage < dailyLimit && monthlyUsage < monthlyLimit,
      resetTime: resetTime.toISOString(),
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}
