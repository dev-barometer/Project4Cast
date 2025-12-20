# Admin Management Fields Migration

This migration adds fields needed for admin management functionality:
- `isPaused` field to `User` table (for temporarily pausing accounts)
- `isArchived` field to `Job`, `Brand`, and `Client` tables (for archiving instead of deleting)

## Steps to Run Migration

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Migration SQL**
   - Copy and paste the contents of `prisma/migrations/20251222000000_add_admin_fields/migration.sql`
   - Click "Run" to execute

3. **Verify Migration**
   - The migration should complete successfully
   - You should see "Success. No rows returned" (this is normal for DDL commands)

## Migration SQL

```sql
-- Add admin management fields: isPaused for users, isArchived for jobs/brands/clients

-- Add isPaused field to User table
ALTER TABLE "User" ADD COLUMN "isPaused" BOOLEAN NOT NULL DEFAULT false;

-- Add isArchived field to Client table
ALTER TABLE "Client" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- Add isArchived field to Brand table
ALTER TABLE "Brand" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- Add isArchived field to Job table
ALTER TABLE "Job" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
```

## After Migration

1. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **Test the Admin Features**
   - Visit `/admin` page
   - Test user management (pause, delete, change password, assign teams)
   - Test team creation
   - Test archive/delete for jobs, brands, and clients

## Notes

- All new fields default to `false` (not paused, not archived)
- Existing records will automatically have these fields set to `false`
- The migration is safe to run on production data
