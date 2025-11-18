-- AlterTable
-- Make jobId optional in Task table
ALTER TABLE "Task" ALTER COLUMN "jobId" DROP NOT NULL;

