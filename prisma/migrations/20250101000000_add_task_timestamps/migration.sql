-- AlterTable
ALTER TABLE "Task" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Update existing tasks to have createdAt set to now (since we don't have historical data)
UPDATE "Task" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;


