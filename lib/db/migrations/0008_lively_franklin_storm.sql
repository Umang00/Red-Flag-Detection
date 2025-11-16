CREATE TABLE IF NOT EXISTS "UploadedFiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"cloudinaryUrl" text NOT NULL,
	"cloudinaryPublicId" text NOT NULL,
	"fileType" text NOT NULL,
	"fileSize" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"autoDeleteAt" timestamp NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UsageLogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"analysisCount" integer DEFAULT 1 NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "category" varchar;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "redFlagScore" real;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "Message_v2" ADD COLUMN "redFlagData" jsonb;--> statement-breakpoint
ALTER TABLE "Message_v2" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "emailVerified" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "verificationToken" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UploadedFiles" ADD CONSTRAINT "UploadedFiles_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UsageLogs" ADD CONSTRAINT "UsageLogs_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_uploaded_files_auto_delete" ON "UploadedFiles" USING btree ("autoDeleteAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_usage_logs_user_date" ON "UsageLogs" USING btree ("userId","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conversations_user_id" ON "Chat" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_conversations_created_at" ON "Chat" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id" ON "Message_v2" USING btree ("chatId");