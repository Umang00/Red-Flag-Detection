"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-8 rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {/* Email Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Email</title>
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="font-semibold text-2xl dark:text-zinc-50">
            Check your email
          </h1>

          <p className="text-gray-600 text-sm dark:text-zinc-400">
            We sent a verification link to <br />
            <span className="font-semibold text-gray-800 dark:text-zinc-200">
              {email}
            </span>
          </p>

          <div className="mt-2 rounded-lg bg-blue-50 p-4 text-left dark:bg-blue-950/30">
            <p className="text-blue-900 text-sm dark:text-blue-200">
              <strong>Next steps:</strong>
            </p>
            <ol className="mt-2 ml-4 list-decimal space-y-1 text-blue-800 text-sm dark:text-blue-300">
              <li>Open your email inbox</li>
              <li>Click the verification link we sent</li>
              <li>Come back here to sign in</li>
            </ol>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-gray-500 text-xs dark:text-zinc-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                className="font-semibold text-primary hover:underline"
                type="button"
              >
                resend verification email
              </button>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground text-sm hover:bg-primary/90"
            href="/login"
          >
            Back to Login
          </Link>

          <Link
            className="text-center text-gray-600 text-sm hover:underline dark:text-zinc-400"
            href="/"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
