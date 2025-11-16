# Product Requirements Document: Red Flag Detector

## 1. Product Overview

### 1.1 Product Name
**Red Flag Detector**

### 1.2 Tagline
"Spot the warning signs before it's too late"

### 1.3 Vision Statement
Red Flag Detector uses AI to analyze dating profiles, conversations, job postings, housing ads, and marketplace listings to identify warning signs and potential red flags that users might miss. It provides honest, actionable feedback to help users make better decisions.

### 1.4 Target Audience
- **Primary**: People actively dating (18-40 years old)
- **Secondary**: Job seekers, apartment hunters, online marketplace buyers
- **Device**: Mobile-first (80% mobile, 20% desktop expected)

---

## 2. MVP Scope

### 2.1 Core Features

#### Feature 1: Multi-Category Analysis
**Description**: Users can analyze content across 5 categories:
1. 💕 Dating Profiles
2. 💬 Conversations/Messages
3. 💼 Job Postings
4. 🏠 Housing/Roommate Ads
5. 💰 Marketplace Listings

**User Story**: As a user, I want to select a category that matches my content so the AI provides relevant analysis.

**Acceptance Criteria**:
- Category selector visible in chat interface
- System prompts adapt based on selected category
- Auto-detection suggests category if user uploads without selecting
- User can change category mid-conversation

#### Feature 2: Multi-File Upload
**Description**: Users can upload multiple screenshots or documents for comprehensive analysis.

**User Story**: As a user, I want to upload an entire conversation thread (10+ screenshots) so the AI can analyze patterns across all messages.

**Acceptance Criteria**:
- Support up to 5 files per analysis (free tier)
- Supported formats: JPG, PNG, PDF
- Max file size: 100 MB per file
- Visual staging area showing all uploaded files before analysis
- Ability to remove files before analyzing
- Progress indicator during upload
- Automatic ordering detection (chronological for conversations)

#### Feature 3: AI-Powered Red Flag Detection
**Description**: Gemini 2.5 Flash analyzes content and identifies warning signs.

**User Story**: As a user, I want to receive a detailed breakdown of red flags so I can make informed decisions.

**Acceptance Criteria**:
- Analysis completes within 30 seconds for 5 images
- Returns structured JSON with:
  - Red Flag Score (0-10)
  - Severity-categorized flags (Critical, Warning, Notice)
  - Specific evidence (exact quotes)
  - Explanations for each flag
  - Positive aspects identified
  - Actionable advice
- Natural language explanation following JSON
- Conversation context remembered for follow-up questions

#### Feature 4: Custom Red Flag Score Card UI
**Description**: Visual display of analysis results optimized for mobile.

**User Story**: As a user, I want to quickly understand the severity of red flags through visual elements.

**Acceptance Criteria**:
- Score prominently displayed (0-10 scale)
- Color-coded severity (🔴 Critical, 🟡 Warning, 🟢 Notice)
- Expandable sections for each flag
- Evidence quoted from source material
- Share button integrated
- Mobile-optimized card layout

#### Feature 5: Conversation History
**Description**: Users can review past analyses and continue conversations.

**User Story**: As a user, I want to access my previous analyses so I can reference them later.

**Acceptance Criteria**:
- Sidebar showing all past conversations
- Search/filter by category
- Red flag score visible in conversation preview
- Clicking conversation loads full history with context
- Images deleted after 7 days (text/analysis remains)

### 2.2 Authentication & User Management

#### Authentication Options
**Primary Method:** Email/Password (with email verification via Resend)
**Alternative Method:** GitHub OAuth (no verification needed - GitHub pre-verifies)

**Why NextAuth.js:**
- Maximum flexibility (mix OAuth, credentials, magic links)
- Custom callbacks for usage tracking
- Works with any database (not locked to Supabase)
- Better middleware support for route protection
- Easier migration if we switch databases later

**Database:** Supabase PostgreSQL (via Vercel Integration)

#### Email/Password Flow:
1. User enters email + password on signup
2. Account created in Supabase database (password hashed with bcrypt)
3. Verification email sent via Resend
4. User clicks verification link in email
5. Email marked as verified in database
6. User can now sign in with email/password
7. Login checks email verification status before allowing access

#### GitHub OAuth Flow:
1. User clicks "Sign in with GitHub"
2. GitHub OAuth redirect
3. User authorizes on GitHub
4. GitHub returns to app
5. Account created automatically in Supabase database
6. Email pre-verified by GitHub (no verification needed)
7. User signed in immediately

**Why These Methods:**
- **Email/Password:** Universal (100% coverage), user controls data, no dependency on third-party OAuth
- **GitHub:** One-click for tech users, no verification needed, popular with developers

**Coverage:** 100% (anyone with email can sign up)

**No guest mode** - authentication required for all features

**Future Providers (V1.1):**
- **Google OAuth** (if conversion rate is low, add one-click option)
- **Apple Sign In** (if iOS users dominate)
- Welcome emails
- Notification emails (weekly digests, rate limit reminders)

### 2.3 Free Tier Limits

```
Free Tier Limits:
├─ Daily: 2 analyses per day
├─ Per Analysis: 5 images maximum
├─ Monthly: 10 analyses per month (hard cap)
└─ Storage: Images auto-deleted after 7 days
```

**Rate Limiting Behavior**:
- After 2nd daily analysis: "You've used 2/2 free analyses today. Want to continue? [Try Pro free for 7 days] [Wait X hours]"
- Countdown timer showing time until reset
- Soft prompt (not hard block) to upgrade

**Rate Limit Reset Time:**
- All limits reset at **00:00 UTC** (midnight UTC time)
- Users see countdown timer: "Resets in: 8h 23m"
- FAQ explains timezone conversions for major cities

**Global Rate Limiting:**
- System-wide limit: 1,400 analyses/day (buffer under Gemini's 1,500 limit)
- If global limit hit: Users see "High traffic, try again later"
- Doesn't count against user's personal daily/monthly limit
- Protects against hitting Gemini API hard limit

### 2.4 Data Retention Policy (UX-First Approach)

**Default Settings**:
- **Images**: Auto-delete after 7 days
- **Analysis Results**: Keep forever (unless user deletes)
- **Conversations**: Keep forever (unless user deletes)
- **User Control**: Settings page allows changing retention preferences

**Privacy Compliance**:
- User can download all data (JSON export)
- User can delete all data (permanent, 48-hour processing)
- Individual analysis export (PDF/JSON)
- GDPR-compliant deletion

**Resource Monitoring:**
- **Cloudinary:** 25 GB free tier, alert at 20 GB (80% full)
- **Supabase Postgres:** 500 MB free tier, alert at 400 MB (80% full)
- **Gemini API:** 1,500 requests/day, cap at 1,400 (safety buffer)

**Estimated Capacity (with 30% safety buffer):**
- Cloudinary: ~350 active users before hitting 80% threshold (20 GB / ~50 MB per user)
- Supabase Postgres: ~2,400 active users before hitting 80% threshold (400 MB / ~150 KB per user)
- Gemini: ~525 daily active users before hitting 71% threshold (1,000 / (2 analyses * 0.95 success rate))

**Note:** "Active user" = user who has analyzed content in the past 7 days
  
---

## 3. Technical Requirements

### 3.1 Tech Stack

**Frontend**:
- Next.js 15.3.0-canary.31 (App Router with Turbopack)
- React 19.0.0-rc (latest RC)
- TypeScript 5.6.3
- Tailwind CSS 4.1.13
- shadcn/ui components
- Vercel AI SDK v5.0.26

**Backend**:
- Next.js API Routes
- Supabase Postgres (database via Vercel Integration) - 500 MB free tier
- NextAuth.js v5 (authentication with Email/Password + GitHub OAuth)
- Drizzle ORM (type-safe database queries)
- Cloudinary (image/PDF storage) - 25 GB free tier
- Gemini 2.5 Flash API (AI analysis via AI SDK v5)

**Why This Stack:**
- **Supabase**: PostgreSQL database with no cold starts
- **NextAuth.js**: Flexible auth, works with any database
- **Drizzle ORM**: Type-safe, lightweight, perfect for Supabase
- **Cloudinary**: Best-in-class image optimization and CDN
- **Vercel Integration**: One-click Supabase setup, auto-configured

**Deployment**:
- Vercel (hosting, free tier)
- Vercel Analytics (basic metrics)

### 3.2 Database Schema

```sql
-- Users (managed by NextAuth)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMP,
  name TEXT,
  image TEXT,
  password TEXT, -- For email/password authentication (hashed with bcrypt)
  verification_token TEXT, -- For email verification
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts (OAuth providers)
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('dating', 'conversations', 'jobs', 'housing', 'marketplace', 'general')),
  red_flag_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- Soft delete
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  red_flag_data JSONB, -- Structured analysis results
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- Soft delete
);

-- Uploaded Files
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  auto_delete_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- Usage Tracking (for rate limiting)
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_count INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_usage_logs_user_date ON usage_logs(user_id, date);
CREATE INDEX idx_uploaded_files_auto_delete ON uploaded_files(auto_delete_at) WHERE deleted_at IS NULL;
```

### 3.3 Image Storage Strategy

**Storage Provider**: Cloudinary (Free Tier: 25 GB storage, 25 GB bandwidth/month)

**Upload Flow**:
```
1. User selects files
2. Frontend compresses if >10 MB (target: 5 MB)
3. Upload to Cloudinary
4. Store Cloudinary URL + public_id in database
5. Send Cloudinary URL to Gemini for analysis
6. Cron job deletes files after 7 days
```

**Compression Settings**:
- Only compress files >10 MB
- Target: 5 MB max
- Max dimensions: 2560px
- Quality: 85%

**File Limits**:
- Max file size: 100 MB (Cloudinary free tier limit)
- Max files per analysis: 5 (free tier)
- Supported formats: JPG, PNG, PDF

### 3.4 AI Analysis Pipeline

**Provider**: Google Gemini 2.5 Flash via AI Studio (using AI SDK v5.0.26)

**Analysis Flow**:
```
1. User uploads files + optional text
2. System determines category (user-selected or auto-detected)
3. Load category-specific system prompt
4. Construct multi-modal message (text + images)
5. Call Gemini API with streaming
6. Parse JSON from response (red flag data)
7. Stream natural language explanation to user
8. Store analysis results in database
9. Display Red Flag Score Card
```

**Rate Limits**:
- Free tier: 15 requests/minute, 1,500 requests/day
- Our limit: 2 analyses/user/day (well within Gemini limits)

**Context Management**:
- Full conversation history sent with each message
- Images referenced by Cloudinary URL (not re-uploaded)
- Analysis results stored in message.red_flag_data (JSONB)

### 3.5 API Integrations

| Service | Purpose | Free Tier Limit | API Key Required |
|---------|---------|-----------------|------------------|
| Gemini 2.5 Flash | AI analysis | 1,500/day | Yes (Google AI Studio) |
| Supabase Postgres | Database | 500 MB, no cold starts | Yes (via Vercel integration) |
| Cloudinary | Image storage | 25 GB storage, 25 GB bandwidth/month | Yes |
| NextAuth.js | Authentication | Unlimited | No (self-hosted) |
| Resend | Email service | 3,000 emails/month | Yes |
| Vercel Analytics | Basic metrics | Unlimited | No (integrated) |

### 3.6 Error Handling Philosophy

**Approach**: Fail silently with user-friendly messages

**Error Types**:
1. **Upload Errors**: "Couldn't upload that file. Try a different format?"
2. **API Errors**: "Analysis temporarily unavailable. Try again in a moment."
3. **Rate Limit**: "You've reached your daily limit. [Upgrade] or [Wait X hours]"
4. **Auth Errors**: "Please sign in to continue."

**Logging**: All errors logged server-side with full context (user ID, error stack, request details)

---

## 4. User Experience

### 4.1 Onboarding (Hybrid Approach)

**First-Time User Flow**:
1. User lands on home page
2. Clicks "Try Red Flag Detector"
3. Redirected to sign-in (Google/GitHub)
4. After OAuth, immediately lands in chat interface
5. **Pre-loaded example conversation** showing a sample analysis
6. User can see how it works immediately
7. Clear CTA: "Now try your own" with category buttons

**Example Pre-loaded**:
```
Bot: "Welcome! Here's an example of what I can do.

[Shows sample dating profile analysis with 7.5/10 score]

Now it's your turn! What should I analyze?

[💕 Dating] [💬 Messages] [💼 Jobs] [🏠 Housing] [💰 Marketplace]"
```

### 4.2 Primary User Flow

```
1. User selects category (or skips to upload directly)
   ↓
2. User uploads files (drag-drop or click)
   ↓
3. Files appear in staging area
   ↓
4. User can add more files or remove files
   ↓
5. User clicks "Analyze"
   ↓
6. Loading state with progress (10-30 seconds)
   ↓
7. Red Flag Score Card appears
   ↓
8. User can ask follow-up questions
   ↓
9. Bot remembers full context
   ↓
10. User can share results or start new analysis
```

### 4.3 Mobile-First Design Principles

**Priority**: 80% of development focus on mobile experience

**Mobile Optimizations**:
- Large tap targets (min 44x44px)
- Bottom-anchored input bar
- Swipe-friendly file carousel
- Collapsible score card sections
- Native share dialog integration
- Single-column layout
- Sticky category selector

**Desktop Enhancements**:
- Sidebar conversation history
- Drag-and-drop file upload
- Keyboard shortcuts
- Multi-column layout (chat + history)

### 4.4 Prompt Tone (Blunt & Helpful)

**Voice**: Direct, honest, slightly humorous, never condescending

**Example Responses**:

```
Dating Profile (Score: 8.5/10):
"Yikes. Red flag score: 8.5/10. Let me break down why this is a mess...

🔴 CRITICAL: 'No drama, no games'
→ Translation: They bring the most drama. This phrase is projection 90% of the time.

🔴 CRITICAL: All group photos
→ Which one are they? This is either hiding their appearance or fishing for compliments.

🟡 WARNING: 'Just ask'
→ Zero effort. They expect you to do all the work. Pass.

Bottom line: Swipe left and don't look back."
```

**Conversation Thread (Score: 3/10):**
```
"Okay, I analyzed 12 messages. This is rough.

📊 Conversation Health: 3/10

Here's what's happening:
• YOU send 85% of messages
• THEM: One-word responses
• Pattern: You ask → They ignore → You ask again

This isn't equal effort. They're breadcrumbing you.

My advice: Stop initiating. If they're interested, they'll reach out. If they don't... you have your answer."
```

---

## 5. Share Functionality

### 5.1 Priority Ranking

1. **Social Share** (Must Have) - Twitter/X, WhatsApp, Instagram
2. **Copy Link** (Must Have) - Share results via URL
3. **Generate Image Card** (Nice to Have) - Social media graphic
4. **Download PDF** (Nice to Have) - Formatted report

### 5.2 Social Share Implementation

**Pre-filled Text Templates**:

```typescript
const shareTemplates = {
  twitter: `I just ran a ${category} through Red Flag Detector 🚩

Score: ${score}/10
Verdict: ${verdict}

Try it yourself: redflagdetector.vercel.app`,

  whatsapp: `Just analyzed a ${category} with Red Flag Detector and got a ${score}/10 score 😬

${verdict}

You should try it: redflagdetector.vercel.app`,

  instagram: `Red Flag Score: ${score}/10 🚩
${verdict}
Link in bio to try it yourself!`
};
```

**Share Buttons**:
- Native mobile share dialog (if available)
- Fallback to custom share modal
- Analytics tracking on share events

### 5.3 Copy Link Feature

**Link Format**: `redflagdetector.vercel.app/analysis/{conversationId}`

**Public vs Private**:
- **Default**: Private (requires login to view)
- **Option**: "Make this analysis public" toggle
- Public links show analysis only (not full conversation)

---

## 6. Analytics & Monitoring

### 6.1 Metrics to Track (Vercel Analytics - Basic)

**User Metrics**:
- Signups per day
- Daily active users
- Monthly active users
- Retention (D1, D7, D30)

**Usage Metrics**:
- Analyses per day (by category)
- Average files per analysis
- Free tier limit hits
- Share button clicks

**Technical Metrics**:
- API response times
- Error rates
- Upload success rates
- Gemini API costs

### 6.2 Success Metrics (MVP Goals)

**Week 1**: 50 signups, 100 analyses
**Week 4**: 200 signups, 1,000 analyses
**Month 3**: 1,000 signups, 10,000 analyses

**Engagement KPIs**:
- 40% of users run 2+ analyses
- 20% of users return within 7 days
- 10% of users share results

---

## 7. Content & Messaging

### 7.1 Landing Page Copy

**Hero Section**:
```
Headline: Spot the warning signs before it's too late
Subheadline: AI-powered analysis for dating profiles, conversations, job postings, and more.

CTA: Try Red Flag Detector Free
```

**Features Section**:
```
1. 🎯 Multi-Category Analysis
   Dating profiles, job postings, conversations, housing ads, marketplace listings

2. 🧠 AI-Powered Detection
   Gemini 2.5 identifies patterns you might miss

3. 📊 Clear Red Flag Scores
   Understand severity at a glance (0-10 scale)

4. 🔒 Privacy-First
   Your data, your control. Delete anytime.
```

**Social Proof** (post-launch):
```
"Red Flag Detector called out every red flag I was ignoring. 10/10 would recommend."
— Sarah, 28

"Saved me from a terrible roommate situation. Worth every penny."
— Mike, 34
```

### 7.2 Category Descriptions

**💕 Dating Profiles**:
"Analyze Tinder, Bumble, Hinge profiles for red flags like love bombing, vague bios, and concerning language patterns."

**💬 Conversations**:
"Upload message threads to detect gaslighting, breadcrumbing, one-sided effort, and toxic communication patterns."

**💼 Job Postings**:
"Spot exploitative job ads with red flags like 'we're like a family,' undefined salaries, and unrealistic expectations."

**🏠 Housing/Roommates**:
"Check rental listings and roommate ads for scams, boundary issues, and unclear terms."

**💰 Marketplace Listings**:
"Identify scam listings on Facebook Marketplace, Craigslist, and OfferUp before you buy."

---

## 8. Out of Scope (V1.1 Features)

**Not in MVP**:
- ❌ Payment integration (Stripe)
- ❌ Pro tier features
- ❌ Email notifications (no email service provider needed)
- ❌ In-app tutorials/tooltips
- ❌ Advanced analytics dashboard
- ❌ Referral program
- ❌ Custom branding/white-label
- ❌ API for third-party integrations
- ❌ Browser extension
- ❌ Video analysis
- ❌ Real-time conversation monitoring
- ❌ Email/password authentication (OAuth only for MVP)
- ❌ Apple Sign In (requires paid developer account)
- ❌ Advanced monitoring dashboard (manual weekly checks via spreadsheet)
- ❌ Automated resource alerts (manual monitoring for Cloudinary, DB, API limits)

**Deferred to V1.1**:
- Stripe payment integration
- Upgrade prompts with free trial
- Usage dashboard (user-facing analytics)
- Weekly email digests
- Advanced sharing (image card generation, PDF export)
- SEO optimization
- Content marketing
- Email/password auth with email service provider
- Apple Sign In ($99/year Apple Developer account required)
- Welcome and notification emails
- Automated resource monitoring and alerts (PagerDuty, Sentry, etc.)
- Advanced rate limiting (queue system, priority for Pro users)
- Full WCAG 2.1 AA accessibility compliance audit
- Professional screen reader testing (JAWS, NVDA)
- High contrast mode support

---

## 9. Success Criteria

### 9.1 MVP Launch Checklist

**Must Have**:
- ✅ All 5 categories functional
- ✅ Multi-file upload (5 files max)
- ✅ Red Flag Score Card UI
- ✅ Email/Password authentication (with email verification)
- ✅ GitHub OAuth (no verification needed)
- ✅ Conversation history with search
- ✅ Rate limiting (2/day, 10/month)
- ✅ Share functionality (social + copy link)
- ✅ Mobile-responsive design
- ✅ Error handling with user-friendly messages
- ✅ Data export (GDPR compliance)
- ✅ Landing page with clear CTA
- ✅ Privacy policy + Terms of Service
- ✅ Auto-delete images after 7 days (configurable via FILE_RETENTION_DAYS)
- ✅ Global rate limiting (1,400/day cap with buffer, atomic operations)
- ✅ Retry logic (3 attempts with exponential backoff)
- ✅ Timezone clarity (UTC with countdown timer and FAQ)
- ✅ Basic accessibility (keyboard nav, ARIA labels, color+text indicators)
- ✅ Resource monitoring setup (weekly check spreadsheet)
- ✅ User-friendly rate limit messages (not technical errors)
- ✅ Database backup before production migration
- ✅ Testing framework setup (Vitest + Playwright)
  
**Nice to Have** (can ship without):
- ⚠️ Image card generation for sharing
- ⚠️ PDF export of analyses
- ⚠️ Advanced search/filters
- ⚠️ Custom domain

### 9.2 Quality Benchmarks

**Performance**:
- Initial page load: <2 seconds
- Analysis completion: <30 seconds (5 images)
- Image upload: <5 seconds (per image)

**Reliability**:
- 99% uptime
- <1% analysis failure rate (excluding global rate limit)
- <5% upload failure rate

**User Experience**:
- Mobile-friendly (Google Mobile-Friendly Test passing)
- Basic accessibility for MVP (keyboard nav, screen reader friendly, no color-only indicators)
- Full WCAG 2.1 AA compliance deferred to V1.1
- Clear error messages (no technical jargon)

---

## 10. Risks & Mitigations

### 10.1 Technical Risks

**Risk**: Cloudinary storage fills up (25 GB limit)
**Impact**: New uploads fail, app partially broken for all users
**Mitigation**: 
- Weekly monitoring, alert at 20 GB
- Aggressive auto-deletion (7 days)
- File compression (target 5 MB)
- Upgrade plan ready ($99/month for 75 GB)

**Risk**: Gemini API daily limit hit (1,500 requests/day)
**Impact**: All analyses fail for remainder of day
**Mitigation**:
- Global rate limiting at 1,400 (100-request buffer)
- Atomic operations to prevent race conditions (Vercel KV or Postgres)
- User-friendly "high traffic" message (503, not 429)
- Doesn't count against user's daily limit
- Monitor daily usage via global counter, plan for paid tier if needed

**Risk**: Vercel Postgres fills up (256 MB)
**Impact**: New signups and analyses fail
**Mitigation**:
- Text-only storage (no images in DB)
- Weekly monitoring, alert at 200 MB
- Soft delete cleanup
- Upgrade to Vercel Pro ($20/month) if needed

**Risk**: Poor analysis quality
**Mitigation**: Extensive prompt engineering, category-specific prompts, user feedback loop

### 10.2 Product Risks

**Risk**: Users don't understand how to use it
**Mitigation**: Pre-loaded example, clear category buttons, onboarding flow

**Risk**: Privacy concerns about uploading sensitive content
**Mitigation**: Clear privacy policy, user data controls, auto-deletion messaging

**Risk**: Low engagement after signup
**Mitigation**: Immediate value (pre-loaded example), easy first analysis, email reminders (V1.1)

**Risk**: Viral potential but can't handle scale
**Mitigation**: Start with rate limits, monitor usage, have upgrade plan ready (Vercel scales automatically)

---

## 11. Open Questions & Assumptions

### 11.1 Assumptions
- Users are comfortable uploading screenshots to a third-party service
- Mobile users will primarily use camera roll uploads (not real-time camera)
- 2 free analyses/day is enough to hook users but not so much they don't upgrade
- Blunt/direct tone resonates with target audience (vs. professional/friendly)
- Most users will analyze dating content first (drives category priority)

### 11.2 Questions to Validate Post-Launch
- What's the actual conversion rate from signup → first analysis?
- Which category is most popular?
- Do users share results publicly or keep private?
- What's the typical number of images per analysis?
- How many users hit the free tier limit?
- What's the retention rate (D7, D30)?

---

## 12. Appendix

### 12.1 Competitor Analysis
*Note: No direct competitors found with identical feature set*

**Similar Products**:
- **Character.AI**: General chatbot, not red flag-focused
- **ChatGPT**: Generic analysis, no category-specific prompts
- **Therapist/Coach Apps**: Human-based, expensive, not instant

**Our Differentiation**:
- Category-specific analysis (dating, jobs, housing, marketplace)
- Multi-file upload for conversation threads
- Structured red flag scoring (0-10)
- Mobile-first, instant results
- Free tier (2/day)

### 12.2 Future Vision (Beyond MVP)

**V2.0 Features**:
- Real-time conversation monitoring (paste messages as they come in)
- Browser extension (analyze profiles without leaving the site)
- Video analysis (dating profile videos, pitch videos)
- Team/relationship counselor mode (both parties analyze same conversation)
- API for third-party integrations
- Custom prompts (users can tune the AI's personality)

**Monetization Beyond Pro Tier**:
- B2B: HR departments analyze job postings before publishing
- B2B: Property management companies check tenant communications
- Affiliate: Refer users to therapy/coaching services
- White-label: License technology to dating apps

---

## 13. Version History

**Version 1.1** (November 2025 - Revised)
- Removed email verification requirement (OAuth handles this)
- Removed Resend email service references (not needed for MVP)
- Updated capacity estimates with 30% safety buffers
- Added atomic operations requirement for global rate limiting
- Clarified accessibility as "basic" for MVP (full WCAG 2.1 AA in V1.1)
- Added FILE_RETENTION_DAYS configurability
- Added Vercel KV as optional rate limiting store
- Added testing framework requirements (Vitest + Playwright)
- Updated onboarding flow (removed email verification step)
- Removed "email verification rate" from metrics
- Added database backup to must-haves

**Version 1.0** (November 2025)
- Initial PRD

---

**Document Version**: 1.2
**Last Updated**: November 2025 (Updated to Bleeding-Edge Versions)
**Owner**: Product Team
**Status**: Approved for Development

**Version 1.2 Changes:**
- Updated tech stack to Next.js 15 canary, React 19 RC, AI SDK v5
- Updated Gemini model to 2.5 Flash
- Updated NextAuth.js to v5.0.0-beta.25
