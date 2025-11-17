import { eq } from "drizzle-orm";
import { db } from "@/lib/db/queries";
import { user } from "@/lib/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verification Error</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <h1 class="error">⚠️ Invalid Verification Link</h1>
            <p>The verification link is invalid or missing the verification token.</p>
            <a href="/login">Return to Login</a>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Find user by verification token
    const users = await db
      .select()
      .from(user)
      .where(eq(user.verificationToken, token))
      .limit(1);

    if (users.length === 0) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verification Error</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { color: #dc2626; }
            </style>
          </head>
          <body>
            <h1 class="error">⚠️ Invalid or Expired Link</h1>
            <p>This verification link is invalid or has already been used.</p>
            <a href="/login">Return to Login</a>
          </body>
        </html>
        `,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    const [foundUser] = users;

    // Check if already verified
    if (foundUser.emailVerified) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Already Verified</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .success { color: #059669; }
            </style>
          </head>
          <body>
            <h1 class="success">✓ Email Already Verified</h1>
            <p>Your email has already been verified. You can sign in now.</p>
            <a href="/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 6px;">Go to Login</a>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Mark email as verified and clear verification token
    await db
      .update(user)
      .set({
        emailVerified: new Date(),
        verificationToken: null,
      })
      .where(eq(user.id, foundUser.id));

    // Redirect to login with success message
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email Verified</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { color: #059669; }
            .countdown { font-size: 14px; color: #6b7280; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1 class="success">✓ Email Verified Successfully!</h1>
          <p>Your email has been verified. You can now sign in to your account.</p>
          <p class="countdown">Redirecting to login in <span id="timer">3</span> seconds...</p>
          <a href="/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 6px;">Go to Login</a>

          <script>
            let seconds = 3;
            const timer = document.getElementById('timer');
            const countdown = setInterval(() => {
              seconds--;
              timer.textContent = seconds;
              if (seconds <= 0) {
                clearInterval(countdown);
                window.location.href = '/login?verified=true';
              }
            }, 1000);
          </script>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verification Error</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">⚠️ Verification Failed</h1>
          <p>An error occurred while verifying your email. Please try again or contact support.</p>
          <a href="/login">Return to Login</a>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
