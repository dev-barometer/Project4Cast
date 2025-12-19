-- AlterTable: Add profile fields to User
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "website" TEXT;
ALTER TABLE "User" ADD COLUMN "pronouns" TEXT;
ALTER TABLE "User" ADD COLUMN "timezone" TEXT;
ALTER TABLE "User" ADD COLUMN "avatar" TEXT;

-- CreateEnum: ActivityType
CREATE TYPE "ActivityType" AS ENUM ('SIGNED_IN', 'SIGNED_OUT', 'CREATED_TASK', 'MARKED_TASK_COMPLETE', 'UPLOADED_FILE', 'INVITED_COLLABORATOR', 'ASSIGNED_JOB', 'UPDATED_PROFILE', 'CHANGED_PASSWORD', 'DELETED_ACCOUNT');

-- CreateTable: Team
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserTeam
CREATE TABLE "UserTeam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserActivity
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserNotificationPreferences
CREATE TABLE "UserNotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobAssignedInApp" BOOLEAN NOT NULL DEFAULT true,
    "jobAssignedEmail" BOOLEAN NOT NULL DEFAULT true,
    "commentMentionInApp" BOOLEAN NOT NULL DEFAULT true,
    "commentMentionEmail" BOOLEAN NOT NULL DEFAULT true,
    "jobChangeInApp" BOOLEAN NOT NULL DEFAULT true,
    "jobChangeEmail" BOOLEAN NOT NULL DEFAULT false,
    "taskCompleteInApp" BOOLEAN NOT NULL DEFAULT true,
    "taskCompleteEmail" BOOLEAN NOT NULL DEFAULT false,
    "taskOverdueInApp" BOOLEAN NOT NULL DEFAULT true,
    "taskOverdueEmail" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT,

    CONSTRAINT "UserNotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add teamId to Job
ALTER TABLE "Job" ADD COLUMN "teamId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
CREATE UNIQUE INDEX "UserTeam_userId_teamId_key" ON "UserTeam"("userId", "teamId");
CREATE INDEX "UserTeam_userId_idx" ON "UserTeam"("userId");
CREATE INDEX "UserTeam_teamId_idx" ON "UserTeam"("teamId");
CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");
CREATE INDEX "UserActivity_type_idx" ON "UserActivity"("type");
CREATE UNIQUE INDEX "UserNotificationPreferences_userId_key" ON "UserNotificationPreferences"("userId");
CREATE INDEX "UserNotificationPreferences_userId_idx" ON "UserNotificationPreferences"("userId");

-- AddForeignKey
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserNotificationPreferences" ADD CONSTRAINT "UserNotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
