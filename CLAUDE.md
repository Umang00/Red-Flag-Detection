# Red Flag Detector - Claude Code Development Rules

## Project Overview

**Red Flag Detector** is a Next.js 15 application that helps users identify warning signs in various contexts (dating, jobs, housing, marketplace, conversations) using AI analysis.

### Technology Stack

- **Framework**: Next.js 15.3.0-canary.31 (App Router with Turbopack)
- **Database**: Supabase PostgreSQL (via Vercel Integration)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5 (Email/Password + GitHub OAuth)
- **Storage**: Cloudinary (image/PDF storage)
- **AI**: Google Gemini 2.5 Flash API (via AI SDK v5)
- **Email**: Resend (verification emails)
- **Linter**: Ultracite (Biome-based)
- **Package Manager**: pnpm

---

## Critical Development Rules

### 1. Testing & Validation After Every TODO Completion

**MANDATORY**: After completing any TODO item, you MUST:

1. **Run Development Server**:
   ```bash
   pnpm dev
   ```
   - Verify the feature works in the browser
   - Check for runtime errors in console
   - Test all user flows related to the feature

2. **Run Build**:
   ```bash
   pnpm build
   ```
   - Ensure no TypeScript errors
   - Ensure no build-time errors
   - Fix any warnings that could cause production issues

3. **Run Linter**:
   ```bash
   pnpm lint
   ```
   - Fix all linting errors
   - Follow Ultracite/Biome rules strictly

4. **Test Related Features**:
   - If adding database changes: Test queries work correctly
   - If adding API routes: Test with actual requests
   - If adding auth: Test login/logout flows
   - If adding UI: Test on mobile and desktop viewports

5. **Check for Breaking Changes**:
   - Verify existing features still work
   - Check for TypeScript type errors
   - Ensure database migrations are correct

**NEVER mark a TODO as complete without running dev and build successfully.**

---

### 2. Use Latest Information - No Deprecated Code

**MANDATORY**: Always use the latest, non-deprecated approaches:

1. **Check Documentation First**:
   - Use MCP tools (Context7, GitHub, etc.) to get latest library docs
   - Use web search for latest best practices
   - Check official documentation for breaking changes

2. **Verify Package Versions**:
   - Check `package.json` for current versions
   - Use latest stable versions (not beta unless required)
   - Verify compatibility between packages

3. **Avoid Deprecated Patterns**:
   - Don't use deprecated Next.js APIs
   - Don't use deprecated React patterns
   - Don't use deprecated Drizzle ORM methods
   - Don't use deprecated NextAuth.js patterns

4. **When in Doubt**:
   - Search for latest examples in official docs
   - Use MCP tools to query library documentation
   - Ask for clarification rather than guessing

**Example**: If adding NextAuth.js provider, check latest NextAuth.js v5 docs via MCP, not old v4 examples.

---

### 3. Database Schema Consistency - CRITICAL

**MANDATORY**: Database table and column names MUST match exactly between:
- Drizzle schema definition (`lib/db/schema.ts`)
- Database queries (`lib/db/queries.ts`)
- Actual database tables (Supabase)

**Naming Conventions**:
- **Table Names**: PascalCase (e.g., `"User"`, `"Chat"`, `"Message_v2"`)
- **Column Names**: camelCase (e.g., `createdAt`, `userId`, `chatId`)
- **Schema Exports**: camelCase (e.g., `user`, `chat`, `message`)

**Before Making Database Changes**:

1. **Check Current Schema**:
   - Read `lib/db/schema.ts` to see exact table/column names
   - Verify naming matches conventions above

2. **Verify in Supabase** (if needed):
   - Use Supabase MCP to check actual database schema
   - Compare with Drizzle schema definition
   - Ensure they match exactly

3. **Update All References**:
   - Update schema definition
   - Update all queries using that table/column
   - Update TypeScript types
   - Generate and run migrations

4. **Test Database Operations**:
   - Test INSERT operations
   - Test SELECT queries
   - Test UPDATE operations
   - Test DELETE operations

**Example**:
```typescript
// ✅ CORRECT - Table name matches
export const user = pgTable("User", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 64 }),
  createdAt: timestamp("createdAt"), // camelCase column
});

// ❌ WRONG - Table name mismatch
export const user = pgTable("users", { // Should be "User"
  created_at: timestamp("created_at"), // Should be "createdAt"
});
```

**NEVER assume table/column names. Always verify in schema.ts and Supabase.**

---

### 4. Code Quality Standards

1. **TypeScript**:
   - Use strict typing (no `any` unless absolutely necessary)
   - Define proper interfaces/types for all data structures
   - Use type inference where appropriate

2. **Error Handling**:
   - Always handle errors gracefully
   - Provide user-friendly error messages
   - Log errors for debugging (server-side only)

3. **Code Organization**:
   - Follow existing project structure
   - Keep components in `components/`
   - Keep API routes in `app/*/api/`
   - Keep database logic in `lib/db/`

4. **Accessibility**:
   - Follow Ultracite accessibility rules
   - Use semantic HTML
   - Include proper ARIA attributes
   - Test with keyboard navigation

---

### 5. Authentication & Security

1. **Always Verify Authentication**:
   - Check `await auth()` in API routes
   - Verify user session before database operations
   - Never trust client-side authentication checks alone

2. **Password Handling**:
   - Always hash passwords with bcryptjs (10 rounds)
   - Never log passwords
   - Never return passwords in API responses

3. **Email Verification**:
   - Check `emailVerified` status before allowing login
   - Send verification emails via Resend
   - Handle verification token expiration

4. **Rate Limiting**:
   - Enforce rate limits in API routes
   - Check daily/monthly limits
   - Return proper 429 responses

---

### 6. Database Operations

1. **Always Use Drizzle ORM**:
   - Never write raw SQL unless absolutely necessary
   - Use type-safe queries
   - Use transactions for multi-step operations

2. **Migrations**:
   - Generate migrations: `pnpm db:generate`
   - Review migration files before running
   - Run migrations: `pnpm db:push` (dev) or `pnpm db:migrate` (prod)

3. **Query Patterns**:
   - Use `eq()`, `and()`, `or()` from drizzle-orm
   - Always filter by `userId` for user-specific data
   - Use proper joins for related data

4. **Error Handling**:
   - Handle database connection errors
   - Handle constraint violations
   - Handle query errors gracefully

---

### 7. API Route Standards

1. **Request Validation**:
   - Always validate request body with Zod schemas
   - Return 400 for invalid requests
   - Return proper error messages

2. **Response Format**:
   - Use consistent response format
   - Return proper HTTP status codes
   - Include error details in development

3. **Streaming Responses**:
   - Use AI SDK streaming for chat responses
   - Handle stream errors properly
   - Close streams on errors

---

### 8. File Upload & Cloudinary

1. **File Validation**:
   - Validate file types (JPG, PNG, PDF only)
   - Validate file sizes (<100 MB each)
   - Compress images >10 MB before upload

2. **Cloudinary Integration**:
   - Upload to Cloudinary, not database
   - Store Cloudinary URLs in database
   - Set auto-delete date (7 days)

3. **Error Handling**:
   - Handle upload failures
   - Handle Cloudinary API errors
   - Clean up on errors

---

### 9. Environment Variables

1. **Always Check**:
   - Verify required env vars exist
   - Use proper fallbacks where appropriate
   - Never commit `.env.local` to git

2. **Required Variables**:
   - `POSTGRES_URL` (Supabase connection)
   - `NEXTAUTH_URL` (app URL)
   - `NEXTAUTH_SECRET` (auth secret)
   - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
   - `RESEND_API_KEY` (email service)
   - `CLOUDINARY_*` (storage)
   - `GOOGLE_AI_API_KEY` (AI)

---

### 10. Testing Checklist (After Every Feature)

Before marking a TODO complete, verify:

- [ ] Code compiles (`pnpm build`)
- [ ] No TypeScript errors
- [ ] No linting errors (`pnpm lint`)
- [ ] Dev server runs (`pnpm dev`)
- [ ] Feature works in browser
- [ ] No console errors
- [ ] Database operations work
- [ ] Authentication works (if applicable)
- [ ] Error cases handled
- [ ] Mobile responsive (if UI change)
- [ ] Existing features still work

---

### 11. Documentation Updates

When adding new features:

1. **Update Code Comments**:
   - Add JSDoc comments for complex functions
   - Explain non-obvious logic
   - Document API endpoints

2. **Update Architecture Docs** (if major changes):
   - Update `docs/ARCHITECTURE.md` if architecture changes
   - Update `docs/PRD.md` if requirements change
   - Keep `docs/TODO.md` up to date

---

### 12. Git & Version Control

1. **Commit Messages**:
   - Use clear, descriptive commit messages
   - Reference TODO items when applicable
   - Group related changes in single commit

2. **Before Committing**:
   - Run `pnpm build` to ensure it compiles
   - Run `pnpm lint` to fix linting issues
   - Test the feature works

---

## Quick Reference

### Database Naming
- Tables: `"User"`, `"Chat"`, `"Message_v2"` (PascalCase)
- Columns: `createdAt`, `userId`, `chatId` (camelCase)
- Exports: `user`, `chat`, `message` (camelCase)

### Testing Commands
```bash
pnpm dev      # Start dev server
pnpm build    # Build for production
pnpm lint     # Check code quality
```

### Database Commands
```bash
pnpm db:generate  # Generate migrations
pnpm db:push      # Push schema (dev)
pnpm db:migrate   # Run migrations (prod)
pnpm db:studio    # Open Drizzle Studio
```

### Always Verify
- ✅ Schema matches database (use Supabase MCP if needed)
- ✅ No deprecated code (check latest docs via MCP/web)
- ✅ Tests pass (dev + build)
- ✅ No TypeScript errors
- ✅ No linting errors

---

## Project Structure

```
app/
├── (auth)/          # Authentication routes
│   ├── login/       # Login page
│   └── api/auth/    # NextAuth.js routes
├── (chat)/          # Main chat interface
│   ├── api/         # API routes
│   └── chat/[id]/   # Individual conversations
components/          # React components
lib/
├── db/              # Database schema and queries
│   ├── schema.ts    # Drizzle schema definitions
│   └── queries.ts   # Database query functions
├── ai/              # AI integration
└── utils.ts         # Utility functions
docs/                # Project documentation
```

---

## Key Files to Reference

- **Database Schema**: `lib/db/schema.ts`
- **Database Queries**: `lib/db/queries.ts`
- **Authentication**: `app/(auth)/auth.ts`
- **API Routes**: `app/(chat)/api/`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Requirements**: `docs/PRD.md`
- **TODO List**: `docs/TODO.md`

---

## Remember

**When in doubt:**
1. Check the schema file first
2. Use MCP tools for latest documentation
3. Test in dev server
4. Run build to catch errors
5. Verify database names match exactly

**Never assume. Always verify.**

