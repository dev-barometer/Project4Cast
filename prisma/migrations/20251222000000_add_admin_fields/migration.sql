-- Add admin management fields: isPaused for users, isArchived for jobs/brands/clients

-- Add isPaused field to User table
ALTER TABLE "User" ADD COLUMN "isPaused" BOOLEAN NOT NULL DEFAULT false;

-- Add isArchived field to Client table
ALTER TABLE "Client" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- Add isArchived field to Brand table
ALTER TABLE "Brand" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- Add isArchived field to Job table
ALTER TABLE "Job" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
