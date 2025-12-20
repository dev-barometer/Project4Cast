# Invitation jobId Migration Guide

## Issue
The `Invitation` table is missing the `jobId` column, which is needed for job-specific invitations.

## Step 1: Run the SQL Migration in Supabase

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run the following SQL:

```sql
-- Add jobId column to Invitation table
ALTER TABLE "Invitation" ADD COLUMN "jobId" TEXT;

-- Add foreign key constraint
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for jobId for better query performance
CREATE INDEX IF NOT EXISTS "Invitation_jobId_idx" ON "Invitation"("jobId");
```

4. Click "Run" to execute the migration

## Step 2: Generate Prisma Client

After running the SQL migration, generate the Prisma client:

```bash
npx prisma generate
```

That's it! The `jobId` column is now available in your `Invitation` table, and job-specific invitations will work correctly.
