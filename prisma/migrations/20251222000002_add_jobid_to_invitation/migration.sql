-- Add jobId column to Invitation table
ALTER TABLE "Invitation" ADD COLUMN "jobId" TEXT;

-- Add foreign key constraint
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for jobId for better query performance
CREATE INDEX IF NOT EXISTS "Invitation_jobId_idx" ON "Invitation"("jobId");
