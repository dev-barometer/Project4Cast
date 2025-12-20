-- AlterEnum: Add OWNER to UserRole enum
-- NOTE: This must be run FIRST in a separate transaction
ALTER TYPE "UserRole" ADD VALUE 'OWNER';
