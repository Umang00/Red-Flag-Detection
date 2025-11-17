import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/queries";
import { user } from "@/lib/db/schema";
import { sendVerificationEmail } from "@/lib/email/verification";

const ResendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = ResendSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (users.length === 0) {
      // Don't reveal if email exists or not (security)
      return NextResponse.json({
        message:
          "If an account exists with this email, a verification link has been sent.",
      });
    }

    const [foundUser] = users;

    // Check if already verified
    if (foundUser.emailVerified) {
      return NextResponse.json({
        message: "Email already verified. Please sign in.",
      });
    }

    // Generate new token
    const newToken = nanoid(32);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update token and expiry
    await db
      .update(user)
      .set({
        verificationToken: newToken,
        verificationTokenExpiry: tokenExpiry,
      })
      .where(eq(user.id, foundUser.id));

    // Send email
    const emailResult = await sendVerificationEmail(email, newToken);

    if (!emailResult.success) {
      console.error("Failed to resend verification email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Verification email sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
