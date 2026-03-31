-- Migration: Clerk to Supabase Auth
-- This migration updates the database schema to use Supabase authentication

-- Step 1: Create user_profile table (replaces the User table from Clerk)
CREATE TABLE IF NOT EXISTS "user_profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- Step 2: Update organization table
ALTER TABLE "organization" RENAME COLUMN "clerkUserId" TO "supabaseUserId";
ALTER TABLE "organization" ALTER COLUMN "supabaseUserId" TYPE UUID USING "supabaseUserId"::UUID;

-- Step 3: Update organization_user table
ALTER TABLE "organization_user" RENAME COLUMN "userId" TO "user_profile_id";

-- Step 4: Drop old User table (data should be migrated if needed)
-- DROP TABLE IF EXISTS "user" CASCADE;

-- Step 5: Create foreign key constraint from organization_user to user_profile
ALTER TABLE "organization_user"
ADD CONSTRAINT "organization_user_user_profile_id_fkey"
FOREIGN KEY ("user_profile_id")
REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Create unique index on user_profile.email
CREATE UNIQUE INDEX IF NOT EXISTS "user_profile_email_key" ON "user_profile"("email");

-- Step 7: Create index on user_profile.email
CREATE INDEX IF NOT EXISTS "user_profile_email_idx" ON "user_profile"("email");

-- Step 8: Update organization_user unique constraint
ALTER TABLE "organization_user" DROP CONSTRAINT IF EXISTS "organization_user_userId_organizationId_key";
ALTER TABLE "organization_user" ADD CONSTRAINT "organization_user_user_profile_id_organizationId_key" UNIQUE ("user_profile_id", "organizationId");

-- Step 9: Update organization_user index
DROP INDEX IF EXISTS "organization_user_organizationId_idx";
CREATE INDEX "organization_user_organizationId_idx" ON "organization_user"("organizationId");
