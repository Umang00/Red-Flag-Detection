# Red Flag Detector: Strategic Implementation Plan to Avoid Boilerplate Issues

## Problem Analysis

Your project is initialized from the Vercel AI Chatbot boilerplate but has **three critical conflicts**:

* **bcrypt Library Mismatch:** Using `bcrypt-ts` (current) vs `bcryptjs` (required by NextAuth)
* **Guest Mode Middleware:** Redirects unauthenticated users to `/api/auth/guest` (conflicts with "no guest mode" requirement)
* **40+ Unused Dependencies:** Causing package resolution conflicts and bloat

## Recommended Approach: Incremental Cleanup (NOT Fresh Start)

---

## Phase 0: Critical Fixes (Stop Errors) — ✅ COMPLETED

**Goal:** Get the project building and running without errors.

### 1. Fix Authentication Library Conflict ✅

* ✅ Removed `bcrypt-ts` from `package.json`
* ✅ Added `bcryptjs` and `@types/bcryptjs`
* ✅ Updated `app/(auth)/auth.ts` imports from `bcrypt-ts` → `bcryptjs`
* ✅ Updated hash/compare function calls

### 2. Fix Middleware Guest Mode ✅

* ✅ Removed guest authentication redirect logic
* ✅ Updated middleware to redirect to `/login` instead of `/api/auth/guest`
* ✅ Removed guest provider from `auth.ts`
* ✅ Added `/verify-email` to middleware whitelist

### 3. Fix Environment Configuration ✅

* ✅ Completely rewrote `.env.example` with all required variables
* ✅ Added Supabase, NextAuth, GitHub OAuth, Resend, Cloudinary, Gemini configs
* ✅ Included detailed comments and free tier limits

### 4. Verify Build Works ✅

* ✅ Ran `pnpm install` (698 packages)
* ✅ Build compiles successfully
* ✅ Dev server runs without errors
* ✅ Basic login flow tested

---

## Phase 1A: Authentication UX & GitHub OAuth — ✅ COMPLETED

**Goal:** Fix authentication user experience and add GitHub OAuth persistence

### 1. Fix Email Verification Flow ✅

* ✅ Added `/verify-email` to middleware whitelist to prevent redirect loop
* ✅ Created dedicated verify-email page with:
  * Professional waiting UI with mail icon
  * Functional resend verification button
  * Spam folder tips (numbered list)
  * Next steps guidance
* ✅ Added signup success toast: "Account created! Please check your email to verify."
* ✅ Redirect to `/verify-email?email=...` after signup (500ms delay)

### 2. Fix Login Navigation Issues ✅

* ✅ Removed `updateSession()` call causing infinite session refresh loop
* ✅ Disabled automatic session polling: `refetchInterval={0} refetchOnWindowFocus={false}`
* ✅ Changed redirect from `router.refresh()` to `router.push("/")`
* ✅ Fixed Fast Refresh continuous rebuilding issue
* ✅ Smooth navigation to homepage after successful login

### 3. Improve Authentication UX ✅

* ✅ Updated toast messages:
  * Login failure: "Invalid email or password!" (security-conscious)
  * Signup success: "Account created! Please check your email to verify."
* ✅ Fixed resend button logic - only show when email not verified
* ✅ Don't show resend button for wrong password
* ✅ Consistent styling on verify-email page (numbered lists, text-sm, left-aligned)

### 4. Add GitHub OAuth with DrizzleAdapter ✅

* ✅ Installed `@auth/drizzle-adapter`
* ✅ Created OAuth database tables:
  * `account` (userId, provider, providerAccountId, tokens)
  * `session` (sessionToken, userId, expires)
  * `verificationToken` (identifier, token, expires)
* ✅ Configured DrizzleAdapter with custom table schema objects
* ✅ Added GitHub provider to NextAuth config
* ✅ Set session strategy to "jwt" explicitly
* ✅ Updated JWT/session callbacks to handle token.id and token.sub fallback
* ✅ Foreign key constraints with cascade deletes

### 5. Database Schema Synchronization ✅

* ✅ Fixed table naming conflicts (PascalCase vs lowercase)
* ✅ Dropped duplicate OAuth tables (Account, Session, VerificationToken)
* ✅ Kept lowercase tables as required by DrizzleAdapter
* ✅ User table remains "User" (PascalCase) with adapter config
* ✅ Fixed migration 0009 to check if column exists before adding
* ✅ Created migration 0010 for OAuth tables
* ✅ Verified database state with inspection scripts

### 6. Verify Everything Works ✅

* ✅ Email/password signup → verify-email page → verification email → login works
* ✅ Email verification required before credentials login
* ✅ Resend verification email functionality works
* ✅ Login navigates smoothly to homepage (no infinite loops)
* ✅ GitHub OAuth ready for testing (adapter configured)
* ✅ No console errors, no Fast Refresh loops
* ✅ Build compiles successfully

---

## Phase 1: Dependency Cleanup — *1 hour*

**Goal:** Remove unused packages causing conflicts

### Remove Boilerplate-Specific Packages (30 packages)

* **AI providers:** `@ai-sdk/gateway`, `@ai-sdk/xai`
* **Editors:** all `@codemirror/*`, all `prosemirror-*`
* **Vercel tools:** `@vercel/blob`, `@vercel/otel`, `@vercel/functions`
* **Unused libs:** `redis`, `tokenlens`, `resumable-stream`, `papaparse`, etc.

### Add Red Flag Detector Dependencies

* `cloudinary` (image storage)
* `browser-image-compression` (client-side compression)
* `react-dropzone` (file upload UI)
* `resend` (email verification)

### Verify Clean Install

* Delete `node_modules/`, `pnpm-lock.yaml`
* Run `pnpm install`
* Ensure **zero peer dependency warnings**

---

## Phase 2: Database Schema Migration — *1.5 hours*

**Goal:** Add Red Flag–specific tables without breaking existing auth

### Keep Existing Tables

* `User`, `Chat`, `Message_v2`
* User table already has email/password — keep it

### Modify Existing Tables

* `Chat`: add `category` and `redFlagScore` columns
* `Message_v2`: modify or simplify

### Add New Tables

* `uploaded_files` (Cloudinary tracking with `auto_delete_at`)
* `usage_logs` (rate limiting: daily/monthly counts)
* `accounts` (OAuth providers for NextAuth)

### Generate and Test Migrations

* `pnpm db:generate`
* Review migration
* `pnpm db:push`
* `pnpm db:studio` (visual check)

---

## Phase 3: File Cleanup — *45 minutes*

**Goal:** Remove unused boilerplate files causing confusion

### Delete Entire Directories

* `tests/` (Playwright tests)
* `lib/ai/tools/` (document creation, weather, etc.)
* `artifacts/` (if exists)

### Delete Unused Components (20+ files)

* All `artifact*.tsx` files (8 files)
* `code-editor.tsx`, `console.tsx`, `diffview.tsx`
* All `document*.tsx`
* `elements/branch.tsx`

### Delete Config Files

* `playwright.config.ts`

---

## Phase 4: Environment Configuration — *20 minutes*

**Goal:** Complete `.env.local` setup

### Update `.env.example`

Add:

* `GOOGLE_AI_API_KEY`
* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
* `RESEND_API_KEY`
* `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
* `CRON_SECRET`, `FILE_RETENTION_DAYS`

### Create Working `.env.local`

* Copy template
* Fill in actual API keys
* Verify all required vars

---

## Phase 5: API Route Refactoring — *2 hours*

**Goal:** Adapt existing routes for Red Flag Detector use case

### Modify `/api/chat/route.ts`

* Remove tool definitions (weather, documents)
* Remove tokenlens usage
* Add category detection logic
* Add red flag analysis prompt
* Store analysis results in database

### Create `/api/upload/route.ts`

* Integrate Cloudinary upload
* Validate file type and size
* Add compression
* Store metadata in `uploaded_files`

### Create `/api/usage/route.ts`

* Check daily/monthly limits
* Return usage stats

### Delete Unused Routes

* `/api/document/route.ts`
* `/api/suggestions/route.ts`
* `/api/vote/route.ts`

---

## Phase 6: Component Simplification — *2 hours*

**Goal:** Adapt chat UI for file upload + analysis display

### Modify Chat Components

* `chat.tsx`: remove document/artifact logic
* Add file staging area
* Add category selector

### Create Red Flag Components

* `red-flag-score-card.tsx`
* `file-staging-area.tsx`
* `category-selector.tsx`

### Keep Useful Components

* `auth-form.tsx`
* `chat-header.tsx`
* All `ui/*` components

---

## Alternative Approach: Fresh Start (If Current Bloat Too High)

**When to Consider:** If cleanup takes > 8 hours or breaks too many things

### Approach

* Clone Next.js 15 + TypeScript template
* Copy only:

  * Database schema (`lib/db/schema.ts`)
  * Auth config (`app/(auth)/auth.ts` after bcrypt fix)
  * shadcn UI components
* Add dependencies gradually

**Pros:** Clean slate, no hidden issues
**Cons:** Lose 2–3 days of setup work

---

## Recommended Decision Tree

**START:** Can you get build working in <2 hours?

```
YES → Incremental Cleanup (Phases 0–6)
│   Estimated: 8–10 hours
│
NO → Fresh Start Alternative
    Estimated: 12–15 hours
```

---

## My Recommendation: Incremental Cleanup

**Why:**

* Database schema already set properly
* NextAuth v5 working (needs bcrypt fix)
* Tailwind v4 + shadcn configured well
* 60% of boilerplate is usable

**Status:** ✅ Approach validated - Phase 0 and Phase 1A completed successfully

---

## Progress Summary

### ✅ Completed Phases:
- **Phase 0:** Critical fixes (bcrypt, guest mode, environment, build verification)
- **Phase 1A:** Authentication UX & GitHub OAuth (email verification flow, login navigation, DrizzleAdapter, database sync)

### 🔄 Next Phases:
- **Phase 1:** Dependency cleanup (remove unused packages)
- **Phase 2:** Database schema migration (add Red Flag tables)
- **Phase 3:** File cleanup (delete boilerplate files)
- **Phase 4-6:** API routes, components, etc.

---

## Key Success Factors

* ✅ Fix bcrypt first
* ✅ Remove middleware guest mode second
* Clean dependencies third (next)
* ✅ Test `pnpm build` at every phase

## Risk Mitigation

* ✅ Commit after each phase
* Keep backups before major deletions