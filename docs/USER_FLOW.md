# Red Flag Detector - Complete User Flow Documentation

## Overview

This document defines the exact sequence of user interactions and system behaviors for the Red Flag Detector application.

---

## Core Principle: Category-First Approach

**Key Decision**: Chat record is created in the database **when the user selects a category**, not when they send the first message.

**Why**:
- Enables file uploads before sending messages
- Provides chatId for database foreign key constraints
- Matches the PRD user flow: Category → Upload → Analyze
- Eliminates chicken-and-egg problem between chat creation and file uploads

---

## Flow 1: New User - First Analysis (Primary Flow)

### Step 1: User Lands on Chat Page

**Route**: `/chat`

**UI State**:
- Empty chat interface
- Greeting message: "Hello there! How can I help you today?"
- **Category Selector** (prominently displayed):
  - 💕 Dating Profiles
  - 💬 Conversations
  - 💼 Job Postings
  - 🏠 Housing/Roommates
  - 💰 Marketplace Listings
- Text input area: **DISABLED** (until category selected)
- File upload button: **DISABLED** (until category selected)
- Info text: "Select a category to begin"

**Client State**:
```typescript
{
  chatId: "uuid-generated-on-page-load",  // e.g., "abc-123-def"
  category: null,                          // Not selected yet
  chatCreatedInDB: false,                  // Not saved yet
  messages: [],
  files: []
}
```

**Database State**:
- No chat record exists yet
- chatId only exists in browser memory

---

### Step 2: User Selects Category

**User Action**: Clicks "💕 Dating Profiles"

**Client Behavior**:
1. Show loading state on category button
2. Make API call: `POST /api/chat/initialize`
   ```json
   {
     "chatId": "abc-123-def",
     "category": "dating"
   }
   ```
3. Wait for success response
4. Update UI state

**Server Behavior** (`POST /api/chat/initialize`):
1. Verify user authentication
2. Check if chat already exists (idempotent)
3. If not exists:
   - Create chat record in database:
     ```sql
     INSERT INTO "Chat" (
       id, userId, category, title, visibility, createdAt
     ) VALUES (
       'abc-123-def',
       'user-id',
       'dating',
       'New Conversation',
       'private',
       NOW()
     );
     ```
4. Return success:
   ```json
   {
     "success": true,
     "chatId": "abc-123-def",
     "category": "dating",
     "chatCreated": true
   }
   ```

**UI Updates After Success**:
- Category selector shows "💕 Dating Profiles" as selected
- "Clear category" or "Change category" option appears
- Text input: **ENABLED**
- File upload button: **ENABLED**
- Placeholder text: "Describe what you want to analyze, or upload files..."

**Client State**:
```typescript
{
  chatId: "abc-123-def",
  category: "dating",
  chatCreatedInDB: true,  // ✅ Chat exists in DB now
  messages: [],
  files: []
}
```

**Database State**:
- ✅ Chat record exists with:
  - `id`: "abc-123-def"
  - `category`: "dating"
  - `userId`: Current user
  - `title`: "New Conversation"

---

### Step 3A: User Uploads Files First (Recommended Flow)

**User Action**:
- Clicks file upload button, or
- Drags and drops files

**Client Behavior**:
1. Validate files (type, size, count ≤ 5)
2. Show compression progress if files > 10MB
3. For each file:
   - Compress if needed (target: 5MB, 2560px, 85% quality)
   - Create FormData with file
   - Upload to backend

**Server Behavior** (Handled in `/api/chat` route, not separate endpoint):
- Files will be uploaded when user sends first message or clicks "Analyze"
- Files temporarily stored in browser until analysis is triggered

**UI Updates**:
- File staging area appears
- Each file shows:
  - Thumbnail/preview
  - Filename
  - File size
  - Remove button
- File counter: "3 / 5 files"
- "Add more files" button (if < 5 files)
- **"Analyze" button appears** (primary CTA)
- Text input still available (for adding context)

**Client State**:
```typescript
{
  chatId: "abc-123-def",
  category: "dating",
  chatCreatedInDB: true,
  messages: [],
  files: [
    { file: File, preview: "blob:...", compressed: false },
    { file: File, preview: "blob:...", compressed: true },
    { file: File, preview: "blob:...", compressed: false }
  ]
}
```

---

### Step 3B: User Clicks "Analyze"

**User Action**:
- Reviews staged files
- Optionally adds text context: "This is from Tinder, we've been talking for 2 weeks"
- Clicks **"Analyze"** button

**Client Behavior**:
1. Show analysis loading state:
   - Loading spinner
   - "Analyzing your files..." message
   - Progress indicator
   - "This may take 10-30 seconds"
2. Prepare request payload:
   ```typescript
   {
     id: "abc-123-def",
     category: "dating",
     message: "Analyze these dating profile screenshots",
     files: [File1, File2, File3],  // Actual File objects
     analysisMode: true  // Indicates this is full red flag analysis
   }
   ```
3. Send to `/api/chat` (POST with multipart/form-data)
4. Stream response

**Server Behavior** (`POST /api/chat`):
1. **Verify chat exists** (should exist from step 2)
2. **Rate Limit Checks**:
   - User daily limit: 2 analyses/day
   - User monthly limit: 10 analyses/month
   - Global daily limit: 1,400 analyses/day
   - Return 429 if exceeded
3. **Upload files to Cloudinary**:
   ```typescript
   for (const file of files) {
     const buffer = await file.arrayBuffer();
     const result = await uploadToCloudinary(buffer, {
       folder: `red-flag-detector/${userId}`,
       resourceType: file.type === 'application/pdf' ? 'raw' : 'image'
     });
     cloudinaryUrls.push(result.secureUrl);
   }
   ```
4. **Save files to database**:
   ```sql
   INSERT INTO "UploadedFiles" (
     id, chatId, cloudinaryUrl, cloudinaryPublicId,
     fileType, fileSize, createdAt, autoDeleteAt
   ) VALUES (...);
   ```
5. **Get category-specific prompt**:
   ```typescript
   const systemPrompt = getRedFlagPrompt(category);  // "dating" → dating prompt
   ```
6. **Call Gemini API**:
   ```typescript
   const { text } = await generateText({
     model: myProvider.languageModel("chat-model"),
     system: systemPrompt,
     messages: [{
       role: "user",
       content: `Analyze these dating profiles: ${cloudinaryUrls.join(', ')}\n\nContext: ${userMessage}`
     }],
     temperature: AI_CONFIG.temperature.analysis
   });
   ```
7. **Parse analysis result**:
   ```typescript
   const analysis = parseAnalysisJSON(text);  // Extract red flag data
   ```
8. **Save to database**:
   ```sql
   -- Save user message
   INSERT INTO "Message_v2" (id, chatId, role, content, createdAt)
   VALUES ('msg-1', 'abc-123-def', 'user', 'Analyze these...', NOW());

   -- Save AI analysis with red flag data
   INSERT INTO "Message_v2" (id, chatId, role, content, redFlagData, createdAt)
   VALUES ('msg-2', 'abc-123-def', 'assistant', 'Analysis result...',
           '{"redFlagScore": 7.5, "criticalFlags": [...], ...}', NOW());

   -- Update chat with red flag score
   UPDATE "Chat"
   SET redFlagScore = 7.5,
       title = 'Dating Profile Analysis',
       updatedAt = NOW()
   WHERE id = 'abc-123-def';
   ```
9. **Increment usage**:
   ```sql
   INSERT INTO "UsageLogs" (userId, analysisCount, date)
   VALUES ('user-id', 1, CURRENT_DATE)
   ON CONFLICT (userId, date)
   DO UPDATE SET analysisCount = UsageLogs.analysisCount + 1;
   ```
10. **Stream response** to client

**UI Updates**:
- Loading state replaced with **Red Flag Score Card**:
  - 📊 Score: 7.5/10
  - 🔴 Critical Flags (collapsible)
  - 🟡 Warnings (collapsible)
  - 🟢 Notices (collapsible)
  - 💡 Advice section
- Files remain visible in staging area
- Input enabled for follow-up questions
- Share button appears

---

### Step 4: User Asks Follow-Up Question

**User Action**: Types "What about the bio section specifically?"

**Client Behavior**:
- Send message to `/api/chat`
- Stream response

**Server Behavior**:
1. Load conversation history from database
2. Include previous analysis in context
3. Send to Gemini with:
   - Category-specific prompt
   - Full conversation history
   - New question
4. Return conversational response (not new analysis)

**UI Updates**:
- User message appears
- Bot response streams in
- Conversation continues with full context

---

## Flow 2: User Uploads Files Without Category Selection (Error Prevention)

**User Action**: Tries to upload files before selecting category

**UI Behavior**:
- File upload button is **DISABLED**
- Tooltip on hover: "Please select a category first"
- If user tries drag-and-drop:
  - Show error toast: "Select a category before uploading files"
  - Highlight category selector

**Reason**: Cannot upload files without chatId existing in database

---

## Flow 3: User Types Message First (Alternative Flow)

**User Action** (Step 3 alternative):
- Instead of uploading files, types: "I matched with someone on Tinder..."
- Clicks send

**Client Behavior**:
- Send message to `/api/chat` with `analysisMode: false`

**Server Behavior**:
1. Chat already exists (from category selection)
2. Save user message to database
3. Send to Gemini with category context ("dating")
4. Return conversational response (not full analysis)
5. User can upload files later and click "Analyze"

**UI Updates**:
- Normal chat conversation
- User can still upload files
- "Analyze" button appears when files are uploaded

---

## Flow 4: Returning User Opens Existing Chat

**Route**: `/chat/abc-123-def`

**Server Behavior** (Page Load):
1. Load chat record from database:
   ```sql
   SELECT * FROM "Chat" WHERE id = 'abc-123-def' AND userId = 'user-id';
   ```
2. Load messages:
   ```sql
   SELECT * FROM "Message_v2"
   WHERE chatId = 'abc-123-def'
   ORDER BY createdAt ASC;
   ```
3. Send to client

**UI State**:
- Category selector shows selected category (read-only or changeable)
- Conversation history displayed
- Previous analysis results visible
- Input enabled for follow-up questions
- File upload enabled (can upload more for new analysis)

---

## Flow 5: Category Change Mid-Conversation

**Recommended Approach**: **Lock category after first analysis**

**Reasoning**:
- Each category has specific prompts
- Changing mid-conversation confuses context
- Better UX: Start new conversation for different category

**UI Behavior**:
- Category selector shows selected category
- "Change category" button disabled after first analysis
- Tooltip: "Start a new conversation to analyze a different category"
- "New Conversation" button available

**Alternative Approach** (if allowing changes):
- User clicks "Change Category"
- Confirmation dialog: "This will start a new analysis. Continue?"
- If yes:
  - Update `chat.category` in database
  - Clear previous analysis from UI
  - All future messages use new category

---

## Error Handling

### Error 1: Rate Limit Exceeded
**Scenario**: User already used 2/2 daily analyses

**Response**:
```json
{
  "error": "Daily limit reached",
  "limit": 2,
  "used": 2,
  "resetAt": "2025-01-19T00:00:00Z"
}
```

**UI**: Show error message with reset time

### Error 2: File Upload Too Large
**Client**: Prevent upload, show error: "File exceeds 100 MB limit"

### Error 3: Cloudinary Upload Fails
**Server**: Retry 3 times, then return error
**UI**: Show error message, allow retry

### Error 4: Gemini API Error
**Server**: Retry with exponential backoff (1s, 3s, 5s)
**UI**: Show loading state, then error if all retries fail

---

## Database Schema Flow Summary

```
1. Page load
   → UUID generated client-side: "abc-123-def"
   → No DB write yet

2. User selects category
   → POST /api/chat/initialize
   → INSERT INTO "Chat" (id, userId, category, title, ...)
   → Chat record created ✅

3. User uploads files & clicks "Analyze"
   → Files uploaded to Cloudinary
   → INSERT INTO "UploadedFiles" (chatId, cloudinaryUrl, ...)
   → Files linked to chat ✅

4. Analysis runs
   → INSERT INTO "Message_v2" (chatId, role, content, redFlagData, ...)
   → Analysis stored ✅
   → UPDATE "Chat" SET redFlagScore = 7.5
   → Score updated ✅

5. Follow-up messages
   → INSERT INTO "Message_v2" (chatId, role, content, ...)
   → Conversation continues ✅
```

---

## Key Implementation Changes from Phase 3

### 1. Remove Standalone Upload Endpoint
**Before**: `/api/upload` (separate endpoint)
**After**: File upload handled in `/api/chat` route

### 2. Add Chat Initialization Endpoint
**New**: `POST /api/chat/initialize`
- Creates chat record when category selected
- Returns chatId for client state

### 3. Update Chat API Route
**Changes to `/api/chat`**:
- Accept files in multipart/form-data
- Upload files to Cloudinary inline
- Save file records with chatId
- Run analysis with Cloudinary URLs

### 4. Frontend State Management
- Track `chatCreatedInDB` boolean
- Disable file upload until category selected
- Show "Analyze" button when files staged

---

## Summary

✅ **Category selection creates chat in DB**
✅ **chatId available immediately for file uploads**
✅ **Files uploaded as part of analysis (not separate)**
✅ **Clear user flow with proper state management**
✅ **All edge cases handled**
✅ **Aligns perfectly with PRD**
