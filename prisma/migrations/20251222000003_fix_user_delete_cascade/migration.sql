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
