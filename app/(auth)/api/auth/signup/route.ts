import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/queries";
import { user } from "@/lib/db/schema";
import { sendVerificationEmail } from "@/lib/email/verification";

const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  name: z.string().min(1, "Name is required").max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = SignupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password (10 rounds as per boilerplate)
    const hashedPassword = await hash(password, 10);

    // Generate verification token
    const verificationToken = nanoid(32);

    // Create user
    const [newUser] = await db
      .insert(user)
      .values({
        email,
        password: hashedPassword,
        name: name || null,
        verificationToken,
        emailVerified: null, // Not verified yet
      })
      .returning();

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Note: User is still created, they can request a new verification email
    }

    return NextResponse.json({
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account.",
      userId: newUser.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
