# Red Flag Detector - Development Rules

> **Note**: This is a summary file. For complete rules, see `CLAUDE.md` (Claude Code) or `.cursorrules` (Cursor).

## Essential Rules

### 1. Testing After Every TODO
- Run `pnpm dev` - verify feature works
- Run `pnpm build` - check for errors
- Run `pnpm lint` - fix linting issues
- Test related features
- Verify no breaking changes

### 2. Use Latest Information
- Use MCP tools (Context7, GitHub) for latest docs
- Use web search for best practices
- Never use deprecated patterns
- Verify package versions

### 3. Database Schema Consistency
- **Tables**: PascalCase (`"User"`, `"Chat"`)
- **Columns**: camelCase (`createdAt`, `userId`)
- Always verify in `lib/db/schema.ts`
- Use Supabase MCP to check actual database
- Never assume names

### 4. Code Quality
- Strict TypeScript (no `any`)
- Proper error handling
- Follow project structure
- Accessibility compliance

### 5. Authentication & Security
- Always verify `await auth()` in API routes
- Hash passwords with bcryptjs
- Check email verification status
- Enforce rate limits

## Quick Commands

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm lint         # Code quality check
pnpm db:generate  # Generate migrations
pnpm db:push      # Push schema (dev)
pnpm db:migrate   # Run migrations (prod)
```

## Project Stack

- Next.js 15.3.0-canary.31
- Supabase PostgreSQL
- Drizzle ORM
- NextAuth.js v5
- Cloudinary
- Resend
- Google Gemini 2.5 Flash

---

**Full documentation**: See `CLAUDE.md` for complete rules.

