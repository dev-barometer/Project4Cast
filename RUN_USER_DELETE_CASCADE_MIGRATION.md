# User Delete Cascade Migration Guide

## Issue
When trying to delete a user, foreign key constraint violations occur because `PasswordResetToken` and `EmailVerificationToken` records still reference the user, and the database constraints don't have CASCADE enabled.

## Step 1: Run the SQL Migration in Supabase

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run the following SQL:

```sql
-- Fix foreign key constraints to use CASCADE for user deletion
-- This ensures related records are automatically deleted when a user is deleted

-- Drop existing constraints
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT IF EXISTS "PasswordResetToken_userId_fkey";
ALTER TABLE "EmailVerificationToken" DROP CONSTRAINT IF EXISTS "EmailVerificationToken_userId_fkey";

-- Recreate with CASCADE
ALTER TABLE "PasswordResetToken" 
  ADD CONSTRAINT "PasswordResetToken_userId_fkey" 
  FOREIGN KEY ("userId") 
  REFERENCES "User"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE "EmailVerificationToken" 
  ADD CONSTRAINT "EmailVerificationToken_userId_fkey" 
  FOREIGN KEY ("userId") 
  REFERENCES "User"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;
```

4. Click "Run" to execute the migration

## What This Does

This migration updates the foreign key constraints so that when a user is deleted:
- All `PasswordResetToken` records for that user are automatically deleted
- All `EmailVerificationToken` records for that user are automatically deleted

This matches the Prisma schema's `onDelete: Cascade` setting and ensures user deletion works smoothly.

## Note

The code has also been updated to explicitly delete these records before deleting the user as a safety measure, but with CASCADE enabled, this becomes automatic at the database level.
