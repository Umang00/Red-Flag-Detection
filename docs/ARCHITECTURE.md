# Technical Architecture: Red Flag Detector

## 1. System Overview

### 1.1 Architecture Pattern
**Type**: Serverless, Full-Stack Next.js Application
**Deployment**: Vercel (Edge Functions + Serverless Functions)
**Database**: Supabase PostgreSQL (via Vercel Integration) - 500 MB free tier
**Authentication**: NextAuth.js v5 (Email/Password + GitHub OAuth)
**Storage**: Cloudinary (Image/PDF hosting) - 25 GB free tier
**AI**: Google Gemini 2.5 Flash API (via AI SDK v5)

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  (Next.js 15 - React 19 - TypeScript - Tailwind - shadcn)  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL PLATFORM                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js API Routes (Serverless)            │  │
│  │  • /api/auth/* (NextAuth.js)                         │  │
│  │  • /api/chat (AI analysis)                           │  │
│  │  • /api/upload (Cloudinary proxy)                    │  │
│  │  • /api/usage (rate limiting)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Supabase PostgreSQL Database                │  │
│  │  (users, conversations, messages, uploaded_files)  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Vercel Analytics                       │  │
│  │  (Basic metrics - page views, user counts)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────┬──────────────────────┬─────────────────┬─────────┘
          │                      │                 
          ▼                      ▼                 
┌─────────────────┐   ┌──────────────────┐
│   Cloudinary    │   │  Gemini 2.5 API  │
│  (Image Store)  │   │  (AI Analysis)   │
└─────────────────┘   └──────────────────┘
```

---

## 2. Boilerplate Foundation

### 2.1 Base Repository
**Source**: https://github.com/vercel/ai-chatbot
**Commit**: Latest stable release (clone at time of development)

### 2.2 What We Keep from Boilerplate

✅ **Keep (80% of boilerplate)**:
- Next.js 15 App Router structure (with Turbopack)
- React 19 RC setup with TypeScript
- Tailwind CSS configuration
- shadcn/ui component library
- Vercel AI SDK integration
- NextAuth.js authentication base
- Vercel Postgres setup
- Basic chat UI components
- Responsive layout
- Dark mode support

### 2.3 What We Modify from Boilerplate

⚠️ **Modify (15% of boilerplate)**:
- **AI Provider**: Swap OpenAI → Gemini 2.5 Flash (via AI SDK v5)
- **File Upload**: Single file → Multiple file staging area
- **Message Display**: Standard bubbles → Red Flag Score Card
- **Database Schema**: Add category, red_flag_data, uploaded_files table
- **System Prompts**: Generic → Category-specific prompts
- **Auth Providers**: Add Email/Password authentication + GitHub OAuth

### 2.4 What We Add (New Features)

🆕 **Add (5% new code)**:
- Category selection UI
- Cloudinary upload integration
- Auto-category detection logic
- Red Flag Score Card component
- Rate limiting middleware
- Usage tracking system
- Share functionality
- Data export endpoints
- Image auto-deletion cron jobs

---

## 3. Frontend Architecture

### 3.1 Directory Structure

```
app/
├── (auth)/
│   ├── login/
│       └── page.tsx              # Login page (Email/Password + GitHub OAuth)
├── (chat)/
│   ├── layout.tsx                # Chat layout with sidebar
│   ├── page.tsx                  # Main chat interface
│   └── [id]/
│       └── page.tsx              # Individual conversation view
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts          # NextAuth.js config
│   ├── chat/
│   │   └── route.ts              # Main AI analysis endpoint
│   ├── upload/
│   │   └── route.ts              # Cloudinary upload proxy
│   ├── usage/
│   │   └── route.ts              # Rate limiting check
│   ├── export/
│   │   └── route.ts              # Data export (GDPR)
│   └── share/
│       └── route.ts              # Public share link handler
├── analysis/
│   └── [id]/
│       └── page.tsx              # Public analysis view (shared links)
└── layout.tsx                    # Root layout
└── page.tsx                      # Landing page

components/
├── ui/                           # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown.tsx
│   └── ... (other shadcn components)
├── chat/
│   ├── chat-interface.tsx        # Main chat container
│   ├── chat-input.tsx            # Message input + file upload
│   ├── chat-message.tsx          # Message bubble
│   ├── chat-sidebar.tsx          # Conversation history
│   └── category-selector.tsx    # Category buttons
├── analysis/
│   ├── red-flag-score-card.tsx  # Visual score display
│   ├── flag-detail.tsx          # Individual flag explanation
│   └── share-dialog.tsx         # Share modal
├── upload/
│   ├── file-staging-area.tsx    # Multi-file preview before upload
│   ├── file-upload-zone.tsx     # Drag-drop area
│   └── file-preview-card.tsx    # Single file preview tile
└── shared/
    ├── header.tsx               # Navigation
    ├── footer.tsx               # Footer
    └── loading-states.tsx       # Skeletons, spinners

lib/
├── ai/
│   ├── gemini-client.ts         # Gemini API wrapper
│   ├── prompts/
│   │   ├── base-prompt.ts       # Shared system prompt
│   │   ├── dating-prompt.ts     # Dating-specific rules
│   │   ├── conversations-prompt.ts
│   │   ├── jobs-prompt.ts
│   │   ├── housing-prompt.ts
│   │   └── marketplace-prompt.ts
│   └── category-detection.ts    # Auto-detect category logic
├── storage/
│   ├── cloudinary-client.ts     # Cloudinary upload/delete
│   └── image-compression.ts     # Client-side compression
├── db/
│   ├── schema.ts                # Drizzle ORM schema
│   ├── queries.ts               # Database query functions
│   └── migrations/              # SQL migration files
├── auth/
│   └── auth-config.ts           # NextAuth.js configuration
├── rate-limiting/
│   └── usage-tracker.ts         # Rate limit logic
└── utils/
    ├── constants.ts             # App-wide constants
    ├── types.ts                 # TypeScript types
    └── helpers.ts               # Utility functions

public/
├── images/
│   └── example-analysis.png     # Pre-loaded onboarding example
└── favicon.ico

styles/
└── globals.css                  # Tailwind base + custom styles
```

### 3.2 Key Component Specifications

#### 3.2.1 CategorySelector Component

```tsx
// components/chat/category-selector.tsx

interface CategorySelectorProps {
  selectedCategory: Category | null;
  onCategorySelect: (category: Category) => void;
  disabled?: boolean;
}

type Category = 'dating' | 'conversations' | 'jobs' | 'housing' | 'marketplace' | 'general';

// UI: Horizontal scrollable buttons on mobile, grid on desktop
// Behavior: Single-select, shows selected state, can clear selection
```

#### 3.2.2 FileStagingArea Component

```tsx
// components/upload/file-staging-area.tsx

interface FileStagingAreaProps {
  files: StagedFile[];
  onFilesAdd: (newFiles: File[]) => void;
  onFileRemove: (fileId: string) => void;
  onFilesReorder: (reorderedFiles: StagedFile[]) => void;
  maxFiles: number; // 5 for free tier
  onAnalyze: () => void;
}

interface StagedFile {
  id: string;
  file: File;
  preview: string; // base64 or object URL
  uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'error';
  cloudinaryUrl?: string;
  error?: string;
}

// Features:
// - Drag-drop reordering
// - Remove individual files
// - Show upload progress
// - Compress large files before upload
// - Preview thumbnails
```

#### 3.2.3 RedFlagScoreCard Component

```tsx
// components/analysis/red-flag-score-card.tsx

interface RedFlagScoreCardProps {
  score: number; // 0-10
  verdict: 'Green light' | 'Proceed with caution' | 'Red light - avoid' | 'Needs more context';
  summary: string;
  flags: RedFlag[];
  positives: string[];
  advice: string;
  onShare: () => void;
}

interface RedFlag {
  severity: 'critical' | 'warning' | 'notice';
  category: string;
  evidence: string;
  explanation: string;
  context?: string;
}

// Visual Design:
// - Large score display (color-coded)
// - Expandable sections for each flag
// - Quote evidence in cards
// - Mobile-optimized accordion
// - Share button at bottom
```

### 3.3 State Management

**Approach**: React Context + Local State (no Redux/Zustand needed for MVP)

**Contexts**:
```tsx
// contexts/ChatContext.tsx
interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string, files?: File[]) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  createConversation: (category: Category) => Promise<string>;
}

// contexts/UploadContext.tsx
interface UploadContextType {
  stagedFiles: StagedFile[];
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  uploadFiles: () => Promise<string[]>; // Returns Cloudinary URLs
  clearStaging: () => void;
}

// contexts/AuthContext.tsx (from NextAuth)
// Already provided by boilerplate

// contexts/UsageContext.tsx
interface UsageContextType {
  dailyUsage: number;
  monthlyUsage: number;
  dailyLimit: number;
  monthlyLimit: number;
  canAnalyze: boolean;
  timeUntilReset: number; // seconds
}
```

---

## 4. Backend Architecture

### 4.1 API Route Specifications

#### 4.1.1 `/api/chat` - Main Analysis Endpoint

**Method**: POST
**Auth**: Required
**Rate Limit**: 2/day, 10/month

**Request**:
```typescript
{
  conversationId?: string;          // Existing conversation or new
  category?: Category;              // User-selected or null (auto-detect)
  messages: Message[];              // Full conversation history
  files?: {
    cloudinaryUrls: string[];       // Already uploaded to Cloudinary
  };
}
```

**Flow**:
```typescript
1. Verify authentication (NextAuth session)
2. Check rate limits (dailyUsage < 2, monthlyUsage < 10)
3. Load/create conversation in database
4. If no category: Auto-detect from first message
5. Build system prompt for category
6. Construct Gemini API request (text + image URLs)
7. Stream response to client
8. Parse JSON for red flag data
9. Store message + analysis in database
10. Increment usage counter
11. Return structured response
```

**Response** (Streaming):
```typescript
// Stream 1: JSON block with red flag data
{
  "score": 7.5,
  "verdict": "Proceed with caution",
  "summary": "Multiple concerning patterns detected",
  "flags": [...],
  "positives": [...],
  "advice": "..."
}

// Stream 2: Natural language explanation
"Let me break this down for you..."
```

**Error Responses**:
```typescript
400: Invalid request format
401: Not authenticated
429: Rate limit exceeded
500: Analysis failed (Gemini API error)
```

#### 4.1.2 `/api/upload` - Cloudinary Proxy

**Method**: POST
**Auth**: Required
**Rate Limit**: 20/minute

**Request**:
```typescript
FormData {
  files: File[];  // Max 5 files
}
```

**Flow**:
```typescript
1. Verify authentication
2. Validate file types (JPG, PNG, PDF only)
3. Validate file sizes (<100 MB each)
4. Compress if >10 MB
5. Upload to Cloudinary
6. Store file record in database (with auto_delete_at)
7. Return Cloudinary URLs
```

**Response**:
```typescript
{
  uploads: [
    {
      fileId: "uuid",
      cloudinaryUrl: "https://res.cloudinary.com/...",
      publicId: "red-flag-detector/...",
      fileSize: 2048576,
      fileType: "image/jpeg"
    }
  ]
}
```

#### 4.1.3 `/api/usage` - Rate Limit Check

**Method**: GET
**Auth**: Required

**Response**:
```typescript
{
  dailyUsage: 1,
  dailyLimit: 2,
  monthlyUsage: 5,
  monthlyLimit: 10,
  canAnalyze: true,
  resetTime: "2024-11-16T00:00:00Z"  // Next daily reset
}
```

#### 4.1.4 `/api/export` - Data Export (GDPR)

**Method**: GET
**Auth**: Required
**Query Params**: `?format=json|pdf`

**Response**:
```typescript
// JSON format
{
  user: {...},
  conversations: [
    {
      id: "...",
      category: "dating",
      redFlagScore: 7.5,
      createdAt: "...",
      messages: [...]
    }
  ],
  uploadedFiles: [...]  // URLs only, not file contents
}

// PDF format
// Formatted PDF report with all analyses
```

#### 4.1.5 `/api/share` - Public Share Handler

**Method**: POST
**Auth**: Required

**Request**:
```typescript
{
  conversationId: string;
  makePublic: boolean;
}
```

**Response**:
```typescript
{
  shareUrl: "https://redflagdetector.vercel.app/analysis/abc123",
  expiresAt: null  // No expiration for MVP
}
```

### 4.2 Database Access Layer (Drizzle ORM)

**Why Drizzle**: Type-safe, lightweight, great Next.js integration

**Schema Definition**:
```typescript
// lib/db/schema.ts

import { pgTable, uuid, text, timestamp, integer, real, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  name: text('name'),
  image: text('image'),
  password: text('password'), // For email/password authentication
  verificationToken: text('verification_token'), // For email verification
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category'), // enum check in application layer
  redFlagScore: real('red_flag_score'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  redFlagData: jsonb('red_flag_data'), // Parsed analysis results
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const uploadedFiles = pgTable('uploaded_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  cloudinaryUrl: text('cloudinary_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow(),
  autoDeleteAt: timestamp('auto_delete_at').defaultNow().$defaultFn(() => 
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  ),
  deletedAt: timestamp('deleted_at'),
});

export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  analysisCount: integer('analysis_count').default(1),
  date: timestamp('date', { mode: 'date' }).defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Query Functions**:
```typescript
// lib/db/queries.ts

// Get or create today's usage record
export async function getUserDailyUsage(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const record = await db
    .select()
    .from(usageLogs)
    .where(and(eq(usageLogs.userId, userId), eq(usageLogs.date, today)))
    .limit(1);
  
  return record[0]?.analysisCount || 0;
}

// Increment usage
export async function incrementUsage(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await db
    .insert(usageLogs)
    .values({ userId, date: today, analysisCount: 1 })
    .onConflictDoUpdate({
      target: [usageLogs.userId, usageLogs.date],
      set: { analysisCount: sql`${usageLogs.analysisCount} + 1` }
    });
}

// Get user's conversations
export async function getUserConversations(userId: string) {
  return db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userId, userId), isNull(conversations.deletedAt)))
    .orderBy(desc(conversations.updatedAt));
}

// More queries...
```

---
## 5. AI Integration Architecture

### 5.1 Gemini Client Wrapper

**Using AI SDK v5.0.26**

```typescript
// lib/ai/gemini-client.ts

import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { redFlagAnalysisSchema } from './schemas';

export async function analyzeWithGemini(
  category: Category,
  messages: Message[],
  imageUrls: string[] = []
): Promise<AnalysisResult> {
  
  const systemPrompt = buildPrompt(category);
  
  // Construct multi-modal content
  const userContent = [
    { type: 'text' as const, text: messages.map(m => `${m.role}: ${m.content}`).join('\n\n') },
    ...imageUrls.map(url => ({ type: 'image' as const, image: url }))
  ];
  
  // Step 1: Get structured analysis (guaranteed valid JSON)
  const { object: redFlagData } = await generateObject({
    model: google('gemini-2.5-flash'),  // Gemini 2.5 Flash model
    schema: redFlagAnalysisSchema,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userContent }
    ],
    temperature: 0.7,
  });
  
  // Step 2: Get natural language explanation
  const { text: explanation } = await generateText({
    model: google('gemini-2.5-flash'),
    system: `You just analyzed content and provided this assessment: ${JSON.stringify(redFlagData, null, 2)}

Now explain this analysis to the user in your blunt, helpful style.

TONE: Direct, slightly humorous, protective friend vibe.
START WITH: "Yikes. Red flag score: ${redFlagData.score}/10. Let me break down why this is a mess..." (or similar based on score)
FORMAT: Natural paragraphs with emoji flags (🔴🟡🟢) for severity markers.

Remember: You're being helpful, not cruel. Give actionable advice.`,
    messages: [],
    temperature: 0.8,
  });
  
  return {
    ...redFlagData,
    explanation
  };
}

// Wrapper with retry logic for transient failures
export async function analyzeWithRetry(
  category: Category,
  messages: Message[],
  imageUrls: string[] = []
): Promise<AnalysisResult> {
  const maxRetries = 3;
  const delays = [1000, 3000, 5000]; // 1s, 3s, 5s exponential backoff
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await analyzeWithGemini(category, messages, imageUrls);
    } catch (error) {
      // Log the error
      console.error(`Analysis attempt ${attempt + 1} failed:`, error);
      
      // If this was the last attempt, throw with user-friendly message
      if (attempt === maxRetries - 1) {
        throw new Error(
          'AI is temporarily unavailable. Please try again in a few minutes.'
        );
      }
      
      // Check if error is retryable
      const isRetryable = 
        error instanceof Error && 
        (error.message.includes('timeout') || 
         error.message.includes('rate limit') ||
         error.message.includes('500') ||
         error.message.includes('503'));
      
      if (!isRetryable) {
        // Don't retry for non-transient errors (e.g., invalid input)
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delays[attempt]));
    }
  }
  
  // TypeScript safety (should never reach here)
  throw new Error('Analysis failed after retries');
}

// Export the retry wrapper as the main function
export { analyzeWithRetry as analyzeContent };
```

**Usage in API routes:**
```typescript
// Always use analyzeWithRetry (includes retry logic)
import { analyzeWithRetry } from '@/lib/ai/gemini-client';

const analysis = await analyzeWithRetry(category, messages, imageUrls);
```

**Note:** AI SDK v5 syntax is the same for `generateObject()` and `generateText()`. The main changes are in React hooks (which we're not using much). If using `useChat` in frontend components, import from `@ai-sdk/react` instead of `ai/react`.

### 5.2 Prompt Engineering System

**Prompt Structure**:
```
[BASE_SYSTEM_PROMPT]
+
[CATEGORY_SPECIFIC_RULES]
+
[CONTEXT_FROM_USER] (optional)
+
[OUTPUT_FORMAT_INSTRUCTIONS]
+
[EXAMPLES] (few-shot for complex categories)
```

**Implementation**:
```typescript
// lib/ai/prompts/base-prompt.ts

export const BASE_SYSTEM_PROMPT = `You are Red Flag Detector, an expert pattern recognition AI that helps people identify warning signs in various contexts.

YOUR PERSONALITY:
• Direct and honest, but not cruel
• Like a protective friend who notices things
• Uses humor appropriately, never mocking the user
• Backs up claims with specific evidence
• Asks clarifying questions when context matters

YOUR PROCESS:
1. Analyze the content thoroughly
2. Identify patterns, not just isolated incidents
3. Explain WHY something is a red flag, not just WHAT
4. Provide actionable advice
5. Consider context and nuance

YOUR OUTPUT FORMAT:
Always respond with structured JSON followed by natural conversation:

\`\`\`json
{
  "score": 7.5,
  "confidence": 0.9,
  "verdict": "Proceed with caution",
  "summary": "One-sentence assessment",
  "flags": [
    {
      "severity": "critical",
      "category": "Brief category name",
      "evidence": "Exact quote or specific observation",
      "explanation": "Why this matters and what it indicates",
      "context": "When this is/isn't a problem"
    }
  ],
  "positives": ["Things that are actually good"],
  "advice": "Concrete next steps"
}
\`\`\`

Then explain in natural, blunt language.

TONE: Blunt, direct, slightly humorous, helpful. Think: "Let me tell you straight..."

CRITICAL RULES:
• Quote exact text when citing evidence
• Never make assumptions about unstated information
• Distinguish between definite red flags vs potential concerns
• Be especially careful with ambiguous situations
• If unsure, say "Needs more context" and ask questions`;
```

```typescript
// lib/ai/prompts/dating-prompt.ts

export const DATING_PROMPT = `
DATING-SPECIFIC ANALYSIS:

RED FLAG CATEGORIES:
🔴 CRITICAL (Deal-breakers):
• Controlling behavior ("you should/shouldn't", "I need you to...")
• Disrespect for boundaries (ignoring "no", pushing too fast)
• Love bombing (excessive affection way too soon)
• Victim mentality (everyone's always the problem, never them)
• Hostility about exes (all exes are "crazy")
• Lying or inconsistencies
• Pressure for commitment/intimacy
• Possessiveness or jealousy

⚠️ WARNINGS (Proceed carefully):
• "No drama/no games" - often projection
• Vague or generic profiles (copy-paste vibes)
• Only group photos (hiding appearance)
• Inconsistent information
• Poor communication patterns
• Oversharing too soon
• Negativity or cynicism about dating

🟡 NOTICES (Worth noting):
• Low effort (minimal bio, one-word answers)
• Mismatched photos (different ages/styles)
• Unrealistic expectations
• Rigid requirements
• Self-deprecating humor (may indicate insecurity)

CONVERSATION PATTERNS:
• Response time/effort ratio (are they equally invested?)
• Who initiates contact
• Depth vs surface-level communication
• Consistency in interest level
• How they handle disagreement
• Questions asked vs statements made
• Respect for your time/boundaries

CONTEXT MATTERS:
• Early conversation vs established relationship
• Cultural differences in communication
• Anxiety/nervousness vs genuine disinterest
• Busy period vs pattern of unavailability

EXAMPLES OF GOOD ANALYSIS:

User: "They said 'no drama, no games'"
Your response: "🔴 CRITICAL: 'No drama, no games' - This phrase is a red flag 90% of the time. People who say this often bring the most drama. It's projection."

User: "They have all group photos"
Your response: "🟡 WARNING: Only group photos - Which one are they? This is either hiding their appearance or fishing for compliments. Ask for a solo pic early."
`;
```

```typescript
// lib/ai/prompts/conversations-prompt.ts

export const CONVERSATIONS_PROMPT = `
CONVERSATION THREAD ANALYSIS:

This is different from single messages - look for PATTERNS across all messages:

TOXIC PATTERNS:
🔴 CRITICAL:
• Escalation: Friendly → Aggressive quickly
• Gaslighting: "I never said that" when they clearly did
• Guilt tripping: Making you feel bad for having boundaries
• Hot/cold cycles: Intense affection → Complete distance → Repeat
• Blame shifting: Never their fault, always yours
• Dismissiveness: Minimizing your feelings ("you're too sensitive")
• Control: Dictating your behavior, checking up constantly
• Manipulation: Twisting your words, playing victim

⚠️ WARNINGS:
• One-sided effort (you initiate 80%+ of conversations)
• Response time games (deliberate delays to keep you anxious)
• Breadcrumbing (just enough attention to keep you interested, never commits)
• Selective availability (only responds when they want something)
• Avoiding important questions (deflects when you bring up concerns)
• Surface-level only (never deepens, always small talk)
• Defensive when questioned (can't handle accountability)

METRICS TO TRACK:
1. **Message Ratio**: Who sends more? 50/50 is healthy, 80/20 is a problem
2. **Initiation**: Who starts conversations? Should be roughly equal
3. **Response Quality**: One-word answers vs thoughtful engagement
4. **Question Balance**: Do they ask about you, or just talk about themselves?
5. **Consistency**: Stable pattern or erratic (hot/cold)?
6. **Respect**: How do they handle disagreement or "no"?
7. **Growth**: Is conversation deepening over time or staying surface?

TIMELINE ANALYSIS:
Analyze how dynamics changed over time:
• **Beginning**: How did it start? Initial enthusiasm?
• **Middle**: When did patterns shift? What triggered it?
• **Recent**: Is it getting better or worse?
• **Trajectory**: Based on pattern, where is this heading?

OUTPUT REQUIREMENTS:
• Message-by-message breakdown (if <10 messages)
• Pattern summary across all messages
• Effort ratio (e.g., "You send 75%, they send 25%")
• Timeline of how things shifted (Week 1 vs Week 4)
• Prediction of likely future if pattern continues
• Specific advice for next interaction

EXAMPLE ANALYSIS:

User uploads 12 screenshots of a conversation thread.

Your response:
"Okay, I analyzed 12 messages. This is rough.

📊 Conversation Health: 3/10

Here's what's happening:
• YOU send 85% of messages (10 of 12)
• THEM: Mostly one-word responses
• Pattern: You ask question → They ignore or give vague answer → You ask again

🔴 RED FLAG: One-sided effort
Evidence: Messages 1, 3, 5, 7, 9, 11 - all from you. They only responded when you asked direct questions.

🔴 RED FLAG: Low investment
Evidence: Their responses average 3 words. Yours average 25 words.

📈 TIMELINE:
Week 1: You reached out, they seemed interested
Week 2: Responses got shorter, delays increased
Week 3: You're doing all the work now

This isn't equal effort. They're breadcrumbing you - giving just enough attention to keep you around, but not investing.

My advice: Stop initiating. If they're interested, they'll reach out. If they don't... you have your answer."
`;
```

**Similar prompts** exist for jobs, housing, marketplace categories.

### 5.3 Auto-Category Detection

```typescript
// lib/ai/category-detection.ts

export async function detectCategory(
  content: string,
  imageUrls?: string[]
): Promise<{ category: Category; confidence: number }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `Analyze this content and determine which category it belongs to:

CATEGORIES:
• dating: Dating profiles, relationship messages, romantic content
• conversations: Text message threads, email chains, DMs (any back-and-forth communication)
• jobs: Job postings, work emails, company communications, offers
• housing: Rental listings, roommate ads, lease agreements
• marketplace: Sales listings, product ads, buying/selling communications
• general: Everything else

Content: ${content}
${imageUrls?.length ? `Images: ${imageUrls.length} attached` : ''}

Respond ONLY with JSON:
{
  "category": "dating|conversations|jobs|housing|marketplace|general",
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Parse JSON
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { category: 'general', confidence: 0.5 };
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    category: parsed.category,
    confidence: parsed.confidence
  };
}
```

---

## 6. Storage Architecture

### 6.1 Cloudinary Integration

**Upload Flow**:
```typescript
// lib/storage/cloudinary-client.ts

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: File,
  folder: string = 'red-flag-detector'
): Promise<CloudinaryUpload> {
  // Note: All uploads are proxied through /api/upload (no CORS needed)
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Upload
  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Handles images, PDFs, etc.
        transformation: [
          { quality: 'auto:good' }, // Auto-optimize
          { fetch_format: 'auto' }  // Serve WebP if supported
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
  
  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    size: result.bytes,
  };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
```

**Auto-Deletion Cron Job**:
```typescript
// app/api/cron/cleanup-files/route.ts

export async function GET(request: Request) {
  // Verify cron secret (Vercel Cron Jobs)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get retention period from environment (default: 7 days)
  const retentionDays = parseInt(process.env.FILE_RETENTION_DAYS || '7', 10);
  console.log(`Running cleanup with ${retentionDays} day retention`);

  // Find files past auto_delete_at
  const expiredFiles = await db
    .select()
    .from(uploadedFiles)
    .where(
      and(
        lt(uploadedFiles.autoDeleteAt, new Date()),
        isNull(uploadedFiles.deletedAt)
      )
    );
  
  // Delete from Cloudinary
  for (const file of expiredFiles) {
    try {
      await deleteFromCloudinary(file.cloudinaryPublicId);
      
      // Mark as deleted in database
      await db
        .update(uploadedFiles)
        .set({ deletedAt: new Date() })
        .where(eq(uploadedFiles.id, file.id));
      
      console.log(`Deleted file: ${file.id}`);
    } catch (error) {
      console.error(`Failed to delete file ${file.id}:`, error);
    }
  }

  console.log(`Cleanup complete: ${expiredFiles.length} files deleted`);
  return Response.json({
    deleted: expiredFiles.length,
    retentionDays
  });
}
```

**Vercel Cron Configuration** (`vercel.json`):
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

### 6.2 Image Compression (Client-Side)

```typescript
// lib/storage/image-compression.ts

import imageCompression from 'browser-image-compression';

export async function compressIfNeeded(file: File): Promise<File> {
  const COMPRESSION_THRESHOLD = 10 * 1024 * 1024; // 10 MB
  
  if (file.size <= COMPRESSION_THRESHOLD) {
    return file; // No compression needed
  }
  
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: 2560,
    useWebWorker: true,
    fileType: file.type,
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Compressed ${file.size} → ${compressedFile.size}`);
    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    return file; // Return original if compression fails
  }
}
```

---

## 7. Authentication Architecture

### 7.1 NextAuth.js Configuration

**Provider:** NextAuth.js v5

**Database:** Supabase PostgreSQL (via Vercel Integration)

**Adapter:** Drizzle Adapter

**Email Service:** Resend (for verification emails)

**Environment Variables:**

```typescript
// Uses Supabase PostgreSQL connection strings from Vercel Integration
POSTGRES_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
NEXTAUTH_URL=http://localhost:3000 (or production URL)
NEXTAUTH_SECRET=[generated-secret]
RESEND_API_KEY=re_xxx
GITHUB_CLIENT_ID=***
GITHUB_CLIENT_SECRET=***
```

**Configuration:**

```typescript
// lib/auth/auth-config.ts

import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: 'jwt', // Important for credentials provider
  },
  providers: [
    // GitHub OAuth (no email verification needed)
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    
    // Email/Password (requires email verification)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Find user in database
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);
        
        if (!user[0]) {
          return null;
        }
        
        // Check if email is verified
        if (!user[0].emailVerified) {
          throw new Error('Please verify your email before signing in');
        }
        
        // Verify password
        const isPasswordValid = await compare(
          credentials.password,
          user[0].password
        );
        
        if (!isPasswordValid) {
          return null;
        }
        
        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // GitHub OAuth users are pre-verified
      if (account?.provider === 'github') {
        return true;
      }
      // Email/password users must be verified (checked in authorize)
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/verify-email', // Email verification page
    error: '/error',
  },
});
```

**Signup API Route:**

```typescript
// app/api/auth/signup/route.ts

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { sendVerificationEmail } from '@/lib/email/verification';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser[0]) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Generate verification token
    const verificationToken = nanoid(32);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      emailVerified: null, // Not verified yet
      verificationToken,
    }).returning();
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    
    return NextResponse.json({
      message: 'Account created! Please check your email to verify.',
      userId: newUser.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

**Email Verification Handler:**

```typescript
// app/api/auth/verify-email/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (!token) {
    return NextResponse.json(
      { error: 'Invalid verification token' },
      { status: 400 }
    );
  }
  
  // Find user with this token
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.verificationToken, token))
    .limit(1);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid verification token' },
      { status: 400 }
    );
  }
  
  // Mark email as verified
  await db
    .update(users)
    .set({
      emailVerified: new Date(),
      verificationToken: null,
    })
    .where(eq(users.id, user.id));
  
  // Redirect to login page with success message
  return NextResponse.redirect(
    new URL('/login?verified=true', request.url)
  );
}
```

**Email Service (Resend):**

```typescript
// lib/email/verification.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  
  await resend.emails.send({
    from: 'Red Flag Detector <noreply@redflagdetector.com>',
    to: email,
    subject: 'Verify your email - Red Flag Detector',
    html: `
      <h1>Welcome to Red Flag Detector!</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
  });
}
```

**Database Connection (Drizzle + Supabase):**

```typescript
// lib/db/index.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);

export const db = drizzle(client);
```

**Why NextAuth.js + Supabase PostgreSQL:**

- ✅ NextAuth.js works with any PostgreSQL database
- ✅ Supabase provides standard PostgreSQL (not locked-in)
- ✅ Drizzle Adapter handles user/session tables automatically
- ✅ Flexible - can add more auth providers easily
- ✅ Can migrate to different database provider later

---
## 8. Rate Limiting & Usage Tracking

### 8.1 Middleware Implementation

```typescript
// lib/rate-limiting/usage-tracker.ts

export async function checkRateLimits(
  userId: string
): Promise<{ canAnalyze: boolean; reason?: string; resetTime?: Date }> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  
  // Daily limit check
  const dailyUsage = await getUserDailyUsage(userId);
  if (dailyUsage >= 2) {
    const resetTime = new Date(today);
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);
    
    return {
      canAnalyze: false,
      reason: 'daily_limit',
      resetTime,
    };
  }
  
  // Monthly limit check
  const monthlyUsage = await getUserMonthlyUsage(userId, currentMonth);
  if (monthlyUsage >= 10) {
    const resetTime = new Date(currentMonth + '-01');
    resetTime.setMonth(resetTime.getMonth() + 1);
    
    return {
      canAnalyze: false,
      reason: 'monthly_limit',
      resetTime,
    };
  }
  
  return { canAnalyze: true };
}

async function getUserMonthlyUsage(userId: string, month: string): Promise<number> {
  const result = await db
    .select({ total: sql<number>`SUM(${usageLogs.analysisCount})` })
    .from(usageLogs)
    .where(
      and(
        eq(usageLogs.userId, userId),
        sql`to_char(${usageLogs.date}, 'YYYY-MM') = ${month}`
      )
    );
  
  return result[0]?.total || 0;
}
```
### 8.2 Global Rate Limiting (Gemini API Protection)

**Problem:** Gemini API has a hard limit of 1,500 requests/day. If we hit this limit, all users see errors.

**Solution:** Implement global rate limiting with safety buffer and mutex for atomic operations.

**Implementation (In-Memory with Mutex):**
```typescript
// lib/rate-limiting/global-limiter.ts

// In-memory storage (resets daily at midnight UTC)
let dailyGlobalCount = 0;
let lastResetDate = new Date().toISOString().split('T')[0];
let mutexLocked = false;

const GLOBAL_DAILY_LIMIT = 1400; // 100-request buffer under Gemini's 1,500 limit

// Simple mutex to prevent race conditions
async function acquireMutex(): Promise<void> {
  while (mutexLocked) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  mutexLocked = true;
}

function releaseMutex(): void {
  mutexLocked = false;
}

export async function checkGlobalRateLimit(): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}> {
  await acquireMutex();
  try {
    const today = new Date().toISOString().split('T')[0];

    // Reset counter at midnight UTC
    if (today !== lastResetDate) {
      dailyGlobalCount = 0;
      lastResetDate = today;
    }

    const allowed = dailyGlobalCount < GLOBAL_DAILY_LIMIT;
    const remaining = Math.max(0, GLOBAL_DAILY_LIMIT - dailyGlobalCount);

    // Calculate next reset time (midnight UTC)
    const resetTime = new Date();
    resetTime.setUTCHours(24, 0, 0, 0);

    return { allowed, remaining, resetTime };
  } finally {
    releaseMutex();
  }
}

export async function incrementGlobalCount(): Promise<void> {
  await acquireMutex();
  try {
    dailyGlobalCount++;
  } finally {
    releaseMutex();
  }
}

export function getCurrentGlobalCount(): number {
  return dailyGlobalCount;
}
```

**Note:** This in-memory implementation includes a mutex to prevent race conditions during concurrent requests. The counter resets at midnight UTC daily.

**Usage in API Route:**
```typescript
// app/api/chat/route.ts

export async function POST(req: Request) {
  // ... auth check ...
  
  // Step 1: Check user rate limit
  const userLimit = await checkUserRateLimit(userId);
  if (!userLimit.allowed) {
    return Response.json(
      { 
        error: 'Daily limit reached',
        resetTime: userLimit.resetTime 
      },
      { status: 429 }
    );
  }
  
  // Step 2: Check global rate limit
  const globalLimit = await checkGlobalRateLimit();
  if (!globalLimit.allowed) {
    return Response.json(
      { 
        error: 'High traffic',
        message: 'We\'re experiencing high traffic. Your free analyses are safe - this won\'t count against your daily limit. Please try again in a few hours, or upgrade to Pro for priority access.',
        resetTime: globalLimit.resetTime,
        isGlobalLimit: true
      },
      { status: 503 } // Service Unavailable (not 429 - doesn't count against user)
    );
  }
  
  // Proceed with analysis
  const analysis = await analyzeWithGemini(...);
  
  // Increment both counters
  await incrementUserUsage(userId);
  incrementGlobalCount();
  
  return Response.json(analysis);
}
```

**Why 1,400 instead of 1,500:**
- **Safety buffer:** 100 requests (7%) protects against:
  - Clock drift between our server and Google's
  - Concurrent requests (mutex prevents race conditions)
  - Traffic spikes
- **Better UX:** Prevents hitting Gemini's hard limit which returns errors
- **Graceful degradation:** Users get helpful message instead of API error

**Limitations of In-Memory Approach:**
- Counter resets if server restarts (Vercel serverless function cold start)
- Not shared across multiple serverless function instances
- Acceptable for MVP with low traffic

**Monitoring:**
- Check `getCurrentGlobalCount()` in admin dashboard
- Alert if approaching 1,000+ requests/day (expansion planning needed)
- Log to Vercel when global limit hit

**V1.1 Improvements:**
- Move counter to Vercel KV or Redis for persistence across function restarts
- Implement request queue when near limit (using Inngest or BullMQ)
- Priority queue for Pro users

### 8.3 Rate Limit Reset Times & Timezone

**All rate limits reset at midnight UTC (00:00 UTC).**

**User-facing display:**
```typescript
// components/chat/rate-limit-indicator.tsx

function RateLimitIndicator({ resetTime }: { resetTime: Date }) {
  const [timeUntilReset, setTimeUntilReset] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = resetTime.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [resetTime]);
  
  return (
    <div className="text-sm text-gray-600">
      Free tier: 2 analyses per day
      <br />
      Resets daily at midnight UTC
      <br />
      <strong>Next reset in: {timeUntilReset}</strong>
    </div>
  );
}
```

**FAQ/Help Documentation:**
```markdown
Q: When do my free analyses reset?
A: Every day at 00:00 UTC (midnight UTC time).

For reference:
- New York: 7 PM EST / 8 PM EDT
- Los Angeles: 4 PM PST / 5 PM PDT
- London: 12 AM GMT / 1 AM BST
- India: 5:30 AM IST
- Tokyo: 9 AM JST

You'll see a countdown timer showing exactly when your analyses reset.
```

**Why UTC:**
- Consistent across all users globally
- No daylight saving time confusion
- Server time = UTC (Vercel default)
- Clear communication via countdown timer

---

## 9. Deployment Architecture

### 9.1 Vercel Configuration

**Environment Variables** (`.env.local` for dev, Vercel dashboard for prod):
```bash
# Database (Supabase PostgreSQL via Vercel Integration)
POSTGRES_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
POSTGRES_PRISMA_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# Auth (NextAuth.js)
NEXTAUTH_URL=https://redflagdetector.vercel.app
NEXTAUTH_SECRET=***
GITHUB_CLIENT_ID=***
GITHUB_CLIENT_SECRET=***

# Email Service (Resend)
RESEND_API_KEY=re_xxx

# AI
GOOGLE_AI_API_KEY=***

# Storage
CLOUDINARY_CLOUD_NAME=***
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***

# Cron
CRON_SECRET=*** # For securing cron endpoints

# File Retention (days)
FILE_RETENTION_DAYS=7
```

### 9.2 Build Configuration

**`next.config.js`**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

**`package.json`** (key dependencies - using bleeding-edge versions):
```json
{
  "dependencies": {
    "next": "15.3.0-canary.31",
    "react": "19.0.0-rc-45804af1-20241021",
    "react-dom": "19.0.0-rc-45804af1-20241021",
    "@ai-sdk/google": "^0.0.52",
    "@ai-sdk/react": "2.0.26",
    "@ai-sdk/provider": "2.0.0",
    "ai": "5.0.26",
    "next-auth": "5.0.0-beta.25",
    "@auth/drizzle-adapter": "^1.5.0",
    "drizzle-orm": "^0.34.0",
    "@vercel/postgres": "^0.10.0",
    "cloudinary": "^2.5.0",
    "browser-image-compression": "^2.0.2",
    "react-dropzone": "^14.2.3",
    "bcryptjs": "^2.4.3",
    "resend": "^3.0.0",
    "nanoid": "^5.0.8",
    "tailwindcss": "^4.1.13",
    "typescript": "^5.6.3"
  },
  "devDependencies": {
    "drizzle-kit": "^0.25.0",
    "@types/node": "^22.8.6",
    "@types/react": "^18",
    "@types/bcryptjs": "^2.4.6",
    "tsx": "^4.19.1"
  },
  "packageManager": "pnpm@9.12.3"
}
```

**Note:** Using bleeding-edge versions from Vercel AI Chatbot boilerplate. React 19 RC and Next.js 15 canary provide latest features but may have edge cases.

---

## 10. Error Handling & Logging

### 10.1 Error Boundary (Client-Side)

```typescript
// components/shared/error-boundary.tsx

'use client';

export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service (future)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 10.2 API Error Handling

```typescript
// lib/utils/api-error-handler.ts

export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);
  
  if (error instanceof RateLimitError) {
    return Response.json(
      { error: 'Rate limit exceeded', resetTime: error.resetTime },
      { status: 429 }
    );
  }
  
  if (error instanceof AuthenticationError) {
    return Response.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  if (error instanceof ValidationError) {
    return Response.json(
      { error: error.message, fields: error.fields },
      { status: 400 }
    );
  }
  
  // Generic error
  return Response.json(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 }
  );
}
```

---

## 11. Security Considerations

### 11.1 Input Validation

```typescript
// lib/utils/validators.ts

import { z } from 'zod';

export const FileUploadSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z.number().max(100 * 1024 * 1024, 'File too large (max 100MB)'),
        type: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
      })
    )
    .max(5, 'Maximum 5 files allowed'),
});

export const AnalysisRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  category: z.enum(['dating', 'conversations', 'jobs', 'housing', 'marketplace', 'general']).optional(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().max(50000, 'Message too long'),
    })
  ),
  files: z.array(z.string().url()).max(5).optional(),
});
```

### 11.2 Content Security Policy

```typescript
// middleware.ts (Next.js middleware)

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // CSP Headers
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https://res.cloudinary.com data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  
  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
```

---

## 12. Performance Optimization

### 12.1 Image Optimization

- Use Next.js `<Image>` component for all images
- Cloudinary auto-optimization enabled
- Lazy loading for conversation history
- Progressive image loading

### 12.2 Code Splitting

- Dynamic imports for heavy components
- Route-based code splitting (automatic with App Router)
- Lazy load Gemini client only when needed

### 12.3 Caching Strategy

```typescript
// Server Component caching
export const revalidate = 3600; // Revalidate every hour

// API Route caching
export const dynamic = 'force-dynamic'; // For /api/chat (always fresh)
export const dynamic = 'force-static'; // For landing page (static)
```
### 12.4 Accessibility (a11y) - MVP Requirements

**Goal:** Basic accessibility compliance for MVP. Full WCAG 2.1 AA compliance in V1.1.

**MVP Checklist:**

#### **1. Keyboard Navigation**
```typescript
// All interactive elements must be keyboard accessible
<button 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  tabIndex={0}
>
  Analyze
</button>
```

#### **2. Focus Indicators**
```css
/* Ensure visible focus states */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

#### **3. ARIA Labels**
```typescript
// Red Flag Score Card
<div 
  role="region" 
  aria-label="Red flag analysis results"
  aria-live="polite" // Announces when results appear
>
  <div aria-label={`Red flag score: ${score} out of 10`}>
    {score}/10
  </div>
  
  <button 
    aria-label="Share analysis results"
    onClick={handleShare}
  >
    Share
  </button>
</div>

// File upload
<button aria-label="Upload files for analysis">
  <UploadIcon aria-hidden="true" />
  Upload
</button>
```

#### **4. Color + Icon/Text (Not Color Alone)**
```typescript
// Use emoji + text, not just color
<div className="flex items-center gap-2">
  <span aria-hidden="true">🔴</span>
  <span className="text-red-600 font-semibold">CRITICAL</span>
</div>

<div className="flex items-center gap-2">
  <span aria-hidden="true">🟡</span>
  <span className="text-yellow-600 font-semibold">WARNING</span>
</div>

<div className="flex items-center gap-2">
  <span aria-hidden="true">🟢</span>
  <span className="text-green-600 font-semibold">NOTICE</span>
</div>
```

#### **5. Alt Text**
```typescript
// Images from analysis
<img 
  src={imageUrl} 
  alt="Uploaded screenshot for analysis"
  loading="lazy"
/>

// Logo
<img 
  src="/logo.png" 
  alt="Red Flag Detector"
/>
```

#### **6. Form Labels**
```typescript
// Always associate labels with inputs
<label htmlFor="category-select">
  Select category
</label>
<select id="category-select" name="category">
  <option value="dating">Dating</option>
  ...
</select>
```

**shadcn/ui provides most of this automatically** ✅

**Manual testing required:**
- Tab through entire app (should reach all interactive elements)
- Use app with keyboard only (no mouse)
- Test with Windows Narrator or macOS VoiceOver (basic check)

**V1.1 Full Compliance:**
- Professional screen reader testing
- WCAG 2.1 AA audit
- Color contrast analyzer (all text passes 4.5:1 ratio)
- High contrast mode
- Text resizing support (up to 200%)
---

## 13. Monitoring & Observability

### 13.1 Vercel Analytics (Basic)

- Automatically enabled
- Tracks page views, user counts
- No code changes needed

### 13.2 Custom Logging

```typescript
// lib/utils/logger.ts

export function logEvent(event: string, data?: any) {
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({ event, data, timestamp: new Date() }));
    // TODO V1.1: Send to analytics service
  } else {
    console.log(`[${event}]`, data);
  }
}

// Usage
logEvent('analysis_completed', {
  userId: session.user.id,
  category: 'dating',
  score: 7.5,
  fileCount: 3,
});
```
### 13.3 Resource Usage Monitoring

**Critical Metrics to Monitor:**

#### **1. Cloudinary Storage**
**Limit:** 25 GB free tier

**Check weekly (manual for MVP):**
- Login to Cloudinary dashboard
- Check "Usage" → "Storage"
- Alert threshold: 20 GB (80% full)

**Action at 20 GB:**
- Reduce auto-delete time (7 days → 5 days)
- Or upgrade to paid plan ($99/month for 75 GB)

**Calculation (with 30% safety buffer):**
```
Average file size: 5 MB (after compression)
25 GB total capacity
Alert at 20 GB (80% full) = 4,000 files
Per active user: ~50 MB (5 images @ 10 MB compressed to ~5 MB each)
Capacity: ~350 active users before hitting 80% threshold (20 GB / 50 MB)
```

#### **2. Supabase PostgreSQL Database**
**Limit:** 500 MB free tier

**Check weekly:**
- Supabase dashboard → Settings → Database
- Alert threshold: 400 MB (80% full)

**Action at 400 MB:**
- Run cleanup query (delete old soft-deleted records)
- Or upgrade to Supabase Pro ($25/month for 8 GB)

**Calculation (with 30% safety buffer):**
```
Per active user: ~150 KB (conversations + messages + usage logs)
500 MB total capacity
Alert at 400 MB (80% full)
Capacity: ~2,400 active users before hitting 80% threshold (400 MB / 150 KB)
```

#### **3. Gemini API Usage**
**Limit:** 1,500 requests/day (free tier)

**Check daily (first week), then weekly:**
- Our global limiter: `getCurrentGlobalCount()`
- Alert threshold: 1,000 requests/day (71% of 1,400 cap)

**Action at 1,000/day:**
- Approaching capacity (we cap at 1,400 for safety)
- Plan for paid tier or optimize prompts
- Estimated capacity: ~525 daily active users (1,000 / (2 analyses × 0.95 success rate))

#### **4. Vercel Bandwidth**
**Limit:** 100 GB/month (Hobby plan)

**Check weekly:**
- Vercel dashboard → Usage
- Alert threshold: 80 GB

**Mostly used by:**
- Image uploads (proxied through /api/upload)
- Page loads

**V1.1 Automation:**
- Cloudinary webhook → alert when 80% full
- Database size query in admin dashboard
- Daily Gemini usage log
- Vercel API for bandwidth monitoring
---

## 14. Testing Strategy

### 14.1 Testing Framework Setup (MVP)

**Unit Tests (Vitest)**:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
```

**E2E Tests (Playwright)**:
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

**Test Utilities**:
```typescript
// tests/utils/test-helpers.ts
import { Session } from 'next-auth';

export function mockSession(overrides?: Partial<Session>): Session {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      ...overrides?.user,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

export async function seedDatabase() {
  // Seed test data for E2E tests
}

export function mockGeminiResponse(score: number) {
  return {
    score,
    verdict: 'Test verdict',
    flags: [],
    positives: [],
    advice: 'Test advice',
    explanation: 'Test explanation',
  };
}
```

### 14.2 MVP Testing Scope

**What to test:**
- ✅ Critical user flows (auth, upload, analysis)
- ✅ Rate limiting logic (user + global)
- ✅ Database query functions
- ✅ Error handling
- ✅ File upload/compression

**What to defer to V1.1:**
- Comprehensive E2E coverage
- Visual regression tests
- Load/stress testing
- Security penetration testing

---

## 15. Version History

**Version 1.2** (November 2025 - Updated to Bleeding-Edge Versions)
- Updated to Next.js 15.3.0-canary.31 (with Turbopack)
- Updated to React 19.0.0-rc (latest RC)
- Updated to AI SDK v5.0.26 (with separate @ai-sdk/react package)
- Updated to Gemini 2.5 Flash model
- Updated to Drizzle ORM 0.34.0 and Drizzle Kit 0.25.0
- Updated to NextAuth.js v5.0.0-beta.25
- Updated to Tailwind CSS 4.1.13
- Fixed Drizzle Kit commands (removed deprecated `:pg` suffix)
- Added pnpm as package manager
- Updated all package installation commands to use pnpm
- Added AI SDK v5 breaking changes documentation

**Version 1.1** (November 2025 - Revised)
- Removed Resend email service from architecture diagram
- Updated diagram to show simplified external services
- Removed email verification page from NextAuth config (OAuth only for MVP)
- Enhanced global rate limiting with mutex for atomic operations
- Added detailed implementation notes for in-memory rate limiting
- Made file retention configurable via FILE_RETENTION_DAYS environment variable
- Updated capacity estimates with 30% safety buffers and realistic calculations
- Added note that Cloudinary uploads are server-side (no CORS needed)
- Enhanced cron job with logging and configurable retention
- Added comprehensive testing strategy section (Vitest + Playwright)
- Updated resource monitoring calculations with alert thresholds
- Clarified limitations of in-memory global rate limiting
- Added V1.1 improvement notes for persistent storage solutions

**Version 1.0** (November 2025)
- Initial architecture document

---

**Document Version**: 1.1
**Last Updated**: November 2025 (Revised)
**Status**: Ready for Implementation
