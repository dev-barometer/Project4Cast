-- AlterEnum: Add OWNER to UserRole enum
ALTER TYPE "UserRole" ADD VALUE 'OWNER';

-- Set barclay@barometergroup.com as OWNER (if user exists)
UPDATE "User" 
SET "role" = 'OWNER' 
WHERE "email" = 'barclay@barometergroup.com' 
AND "role" != 'OWNER';
