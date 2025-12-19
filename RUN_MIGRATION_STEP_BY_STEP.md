# How to Run the Database Migration - Step by Step

## What This Migration Does
This adds new fields to your database for the User Profile page:
- Profile fields (phone, website, pronouns, timezone, avatar)
- Teams functionality
- Activity tracking
- Notification preferences

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Click on your project (the one with your database)

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"** (it has a `</>` icon)
2. Click **"New query"** button (top right)

### Step 3: Copy and Paste the SQL
1. Copy ALL the SQL code below (from `-- AlterTable` to the end)
2. Paste it into the SQL Editor text box

### Step 4: Run the Migration
1. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait a few seconds - you should see "Success. No rows returned" or similar

### Step 5: Verify It Worked
1. In the left sidebar, click **"Table Editor"**
2. Click on the **"User"** table
3. You should see new columns: `phone`, `website`, `pronouns`, `timezone`, `avatar`

## The SQL Code to Copy:

```sql
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
```

## Troubleshooting

**If you get an error:**
- **"column already exists"** - That's okay! It means some parts already ran. You can skip those lines.
- **"type already exists"** - That's okay too! Skip that line.
- **"table already exists"** - Skip that CREATE TABLE line.

**If you're not sure:**
- Take a screenshot of the error and share it with me
- I'll help you fix it!

## After Running

Once the migration completes successfully:
1. Your User Profile page will work!
2. You can access it at `/profile` (click your name in the header → "User Profile")
3. All the new features will be available

That's it! Just copy, paste, and click Run. 🚀
