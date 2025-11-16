# TODO: Red Flag Detector MVP Implementation

## Pre-Development Setup

### 0.1 Repository Setup
- [x] Clone Vercel AI Chatbot boilerplate
  ```bash
  git clone https://github.com/vercel/ai-chatbot.git red-flag-detector
  cd red-flag-detector
  git remote remove origin
  git remote add origin [YOUR_REPO_URL]
  ```

- [x] **Add our custom dependencies**
  ```bash
  pnpm add @ai-sdk/google cloudinary browser-image-compression react-dropzone bcryptjs resend nanoid
  ```
  
  **Note:** `bcryptjs` provides its own TypeScript types, so `@types/bcryptjs` is not needed (it's deprecated).

- [x] **Remove packages we don't need**
  ```bash
  pnpm remove @ai-sdk/gateway @ai-sdk/xai @codemirror/lang-javascript @codemirror/lang-python @codemirror/state @codemirror/theme-one-dark @codemirror/view prosemirror-example-setup prosemirror-inputrules prosemirror-markdown prosemirror-model prosemirror-schema-basic prosemirror-schema-list prosemirror-state prosemirror-view @vercel/blob @vercel/otel @vercel/functions @opentelemetry/api @opentelemetry/api-logs redis tokenlens resumable-stream streamdown papaparse react-data-grid react-resizable-panels react-syntax-highlighter shiki katex diff-match-patch orderedmap embla-carousel-react swr use-stick-to-bottom codemirror @icons-pack/react-simple-icons radix-ui fast-deep-equal bcrypt-ts dotenv
  ```
  
  **Note:** We're replacing `bcrypt-ts` with `bcryptjs` for better compatibility with NextAuth.js credentials provider.

- [x] **Remove their test suite**
  ```bash
  rm -rf tests/
  rm -f playwright.config.ts
  ```

- [x] **Update package.json scripts**
  
  Updated `package.json` scripts section:
  
  ```json
  "scripts": {
    "dev": "next dev --turbo",
    "build": "tsx lib/db/migrate && next build",
    "start": "next start",
    "lint": "npx ultracite@latest check",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "npx tsx lib/db/migrate.ts",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push"
  }
  ```
  
  **Removed:**
  - `test` script (deleted tests)
  - `format` script (removed per TODO, but can add back if needed: `"format": "npx ultracite@latest fix"`)
  - Unused db scripts (`db:pull`, `db:check`, `db:up`) - removed for MVP simplicity

- [ ] **Install dependencies**
  ```bash
  pnpm install
  ```

- [ ] **Verify it runs**
  ```bash
  pnpm dev
  ```
  
  Visit `http://localhost:3000` - should load successfully

- [ ] **Create .env.local** (continue with section 0.2...)

### 0.2 Get API Keys & Credentials ✅

#### Gemini API (Google AI Studio)
- [x] Go to https://aistudio.google.com/apikey
- [x] Create new API key
- [x] Add to `.env.local`: `GOOGLE_AI_API_KEY=***`

#### Cloudinary
- [x] Go to https://cloudinary.com/users/register_free
- [x] Get cloud name, API key, API secret from dashboard
- [x] Add to `.env.local`:
  ```
  CLOUDINARY_CLOUD_NAME=***
  CLOUDINARY_API_KEY=***
  CLOUDINARY_API_SECRET=***
  ```

#### Resend (Email Service for Verification)
- [x] Go to https://resend.com/signup
- [x] Create free account (3,000 emails/month free tier)
- [x] Go to API Keys section
- [x] Create new API key
- [x] Copy API key
- [x] Add to `.env.local`:
  ```
  RESEND_API_KEY=re_xxx
  ```
  
  **Note:** For production, you'll need to:
  - Verify your domain (optional but recommended)
  - Update "from" email in verification email function

#### GitHub OAuth (for NextAuth.js)
- [x] Go to https://github.com/settings/developers
- [x] Click "OAuth Apps" (not "GitHub Apps")
- [x] Click "New OAuth App"
- [x] Fill in application details:
  - Application name: "Red Flag Detector"
  - Homepage URL: `http://localhost:3000` (update to production URL later)
  - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
- [x] Click "Register application"
- [x] Copy the Client ID
- [x] Click "Generate a new client secret"
- [x] Copy the client secret (you can only see it once!)
- [x] Add to `.env.local`:
  ```
  GITHUB_CLIENT_ID=***
  GITHUB_CLIENT_SECRET=***
  ```
  
  **Note:** For production, update the OAuth app settings with:
  - Homepage URL: `https://yourdomain.com`
  - Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`


#### Supabase PostgreSQL (via Vercel Integration)
**✅ Already done!** Vercel Integration auto-configured everything.

**Verify your setup:**
- [x] Go to Vercel Dashboard → Your Project → Storage
- [x] You should see Supabase connected
- [x] Go to Vercel Dashboard → Settings → Environment Variables
- [x] Verify these exist:
  - `POSTGRES_URL`
  - `POSTGRES_PRISMA_URL`
  - `POSTGRES_URL_NON_POOLING`

**Copy to local `.env.local`:**
- [x] Copy all `POSTGRES_*` variables from Vercel dashboard
- [x] Paste into your local `.env.local` file

**Note:** We're using Supabase as a standard PostgreSQL database with NextAuth.js, NOT Supabase Auth.

#### NextAuth.js Setup
- [x] Generate NextAuth secret:
  ```bash
  openssl rand -base64 32
  ```
- [x] Add to `.env.local`:
  ```
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=[generated-secret]
  ```

#### Cron Secret (for file cleanup)
- [x] Generate random secret:
  ```bash
  openssl rand -hex 32
  ```
- [x] Add to `.env.local`: `CRON_SECRET=***`

#### Vercel Analytics (optional but recommended)
- [x] Enable Vercel Analytics in dashboard (free tier)
- [x] No additional setup required (auto-configured)

### 0.3 Complete `.env.local` Template

```bash
# Database (Supabase PostgreSQL via Vercel Integration)
POSTGRES_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
POSTGRES_PRISMA_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# Auth (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=***
GITHUB_CLIENT_ID=***
GITHUB_CLIENT_SECRET=***

# Email Service (Resend)
RESEND_API_KEY=re_xxx

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=***
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***

# AI (Gemini)
GOOGLE_AI_API_KEY=***

# Cron (File Cleanup)
CRON_SECRET=***

# File Retention (days)
FILE_RETENTION_DAYS=7
```

---

## Phase 1: Database & Authentication (Week 1, Days 1-2)

### 1.1 Database Schema Setup

- [ ] Install Drizzle ORM
  ```bash
  pnpm add drizzle-orm @vercel/postgres
  pnpm add -D drizzle-kit tsx
  ```

- [ ] Create schema file: `lib/db/schema.ts`
  - [ ] Define `users` table (extend NextAuth defaults)
  - [ ] Define `accounts` table (for OAuth)
  - [ ] Define `conversations` table (add category, red_flag_score)
  - [ ] Define `messages` table (add red_flag_data JSONB column)
  - [ ] Define `uploaded_files` table (Cloudinary references)
  - [ ] Define `usage_logs` table (rate limiting)
  - [ ] Add indexes:
    - `idx_conversations_user_id`
    - `idx_conversations_created_at`
    - `idx_messages_conversation_id`
    - `idx_usage_logs_user_date`
    - `idx_uploaded_files_auto_delete`

- [ ] Generate migration file
  ```bash
  pnpm db:generate
  # or: npx drizzle-kit generate
  ```
  - [ ] Review generated migration in `drizzle/migrations/`
  - [ ] Ensure schema matches ARCHITECTURE.md section 4.2

- [ ] Run migration
  ```bash
  pnpm db:push
  # or: npx drizzle-kit push
  ```

- [ ] Verify indexes were created correctly
  ```bash
  pnpm db:studio
  # or: npx drizzle-kit studio
  # Check that all indexes from schema exist
  ```

- [ ] Create query functions: `lib/db/queries.ts`
  - [ ] `getUserDailyUsage(userId: string)`
  - [ ] `getUserMonthlyUsage(userId: string, month: string)`
  - [ ] `incrementUsage(userId: string)`
  - [ ] `getUserConversations(userId: string)`
  - [ ] `getConversationById(id: string)`
  - [ ] `createConversation(userId, title, category)`
  - [ ] `createMessage(conversationId, role, content, redFlagData?)`
  - [ ] `getExpiredFiles()`
  - [ ] `markFileAsDeleted(fileId: string)`

### 1.2 Authentication Setup

- [ ] Install required dependencies
  ```bash
  pnpm add bcryptjs resend nanoid
  pnpm add -D @types/bcryptjs
  ```

- [ ] Update database schema: `lib/db/schema.ts`
  - [ ] Add `password` field to users table (text, nullable)
  - [ ] Add `verificationToken` field to users table (text, nullable)
  - [ ] Generate migration: `pnpm db:generate`
  - [ ] Run migration: `pnpm db:push`

- [ ] Create NextAuth.js configuration: `lib/auth/auth-config.ts`
  - [ ] GitHubProvider configured
  - [ ] CredentialsProvider configured (for email/password)
  - [ ] DrizzleAdapter connected to Supabase PostgreSQL
  - [ ] Session strategy set to 'jwt' (required for credentials)
  - [ ] Session callback includes user.id
  - [ ] SignIn callback checks email verification for credentials
  - [ ] Pages configured (signIn, verifyRequest, error)

- [ ] Create signup API route: `app/api/auth/signup/route.ts`
  - [ ] Validate email and password
  - [ ] Check if user already exists
  - [ ] Hash password with bcryptjs
  - [ ] Generate verification token (nanoid)
  - [ ] Create user in database
  - [ ] Send verification email via Resend
  - [ ] Return success message

- [ ] Create email verification handler: `app/api/auth/verify-email/route.ts`
  - [ ] Extract token from query params
  - [ ] Find user by verification token
  - [ ] Mark email as verified
  - [ ] Clear verification token
  - [ ] Redirect to login with success message

- [ ] Create email service: `lib/email/verification.ts`
  - [ ] Initialize Resend client
  - [ ] Create `sendVerificationEmail()` function
  - [ ] Build verification URL
  - [ ] Send email with verification link
  - [ ] Handle errors gracefully

- [ ] Verify API route exists: `app/api/auth/[...nextauth]/route.ts`
  ```typescript
  import { handlers } from '@/lib/auth/auth-config';
  export const { GET, POST } = handlers;
  ```

- [ ] Create/update login page: `app/(auth)/login/page.tsx`
  - [ ] Email/password form (signup and login toggle)
  - [ ] GitHub sign-in button
  - [ ] Email verification status messages
  - [ ] Error handling and display
  - [ ] Branding (logo, tagline)
  - [ ] Mobile-responsive layout

- [ ] Create email verification page: `app/(auth)/verify-email/page.tsx`
  - [ ] Display "Check your email" message
  - [ ] Show email address
  - [ ] Resend verification email button
  - [ ] Link back to login

- [ ] Test authentication flow
  - [ ] Sign up with email/password
  - [ ] Receive verification email
  - [ ] Click verification link
  - [ ] Sign in with email/password (after verification)
  - [ ] Sign in with GitHub (dev mode)
  - [ ] Check user records created in Supabase database
  - [ ] Verify email verification status in database
  - [ ] Session persists across page refreshes
  - [ ] Test error cases (invalid password, unverified email, etc.)

**Database:** NextAuth.js automatically creates these tables in Supabase:
- `users` (with password and verificationToken fields)
- `accounts` (for OAuth providers)
- `sessions`
- `verification_tokens`

**Connection:** Uses `POSTGRES_URL` from Supabase integration.

### 1.3 Email Verification
**Implemented for MVP** - Email/password users must verify their email before signing in.

**Email Verification Flow:**
1. User signs up with email/password
2. Verification email sent via Resend
3. User clicks verification link
4. Email marked as verified in database
5. User can now sign in

**GitHub OAuth:** No verification needed - GitHub pre-verifies emails.

**Planned for V1.1:**
- [ ] Password reset functionality
- [ ] Resend verification email feature
- [ ] Welcome emails (optional)
- [ ] Notification emails (weekly digests, etc.)

## Phase 2: Core AI Integration (Week 1, Days 3-4)

### 2.1 Gemini Client Setup

- [ ] Install Google Generative AI SDK (AI SDK v5)
  ```bash
  pnpm add @ai-sdk/google @ai-sdk/react @ai-sdk/provider ai
  ```
  
  **Note:** AI SDK v5 requires separate `@ai-sdk/react` package for React hooks.

- [ ] Create Gemini wrapper: `lib/ai/gemini-client.ts`
  - [ ] Initialize GoogleGenerativeAI with API key
  - [ ] Create `analyzeWithGemini()` function
    - Takes: category, messages[], imageUrls[]
    - Returns: AnalysisResult (JSON + explanation)
  - [ ] Handle streaming responses
  - [ ] Parse JSON from Gemini output
  - [ ] Error handling (API errors, rate limits, parsing errors)

- [ ] Create retry wrapper: `analyzeWithRetry()` function
  - [ ] Wrap `analyzeWithGemini()` with retry logic
  - [ ] 3 attempts with exponential backoff (1s, 3s, 5s)
  - [ ] Only retry transient errors (timeout, rate limit, 5xx)
  - [ ] Don't retry permanent errors (invalid input, 4xx)
  - [ ] On final failure:
    - Log error details for debugging
    - Return user-friendly error: "AI temporarily unavailable. Please try again later."
    - Optionally save failed request for manual review
  - [ ] Export as main function for API routes to use

- [ ] Test Gemini client
  - [ ] Single text-only analysis
  - [ ] Analysis with 1 image
  - [ ] Analysis with 5 images
  - [ ] Verify JSON parsing works
  - [ ] Check error handling

### 2.2 Prompt Engineering

- [ ] Create base system prompt: `lib/ai/prompts/base-prompt.ts`
  - [ ] Copy from ARCHITECTURE.md section 5.2
  - [ ] Define personality, process, output format
  - [ ] Emphasis on blunt, helpful tone

- [ ] Create category-specific prompts:
  - [ ] `lib/ai/prompts/dating-prompt.ts` (copy from ARCHITECTURE.md)
  - [ ] `lib/ai/prompts/conversations-prompt.ts`
  - [ ] `lib/ai/prompts/jobs-prompt.ts`
  - [ ] `lib/ai/prompts/housing-prompt.ts`
  - [ ] `lib/ai/prompts/marketplace-prompt.ts`

- [ ] Create prompt builder: `lib/ai/prompts/build-prompt.ts`
  - [ ] Function: `buildPrompt(category, userContext?)`
  - [ ] Combines base + category-specific
  - [ ] Adds user context if provided

- [ ] Test each category prompt
  - [ ] Dating profile analysis (realistic example)
  - [ ] Conversation thread (realistic example)
  - [ ] Job posting analysis
  - [ ] Housing ad analysis
  - [ ] Marketplace listing analysis
  - [ ] Verify JSON output matches expected schema

### 2.3 Auto-Category Detection

- [ ] Create detection function: `lib/ai/category-detection.ts`
  - [ ] `detectCategory(content, imageUrls?)`
  - [ ] Returns: `{ category, confidence }`
  - [ ] Uses Gemini to classify content
  - [ ] Fallback to 'general' if confidence <0.7

- [ ] Test category detection
  - [ ] Dating profile → should detect 'dating'
  - [ ] Job posting → should detect 'jobs'
  - [ ] Message thread → should detect 'conversations'
  - [ ] Ambiguous content → should return 'general'

---

## Phase 3: File Upload & Storage (Week 1, Days 5-6)

### 3.1 Cloudinary Integration

- [ ] Install Cloudinary SDK
  ```bash
  pnpm add cloudinary
  ```

- [ ] Create Cloudinary client: `lib/storage/cloudinary-client.ts`
  - [ ] Configure with credentials
  - [ ] `uploadToCloudinary(file, folder)` function
  - [ ] `deleteFromCloudinary(publicId)` function
  - [ ] Auto-optimization settings (quality, fetch_format)
  - [ ] Note: All uploads proxied through API route (no CORS needed)

- [ ] Test Cloudinary upload
  - [ ] Upload image → get URL
  - [ ] Verify accessible
  - [ ] Upload PDF → get URL
  - [ ] Delete file → verify deleted

### 3.2 Client-Side Image Compression

- [ ] Install compression library
  ```bash
  pnpm add browser-image-compression
  ```

- [ ] Create compression utility: `lib/storage/image-compression.ts`
  - [ ] `compressIfNeeded(file)` function
  - [ ] Only compress if >10 MB
  - [ ] Target: 5 MB max, 2560px, 85% quality
  - [ ] Handle compression errors gracefully

- [ ] Test compression
  - [ ] 15 MB image → compresses to ~5 MB
  - [ ] 3 MB image → no compression (passthrough)
  - [ ] Check quality acceptable

### 3.3 Upload API Route

- [ ] Create API route: `app/api/upload/route.ts`
  - [ ] POST handler
  - [ ] Verify authentication
  - [ ] Validate file types (JPG, PNG, PDF)
  - [ ] Validate file sizes (<100 MB)
  - [ ] Rate limit: 20 uploads/minute
  - [ ] Compress large files
  - [ ] Upload to Cloudinary
  - [ ] Store file record in database (with auto_delete_at)
  - [ ] Return Cloudinary URLs + file IDs

- [ ] Test upload API
  - [ ] Upload 1 file → success
  - [ ] Upload 5 files → success
  - [ ] Upload 6 files → error (over limit)
  - [ ] Upload 150 MB file → error (too large)
  - [ ] Upload .exe file → error (invalid type)

### 3.4 File Auto-Deletion Cron Job

- [ ] Create cron route: `app/api/cron/cleanup-files/route.ts`
  - [ ] Verify cron secret
  - [ ] Get retention period from env (FILE_RETENTION_DAYS, default: 7)
  - [ ] Query expired files (auto_delete_at < now)
  - [ ] Delete from Cloudinary
  - [ ] Mark as deleted in database
  - [ ] Log results (count deleted, any errors)

- [ ] Configure Vercel Cron: `vercel.json`
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/cleanup-files",
        "schedule": "0 2 * * *"
      }
    ]
  }
  ```

- [ ] Test cron job manually
  - [ ] Create file with past auto_delete_at
  - [ ] Call cron endpoint
  - [ ] Verify file deleted from Cloudinary
  - [ ] Verify database record marked deleted

---

## Phase 4: Chat Interface & UI (Week 2, Days 1-3)

### 4.0 Testing Framework Setup

- [ ] Install testing dependencies
  ```bash
  pnpm add -D @playwright/test @testing-library/react @testing-library/jest-dom vitest jsdom
  ```

- [ ] Configure Vitest for unit tests: `vitest.config.ts`
  - [ ] Setup JSDOM environment
  - [ ] Configure path aliases
  - [ ] Add test scripts to package.json

- [ ] Configure Playwright for E2E tests: `playwright.config.ts`
  - [ ] Setup test browsers (chromium, firefox, webkit)
  - [ ] Configure base URL
  - [ ] Set up test directory structure

- [ ] Create test utilities: `tests/utils/test-helpers.ts`
  - [ ] Mock authentication
  - [ ] Mock API responses
  - [ ] Database seeding helpers

### 4.1 Category Selection Component

- [ ] Create: `components/chat/category-selector.tsx`
  - [ ] Horizontal scrollable buttons (mobile)
  - [ ] Grid layout (desktop)
  - [ ] Icons + labels for each category
  - [ ] Selected state styling
  - [ ] Clear/change category button
  - [ ] TypeScript props interface

- [ ] Style category selector
  - [ ] Mobile: horizontal scroll, large tap targets
  - [ ] Desktop: centered grid
  - [ ] Selected state: primary color, bold
  - [ ] Icons: emoji or lucide-react icons

- [ ] Test category selector
  - [ ] Renders all 5 categories
  - [ ] Click to select works
  - [ ] Can change selection
  - [ ] Mobile scroll works smoothly

### 4.2 File Staging Area

- [ ] Install react-dropzone
  ```bash
  pnpm add react-dropzone
  ```

- [ ] Create: `components/upload/file-staging-area.tsx`
  - [ ] Drag-drop zone
  - [ ] File preview grid
  - [ ] Individual file cards with:
    - Thumbnail/icon
    - Filename
    - File size
    - Remove button
    - Upload progress
  - [ ] Reorder files (drag-drop)
  - [ ] "Analyze" button (disabled until files uploaded)
  - [ ] Max files indicator (X/5)

- [ ] Create: `components/upload/file-preview-card.tsx`
  - [ ] Image thumbnail
  - [ ] PDF icon placeholder
  - [ ] File name + size
  - [ ] Upload status (pending/uploading/uploaded/error)
  - [ ] Remove button

- [ ] Test file staging
  - [ ] Drag-drop files → appear in staging
  - [ ] Click to add files → works
  - [ ] Remove file → updates state
  - [ ] Reorder files → updates order
  - [ ] Upload progress shows correctly

### 4.3 Red Flag Score Card Component

- [ ] Create: `components/analysis/red-flag-score-card.tsx`
  - [ ] Large score display (0-10)
  - [ ] Color-coded (red: 7+, yellow: 4-6, green: 0-3)
  - [ ] Verdict text
  - [ ] Summary one-liner
  - [ ] Expandable flag sections:
    - 🔴 Critical flags
    - 🟡 Warnings
    - 🟢 Notices
  - [ ] Each flag shows:
    - Category label
    - Evidence (quoted text)
    - Explanation
    - Context (if provided)
  - [ ] Positives section (if any)
  - [ ] Advice section
  - [ ] Share button

- [ ] Create: `components/analysis/flag-detail.tsx`
  - [ ] Severity icon (🔴🟡🟢)
  - [ ] Category badge
  - [ ] Evidence card (quoted text, styled)
  - [ ] Explanation paragraph
  - [ ] Collapsible context

- [ ] Style score card
  - [ ] Mobile-first: full width, collapsible sections
  - [ ] Score: large, centered, color-coded background
  - [ ] Accordion for flags (expand/collapse)
  - [ ] Share button: sticky at bottom on mobile

- [ ] Test score card
  - [ ] Renders with sample data
  - [ ] Expand/collapse flags works
  - [ ] Colors match severity
  - [ ] Mobile layout looks good
  - [ ] Desktop layout looks good

### 4.4 Chat Interface Modifications

- [ ] Modify: `components/chat/chat-interface.tsx`
  - [ ] Add category selector at top
  - [ ] Add file staging area above input
  - [ ] Integrate with existing chat UI from boilerplate

- [ ] Modify: `components/chat/chat-input.tsx`
  - [ ] Add file upload button (📎 icon)
  - [ ] Opens file picker
  - [ ] Adds files to staging area
  - [ ] Change "Send" button → "Analyze" when files staged
  - [ ] Disable if over file limit

- [ ] Modify: `components/chat/chat-message.tsx`
  - [ ] Detect if message has red_flag_data
  - [ ] If yes: render RedFlagScoreCard instead of plain text
  - [ ] If no: render normal message bubble
  - [ ] Show multiple images in gallery (if conversation thread)

- [ ] Test chat interface
  - [ ] Category selector appears
  - [ ] File staging area appears
  - [ ] Upload files → staged
  - [ ] Click Analyze → sends to API
  - [ ] Response renders score card
  - [ ] Follow-up questions work

### 4.5 Conversation History Sidebar

- [ ] Modify: `components/chat/chat-sidebar.tsx` (from boilerplate)
  - [ ] Show red flag score in conversation preview
  - [ ] Show category icon
  - [ ] Filter by category (dropdown)
  - [ ] Search conversations
  - [ ] Mobile: swipe to open sidebar
  - [ ] Desktop: always visible

- [ ] Test sidebar
  - [ ] Shows all conversations
  - [ ] Click conversation → loads it
  - [ ] Score displayed correctly
  - [ ] Category filter works
  - [ ] Search works

---

## Phase 5: Main API Route (Week 2, Day 4)

### 5.1 Chat API Route

- [ ] Create: `app/api/chat/route.ts`
  - [ ] POST handler
  - [ ] Verify authentication (NextAuth session)
  - [ ] Extract: conversationId, category, messages, files
  - [ ] **Rate limiting**:
    - Check daily usage (< 2)
    - Check monthly usage (< 10)
    - Return 429 if exceeded with resetTime
  - [ ] **Load or create conversation**:
    - If conversationId: load from DB
    - If new: create conversation record
  - [ ] **Category handling**:
    - If user selected: use that
    - If not: auto-detect from first message
  - [ ] **Build prompt**:
    - Load category-specific prompt
    - Combine with base prompt
  - [ ] **Call Gemini**:
    - Include full conversation history
    - Include image URLs (from files)
    - Stream response
  - [ ] **Parse response**:
    - Extract JSON block (red flag data)
    - Extract natural language explanation
  - [ ] **Store in database**:
    - Create message record (role: assistant)
    - Store red_flag_data in JSONB column
    - Update conversation.red_flag_score
  - [ ] **Increment usage**:
    - Call incrementUsage(userId)
  - [ ] **Return streaming response**:
    - Stream JSON first
    - Then stream explanation

- [ ] **Add global rate limiting**:
  - [ ] Create `lib/rate-limiting/global-limiter.ts`
  - [ ] Implement using database or Redis for atomic operations (prevent race conditions)
    - Option 1: Use Vercel KV store (free tier: 256 MB) - recommended
    - Option 2: Use Postgres with atomic increment
    - Option 3: In-memory for MVP with mutex/lock for concurrent requests
  - [ ] Set limit: 1,400 requests/day (100-request buffer under Gemini's 1,500)
  - [ ] Counter resets daily at midnight UTC
  - [ ] Check global limit before each analysis
  - [ ] Return user-friendly error when global limit hit:
    - Error message: "High traffic, try again in a few hours"
    - Status code: 503 (Service Unavailable, not 429)
    - Flag: `isGlobalLimit: true` (don't count against user's daily limit)
  - [ ] Use atomic increment or Increment global counter after successful analysis
  - [ ] Add `getCurrentGlobalCount()` function for monitoring

- [ ] **Test global rate limiting**:
  - [ ] Manually set counter to 1,399
  - [ ] Next analysis succeeds
  - [ ] Set counter to 1,400
  - [ ] Next analysis returns "High traffic" error (503)
  - [ ] Verify doesn't decrement user's daily analyses
  - [ ] Simulate midnight UTC, verify counter resets to 0
  - [ ] Test with multiple concurrent requests (race condition check)

- [ ] Test API route
  - [ ] Text-only analysis → works
  - [ ] Single image analysis → works
  - [ ] 5 images analysis → works
  - [ ] Follow-up question → remembers context
  - [ ] Rate limit triggered after 2 analyses
  - [ ] Auto-category detection works
  - [ ] Manual category selection works
  - [ ] Database records created correctly

### 5.2 Usage API Route

- [ ] Create: `app/api/usage/route.ts`
  - [ ] GET handler
  - [ ] Verify authentication
  - [ ] Get daily usage
  - [ ] Get monthly usage
  - [ ] Return: dailyUsage, dailyLimit, monthlyUsage, monthlyLimit, canAnalyze, resetTime

- [ ] Test usage API
  - [ ] Returns correct counts
  - [ ] canAnalyze false when limits hit
  - [ ] resetTime calculated correctly

---

## Phase 6: Share Functionality (Week 2, Day 5)

### 6.1 Share Dialog Component

- [ ] Create: `components/analysis/share-dialog.tsx`
  - [ ] Modal/dialog (shadcn Dialog component)
  - [ ] Social share buttons:
    - Twitter/X
    - WhatsApp
    - Instagram (copy text)
  - [ ] Copy link button
  - [ ] Toggle: "Make this public"
  - [ ] Close button

- [ ] Implement share functions:
  - [ ] Twitter: `window.open(twitterUrl)`
  - [ ] WhatsApp: `window.open(whatsappUrl)` (mobile) or web link (desktop)
  - [ ] Copy link: `navigator.clipboard.writeText(shareUrl)`
  - [ ] Track share events (optional analytics)

- [ ] Test share dialog
  - [ ] Opens when "Share" clicked
  - [ ] Twitter share opens new window with pre-filled text
  - [ ] WhatsApp share works (test on mobile)
  - [ ] Copy link copies to clipboard
  - [ ] "Make public" toggle works

### 6.2 Share API Route

- [ ] Create: `app/api/share/route.ts`
  - [ ] POST handler
  - [ ] Verify authentication
  - [ ] Verify user owns conversation
  - [ ] Toggle conversation.isPublic flag
  - [ ] Return share URL

- [ ] Test share API
  - [ ] Makes conversation public
  - [ ] Returns correct URL
  - [ ] Toggling off works

### 6.3 Public Analysis Page

- [ ] Create: `app/analysis/[id]/page.tsx`
  - [ ] Load conversation by ID
  - [ ] If not public: show 404 or "Private analysis"
  - [ ] If public: show RedFlagScoreCard (read-only)
  - [ ] No conversation history, just final analysis
  - [ ] Branding footer: "Analyzed by Red Flag Detector"
  - [ ] CTA: "Analyze your own"

- [ ] Test public page
  - [ ] Public link loads analysis
  - [ ] Private link shows error
  - [ ] Looks good on mobile
  - [ ] CTA button works

---

## Phase 7: Landing Page (Week 2, Day 6)

### 7.1 Landing Page Design

- [ ] Create: `app/page.tsx`
  - [ ] **Hero section**:
    - Headline: "Spot the warning signs before it's too late"
    - Subheadline: "AI-powered analysis for dating profiles, conversations, job postings, and more."
    - CTA: "Try Red Flag Detector Free"
    - Background: gradient or image
  - [ ] **Features section**:
    - 4 cards: Multi-category, AI-powered, Clear scores, Privacy-first
    - Icons + short descriptions
  - [ ] **How it works**:
    - 3 steps: Select category → Upload → Get analysis
    - Visual illustrations
  - [ ] **Categories showcase**:
    - 5 cards with category icons + descriptions
  - [ ] **CTA section**:
    - "Ready to spot the red flags?"
    - Button: "Get Started Free"
  - [ ] **Footer**:
    - Links: Privacy Policy, Terms, Contact
    - Social links
    - Copyright

- [ ] Style landing page
  - [ ] Mobile-first responsive
  - [ ] Hero section: full viewport height
  - [ ] Clear typography hierarchy
  - [ ] Consistent spacing
  - [ ] Smooth scroll to sections
  - [ ] Animations (subtle, fast)

- [ ] Test landing page
  - [ ] Looks good on mobile (375px)
  - [ ] Looks good on tablet (768px)
  - [ ] Looks good on desktop (1920px)
  - [ ] CTA buttons work
  - [ ] Links work

### 7.2 Legal Pages

- [ ] Create: `app/privacy/page.tsx`
  - [ ] Privacy policy text
  - [ ] Data collection disclosure
  - [ ] Data retention (7 days images, forever analyses unless deleted)
  - [ ] User rights (export, delete)
  - [ ] GDPR compliance

- [ ] Create: `app/terms/page.tsx`
  - [ ] Terms of service
  - [ ] Usage limits
  - [ ] Prohibited use
  - [ ] Liability disclaimer

- [ ] Review legal content
  - [ ] Get legal review if possible (or use templates)
  - [ ] Clear, readable language

---

## Phase 8: Onboarding & UX Polish (Week 2, Day 7)

### 8.1 Onboarding Flow

- [ ] Modify: `app/(chat)/page.tsx`
  - [ ] Detect first-time user (no conversations)
  - [ ] Pre-load example conversation in chat
  - [ ] Example: Sample dating profile analysis with 7.5 score
  - [ ] After example, show prompt:
    - "Now try your own! What should I analyze?"
    - Category buttons prominent

- [ ] Create example data: `lib/data/example-analysis.ts`
  - [ ] Sample dating profile text
  - [ ] Sample analysis result (JSON)
  - [ ] Sample explanation text

- [ ] Test onboarding
  - [ ] New user sees example immediately
  - [ ] Example is compelling
  - [ ] Clear CTA to try their own

### 8.2 Loading States

- [ ] Create: `components/shared/loading-states.tsx`
  - [ ] AnalysisLoadingState component
    - Shows: "Analyzing..."
    - Progress indicator or skeleton
    - Fun loading messages: "Reading between the lines...", "Checking the receipts..."
  - [ ] UploadingState component
  - [ ] GeneralSkeleton component

- [ ] Add loading states
  - [ ] During file upload
  - [ ] During analysis (10-30 seconds)
  - [ ] During conversation load

- [ ] Test loading states
  - [ ] Shows during upload
  - [ ] Shows during analysis
  - [ ] Smooth transitions

### 8.3 Error States

- [ ] Create error message component: `components/shared/error-message.tsx`
  - [ ] Different types: upload error, API error, rate limit, auth error
  - [ ] User-friendly messages (no technical jargon)
  - [ ] Retry button where appropriate

- [ ] Add error handling
  - [ ] File upload fails → show error, allow retry
  - [ ] Analysis fails → show error, allow retry
  - [ ] Rate limit hit → show soft prompt to upgrade
  - [ ] Auth error → redirect to login

- [ ] Test error states
  - [ ] Trigger upload error (invalid file type)
  - [ ] Trigger rate limit (3rd analysis of day)
  - [ ] Trigger API error (disconnect network)

### 8.4 Empty States

- [ ] Create: `components/shared/empty-state.tsx`
  - [ ] No conversations yet
  - [ ] No files uploaded
  - [ ] Helpful prompts

- [ ] Test empty states
  - [ ] Shows when sidebar empty
  - [ ] Shows when no files staged

### 8.5 Rate Limit Display & Timezone

- [ ] Create: `components/shared/rate-limit-indicator.tsx`
  - [ ] Show current usage: "X/2 analyses used today"
  - [ ] Show daily limit reset time
  - [ ] Countdown timer: "Resets in: 8h 23m"
  - [ ] Clear timezone note: "Resets daily at midnight UTC"
  - [ ] Link to FAQ explaining UTC timezone

- [ ] Add FAQ/Help section to landing page:
  - [ ] "When do my free analyses reset?"
  - [ ] Explain UTC timezone
  - [ ] Show conversion for major timezones:
    - New York: 7 PM EST / 8 PM EDT
    - Los Angeles: 4 PM PST / 5 PM PDT
    - London: 12 AM GMT / 1 AM BST
    - India: 5:30 AM IST
    - Tokyo: 9 AM JST

- [ ] Test rate limit indicator:
  - [ ] Countdown timer updates every second
  - [ ] Shows correct time until midnight UTC
  - [ ] Displays correctly on mobile
  - [ ] Auto-resets when counter resets
  
---

## Phase 9: Data Export & Privacy Features (Week 3, Day 1)

### 9.1 Export API Route

- [ ] Create: `app/api/export/route.ts`
  - [ ] GET handler
  - [ ] Query param: format=json|pdf
  - [ ] Verify authentication
  - [ ] Gather all user data:
    - User info
    - All conversations
    - All messages
    - Uploaded file URLs (not file contents)
  - [ ] **JSON export**:
    - Return as downloadable JSON file
  - [ ] **PDF export** (future, optional for MVP):
    - Use library like jsPDF
    - Format as readable report

- [ ] Test export
  - [ ] JSON export downloads correctly
  - [ ] Contains all user data
  - [ ] JSON is valid, readable

### 9.2 Delete Account Functionality

- [ ] Create: `app/api/account/delete/route.ts`
  - [ ] POST handler
  - [ ] Verify authentication
  - [ ] Soft delete user data:
    - Set conversations.deletedAt
    - Set messages.deletedAt
    - Set uploaded_files.deletedAt (files deleted by cron)
    - Keep user record for 48 hours (compliance)
  - [ ] Schedule full deletion (cron job or webhook)

- [ ] Create settings page: `app/settings/page.tsx`
  - [ ] Privacy settings section
  - [ ] Data retention preferences
  - [ ] Export data button
  - [ ] Delete account button (with confirmation)

- [ ] Test account deletion
  - [ ] Soft delete works
  - [ ] User can't access deleted data
  - [ ] Files scheduled for deletion

---

## Phase 10: Mobile Optimization (Week 3, Day 2)

### 10.1 Mobile-Specific UX

- [ ] Review all pages on mobile (iPhone SE, iPhone 15 Pro Max, Android)
  - [ ] Landing page
  - [ ] Login page
  - [ ] Chat interface
  - [ ] Sidebar (swipe to open)
  - [ ] File upload
  - [ ] Score card
  - [ ] Settings

- [ ] Mobile optimizations
  - [ ] Tap targets >44px
  - [ ] Input bar fixed at bottom
  - [ ] Category selector: horizontal scroll
  - [ ] Score card: full width, collapsible
  - [ ] Share dialog: bottom sheet on mobile

- [ ] Test native features
  - [ ] Mobile file picker works
  - [ ] Native share dialog works (if available)
  - [ ] Keyboard behavior (doesn't hide content)

### 10.2 Performance on Mobile

- [ ] Test on 3G network
  - [ ] Page loads <3 seconds
  - [ ] Images load progressively
  - [ ] Critical content above fold loads first

- [ ] Lighthouse audit (run on mobile and desktop)
  - [ ] Performance: >80
  - [ ] Accessibility: >90
  - [ ] Best Practices: >90
  - [ ] SEO: >80
  - [ ] Document scores and address critical issues

### 10.3 Accessibility (a11y) - Basic Compliance

- [ ] **Keyboard Navigation**:
  - [ ] All buttons/links reachable via Tab key
  - [ ] Enter/Space triggers buttons
  - [ ] Escape closes modals/dialogs
  - [ ] No keyboard traps
  - [ ] Logical tab order (top to bottom, left to right)

- [ ] **Focus Indicators**:
  - [ ] Visible focus outline on all interactive elements
  - [ ] Focus outline contrast ratio ≥ 3:1
  - [ ] Focus persists when tabbing (not lost)

- [ ] **ARIA Labels**:
  - [ ] Score card: `role="region"` with `aria-label`
  - [ ] Results: `aria-live="polite"` for screen reader announcements
  - [ ] Upload button: `aria-label="Upload files"`
  - [ ] Share button: `aria-label="Share results"`
  - [ ] Icons: `aria-hidden="true"` (not read by screen readers)

- [ ] **Color Accessibility**:
  - [ ] Red flags: 🔴 emoji + "CRITICAL" text
  - [ ] Yellow flags: 🟡 emoji + "WARNING" text
  - [ ] Green flags: 🟢 emoji + "NOTICE" text
  - [ ] Not relying on color alone to convey meaning

- [ ] **Alt Text**:
  - [ ] All images have descriptive alt text
  - [ ] Logo: alt="Red Flag Detector"
  - [ ] User uploads: alt="Uploaded screenshot"
  - [ ] Decorative images: alt="" (empty, not missing)

- [ ] **Form Labels**:
  - [ ] All inputs have associated labels
  - [ ] Labels use `htmlFor` matching input `id`
  - [ ] Placeholder text is NOT the only label

- [ ] **Test with keyboard only**:
  - [ ] Navigate entire app without mouse
  - [ ] Complete full user flow (signup → analyze → share)
  - [ ] All features accessible

- [ ] **Test with screen reader** (basic check):
  - [ ] Windows: Test with Narrator (built-in)
  - [ ] Mac: Test with VoiceOver (built-in)
  - [ ] Verify critical actions are announced
  - [ ] Verify form labels are read correctly

**Note:** shadcn/ui components are accessible by default. Focus on custom components (Score Card, File Upload, etc.)

**Defer to V1.1:**
- Full WCAG 2.1 AA compliance audit
- Professional screen reader testing (JAWS, NVDA)
- Color contrast analyzer (automated tools)
- High contrast mode support
- Text resizing support (up to 200%)

---

## Phase 11: Final Testing & Bug Fixes (Week 3, Days 3-4)

### 11.1 End-to-End Testing

- [ ] **Happy path test**:
  1. Land on homepage
  2. Click "Try Free"
  3. Sign in with Google
  4. Verify email
  5. See onboarding example
  6. Select category
  7. Upload files
  8. Click Analyze
  9. Get results
  10. Share results
  11. Start new conversation
  12. Return to old conversation
  - [ ] All steps work smoothly

- [ ] **Error path tests**:
  - [ ] Invalid file type upload
  - [ ] File too large upload
  - [ ] Rate limit (3rd analysis)
  - [ ] Network error during upload
  - [ ] API error during analysis

- [ ] **Edge cases**:
  - [ ] Very long conversation history (50+ messages)
  - [ ] Very large image (near 100 MB)
  - [ ] Special characters in text
  - [ ] Emoji-only input
  - [ ] Multiple concurrent analyses (stress test)

### 11.2 Cross-Browser Testing

- [ ] Chrome (Mac/Windows/Android)
- [ ] Safari (Mac/iPhone)
- [ ] Firefox (Mac/Windows)
- [ ] Edge (Windows)

### 11.3 Bug Fixes

- [ ] Create GitHub issues for all bugs found
- [ ] Prioritize: Critical → High → Medium → Low
- [ ] Fix critical and high priority bugs
- [ ] Defer low priority to post-launch

---

## Phase 12: Deployment Preparation (Week 3, Day 5)

### 12.1 Production Environment Variables

- [ ] Go to Vercel dashboard
- [ ] Create production environment variables (same as .env.local but with prod values)
- [ ] Update OAuth redirect URIs to production URL:
  - Google: `https://[YOUR_PRODUCTION_URL]/api/auth/callback/google`
  - GitHub: `https://[YOUR_PRODUCTION_URL]/api/auth/callback/github`
- [ ] Update NEXTAUTH_URL: `https://[YOUR_PRODUCTION_URL]`
- [ ] Set FILE_RETENTION_DAYS to desired production value (default: 7)

### 12.2 Database Migration

- [ ] Backup production database (if migrating existing data)
  ```bash
  # Export current data if exists
  pg_dump [connection_string] > backup.sql
  ```
- [ ] Ensure Vercel Postgres is production-ready
- [ ] Run migrations on production database
  ```bash
  npx drizzle-kit push:pg
  ```
- [ ] Verify schema matches local
- [ ] Verify all indexes created correctly (check via Drizzle Studio)

### 12.3 Vercel Configuration

- [ ] Review `vercel.json`:
  - [ ] Cron job configured
  - [ ] Environment variables set
  - [ ] Build settings correct

- [ ] Configure domains (if custom domain):
  - [ ] Add domain to Vercel project
  - [ ] Update DNS records
  - [ ] Wait for SSL certificate

### 12.4 Final Code Review

- [ ] Remove console.logs in production code
- [ ] Check all TODO comments removed or documented
- [ ] Verify no hardcoded secrets
- [ ] Ensure .env.local not committed
- [ ] Review .gitignore
- [ ] Verify server timezone is set to UTC (check Vercel settings)
- [ ] Test that midnight UTC reset logic works correctly

---

## Phase 13: Launch (Week 3, Days 6-7)

### 13.1 Pre-Launch Checklist

- [ ] All features working in production
- [ ] Landing page live
- [ ] Authentication working (Email/Password + GitHub OAuth)
- [ ] File upload working
- [ ] Analysis working (all 5 categories)
- [ ] Share functionality working
- [ ] Rate limiting working
- [ ] Mobile experience polished
- [ ] Legal pages live (Privacy, Terms)
- [ ] Analytics tracking (Vercel Analytics enabled)
  
  - [ ] **Resource monitoring setup**:
  - [ ] Bookmark Cloudinary dashboard
  - [ ] Bookmark Vercel dashboard
  - [ ] Bookmark Supabase dashboard
  - [ ] Create monitoring spreadsheet
  - [ ] Set calendar reminder for weekly checks

- [ ] **Rate limiting verification**:
  - [ ] User rate limit working (2/day, 10/month)
  - [ ] Global rate limit working (1,400/day)
  - [ ] Countdown timer shows correct UTC reset time
  - [ ] Error messages user-friendly (not technical)

- [ ] **Accessibility basics**:
  - [ ] Keyboard navigation works
  - [ ] Focus indicators visible
  - [ ] Score card has ARIA labels
  - [ ] Red/yellow/green use emoji + text (not color alone)

- [ ] **File upload verification**:
  - [ ] Upload via /api/upload works (server-side, no CORS needed)
  - [ ] Files appear in Cloudinary dashboard
  - [ ] Files accessible via returned URLs
  - [ ] Auto-deletion cron job configured

- [ ] **Timezone display**:
  - [ ] Rate limit shows "Resets at midnight UTC"
  - [ ] Countdown timer accurate
  - [ ] FAQ explains timezone conversions

### 13.2 Soft Launch (Friends & Family)

- [ ] Invite 10-20 friends to test
- [ ] Ask for feedback:
  - [ ] Ease of use
  - [ ] Mobile experience
  - [ ] Analysis quality
  - [ ] Any bugs

- [ ] Monitor for first 48 hours:
  - [ ] Error logs (Vercel dashboard)
  - [ ] Usage patterns (analytics)
  - [ ] Cloudinary storage usage
  - [ ] Supabase Postgres usage
  - [ ] Gemini API usage (global rate limit counter)
  - [ ] Performance metrics
  - [ ] User feedback and bug reports

### 13.3 Public Launch

- [ ] Post on social media:
  - [ ] Twitter/X
  - [ ] LinkedIn
  - [ ] Product Hunt (prepare launch day)
  - [ ] Reddit (r/SideProject, r/entrepreneur)

- [ ] Reach out to influencers in target niches:
  - [ ] Dating advice YouTubers
  - [ ] Career coaches
  - [ ] Tech reviewers

- [ ] Monitor first week:
  - [ ] Signups
  - [ ] Analyses run
  - [ ] Retention (D1, D7)
  - [ ] Errors
  - [ ] Feedback

---

## Phase 14: Post-Launch Monitoring (Ongoing)

### 14.1 Daily Checks (First Week)

- [ ] Check Vercel error logs
- [ ] Check Cloudinary usage (storage, bandwidth)
- [ ] Check Supabase Postgres usage (storage, compute)
- [ ] Check Gemini API usage (requests via global counter)
- [ ] Review user feedback
- [ ] Monitor signups and usage
- [ ] Check for any rate limit issues (user or global)

### 14.2 Weekly Reviews (First Month)

- [ ] Review analytics:
  - [ ] Total signups
  - [ ] Daily active users
  - [ ] Analyses per day
  - [ ] Category breakdown
  - [ ] Retention rates
  - [ ] Share rates

- [ ] Cost analysis:
  - [ ] Gemini API usage (should be free tier)
  - [ ] Cloudinary costs (monitor against 25 GB free tier)
  - [ ] Vercel costs (monitor against Hobby plan limits)
  - [ ] Supabase costs (monitor against 500 MB free tier)
  - [ ] Vercel KV costs if using (256 MB free tier)

- [ ] Plan improvements:
  - [ ] Bug fixes
  - [ ] Feature requests
  - [ ] UX improvements

### 14.3 Resource Usage Monitoring

**Set up monitoring dashboard (simple spreadsheet for MVP):**

- [ ] **Weekly Checks (Every Sunday)**:
  
  **Cloudinary Storage:**
  - [ ] Login to Cloudinary dashboard
  - [ ] Check Storage: ___ GB / 25 GB used
  - [ ] Alert if > 20 GB (80% full)
  - [ ] Action: Reduce FILE_RETENTION_DAYS (7 → 5 days) or upgrade
  - [ ] Note: Estimate ~50 MB per active user (5 images @ 10 MB each)
  
  **Supabase Postgres:**
  - [ ] Check Supabase dashboard → Settings → Database
  - [ ] Database size: ___ MB / 500 MB
  - [ ] Alert if > 400 MB (80% full)
  - [ ] Action: Cleanup old data or upgrade to Supabase Pro
  
  **Gemini API Usage:**
  - [ ] Check global rate limit logs
  - [ ] Daily requests: Peak ___ / 1,400 limit
  - [ ] Alert if peak > 1,000 (approaching capacity)
  - [ ] Action: Plan for paid tier or optimize prompts
  
  **Vercel Bandwidth:**
  - [ ] Check Vercel dashboard → Usage
  - [ ] Bandwidth: ___ GB / 100 GB per month
  - [ ] Alert if > 80 GB
  - [ ] Action: Optimize images or upgrade

- [ ] **Daily Checks (First Week Only)**:
  - [ ] Check error logs in Vercel dashboard
  - [ ] Check Gemini API usage (global counter)
  - [ ] Monitor for user-reported issues
  - [ ] Review signup rate and usage patterns

- [ ] **Monitoring Spreadsheet Template**:
```
  Date | Cloudinary GB | Supabase MB | Gemini Requests | Bandwidth GB | Notes
  -----|---------------|-------------|-----------------|--------------|-------
  11/16| 2.3           | 45          | 234             | 12           | All good
  11/23| 5.1           | 78          | 456             | 23           | Growth
```

**Alert Thresholds (Summary):**
- Cloudinary: Alert at 20 GB (80%)
- Supabase Postgres: Alert at 400 MB (80%)
- Gemini: Alert at 1,000 requests/day (71%)
- Bandwidth: Alert at 80 GB (80%)

**Capacity Estimates (with 30% safety buffer):**
- Cloudinary: ~350 active users before hitting 80% threshold (20 GB / ~50 MB per user)
- Supabase Postgres: ~2,400 active users before hitting 80% threshold (400 MB / ~150 KB per user)
- Gemini: ~525 daily active users before hitting 71% threshold (1,000 / (2 analyses * 0.95 success rate))
- Bandwidth: Varies by traffic, monitor weekly

**Notes:**
- "Active user" = user who has analyzed content in the past 7 days
- Estimates assume average usage patterns
- Power users and failed uploads can consume more resources
- Review estimates monthly and adjust based on actual usage patterns
---

## Appendix A: Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build locally
npm run lint             # Lint code
```

### Database
```bash
pnpm db:generate    # Generate migration (or: npx drizzle-kit generate)
pnpm db:push        # Push migration to DB (or: npx drizzle-kit push)
pnpm db:studio      # Open Drizzle Studio (or: npx drizzle-kit studio)
pnpm db:migrate     # Run migrations via TypeScript (or: npx tsx lib/db/migrate.ts)
```

### Deployment
```bash
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel env pull          # Pull environment variables
vercel logs              # View production logs
```

---

## Appendix B: Troubleshooting

### "Can't connect to database"
- [ ] Check POSTGRES_URL in .env.local
- [ ] Verify Supabase PostgreSQL is connected via Vercel Integration
- [ ] Check connection string format (should be Supabase format)

### "Gemini API error"
- [ ] Verify GOOGLE_AI_API_KEY is correct
- [ ] Check API quota not exceeded
- [ ] Test API key in AI Studio

### "File upload fails"
- [ ] Check Cloudinary credentials
- [ ] Verify file size <100 MB
- [ ] Check file type (JPG, PNG, PDF only)

### "OAuth login not working"
- [ ] Verify client IDs and secrets
- [ ] Check redirect URIs match exactly
- [ ] Ensure OAuth apps are enabled

### "Rate limiting not working"
- [ ] Verify usage logs are being created
- [ ] Check UTC timezone configuration
- [ ] Test global rate limit counter (atomic operations)
- [ ] Verify reset logic at midnight UTC

---

## Appendix C: Final Package Versions

**Using Vercel AI Chatbot's latest bleeding-edge versions:**

### Core Framework (Next.js 15 + React 19)
```json
"next": "15.3.0-canary.31",                    // Next.js 15 canary (Turbopack)
"react": "19.0.0-rc-45804af1-20241021",        // React 19 RC
"react-dom": "19.0.0-rc-45804af1-20241021",
"typescript": "^5.6.3"
```

### AI SDK v5 (Latest)
```json
"ai": "5.0.26",                    // AI SDK v5
"@ai-sdk/react": "2.0.26",         // React hooks (separate package in v5)
"@ai-sdk/provider": "2.0.0",       // Provider utilities
"@ai-sdk/google": "^0.0.52"        // Gemini provider
```

### Database (Latest)
```json
"drizzle-orm": "^0.34.0",
"drizzle-kit": "^0.25.0",
"@vercel/postgres": "^0.10.0"
```

### Authentication (Latest Beta)
```json
"next-auth": "5.0.0-beta.25",
"@auth/drizzle-adapter": "^1.5.0"
```

### Our Custom Features
```json
"cloudinary": "^2.5.0",                    // Image storage
"browser-image-compression": "^2.0.2",     // Client-side compression
"react-dropzone": "^14.2.3",               // File upload UI
"bcryptjs": "^2.4.3",                      // Password hashing
"resend": "^3.0.0",                        // Email service (verification emails)
"nanoid": "^5.0.8"                         // Token generation (already in utilities)
```

### UI & Styling (Tailwind v4)
```json
"tailwindcss": "^4.1.13",          // Tailwind v4 (new syntax)
"lucide-react": "^0.446.0",        // Icons
"sonner": "^1.5.0",                // Toast notifications
"framer-motion": "^11.3.19",       // Animations
"next-themes": "^0.3.0"            // Dark mode
```

### Utilities
```json
"zod": "^3.25.76",                 // Schema validation
"nanoid": "^5.0.8",                // ID generation
"date-fns": "^4.1.0",              // Date utilities
"clsx": "^2.1.1",                  // Class name utilities
"tailwind-merge": "^2.5.2"         // Tailwind class merging
```

**Package Manager:**
```json
"packageManager": "pnpm@9.12.3"
```

**Note:** Using `pnpm` instead of `npm` (faster, more efficient). If you prefer npm, remove the `packageManager` field.

**Removed from boilerplate (~30 packages):**
- CodeMirror (code editor)
- ProseMirror (rich text editor)
- @vercel/blob (using Cloudinary)
- @vercel/otel (monitoring)
- redis (caching)
- Various unused dependencies

**Important AI SDK v5 Breaking Changes:**
- `useChat` import: `@ai-sdk/react` (not `ai/react`)
- `streamMode` → `streamProtocol`
- `experimental_maxAutomaticRoundtrips` → `maxSteps`
- `useAssistant` hook removed (use `useChat` with assistant mode)
- `keepLastMessageOnError` deprecated (defaults to true)
- `useLegacyFunctionCalls` removed

---

## Appendix D: Rollback Plan

### If Deployment Fails

1. **Immediate Actions**:
   - [ ] Revert to previous deployment in Vercel dashboard
   - [ ] Check error logs to identify issue
   - [ ] Notify any beta users of temporary downtime

2. **Database Rollback** (if migration caused issues):
   - [ ] Restore from backup (see Phase 12.2)
   - [ ] Revert migration files
   - [ ] Test locally before re-deploying

3. **API Key Rotation** (if keys compromised):
   - [ ] Generate new keys for affected services
   - [ ] Update environment variables in Vercel
   - [ ] Redeploy with new credentials

4. **Cloudinary Issues**:
   - [ ] Check quota limits
   - [ ] Verify credentials
   - [ ] Test upload in isolation

---

**Document Version**: 1.2
**Last Updated**: November 2025 (Updated to Bleeding-Edge Versions)
**Estimated Total Time**: 3 weeks (1 developer, full-time)
**Status**: Ready for Implementation

**Changes in v1.2:**
- Updated to Next.js 15 canary, React 19 RC, AI SDK v5
- Updated all package versions to bleeding-edge from Vercel AI Chatbot
- Fixed Drizzle Kit commands (removed deprecated `:pg` suffix)
- Updated all npm commands to pnpm
- Added AI SDK v5 breaking changes notes
- Updated Gemini model to 2.5 Flash
- Enhanced repository setup with package cleanup steps

**Changes in v1.1:**
- Removed Resend/email verification references (skipped for MVP)
- Removed Cloudinary CORS configuration (not needed - using API proxy)
- Added testing framework setup (Phase 4.0)
- Added atomic operations requirement for global rate limiting
- Made file retention configurable via environment variable
- Added database backup step before production migration
- Improved error handling in retry logic
- Added rollback plan (Appendix D)
- Updated capacity estimates with safety buffers
- Added server timezone verification step
