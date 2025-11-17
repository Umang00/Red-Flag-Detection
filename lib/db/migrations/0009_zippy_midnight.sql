-- Add verificationTokenExpiry column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'verificationTokenExpiry'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "verificationTokenExpiry" timestamp;
    END IF;
END $$;