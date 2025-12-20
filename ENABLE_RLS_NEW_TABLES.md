# Enable RLS on New Tables

This migration enables Row Level Security (RLS) on the tables that were created after the initial RLS migration. These tables are currently showing as "UNRESTRICTED" in Supabase.

## Tables to Enable RLS On

- `Team` - Team/organization information
- `UserTeam` - User-team membership relationships
- `UserActivity` - User activity logs
- `UserNotificationPreferences` - User notification preferences

## Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration SQL**
   - Copy and paste the following SQL into the SQL Editor:

```sql
-- Enable Row Level Security (RLS) on tables created after initial RLS migration
-- These tables were added in the user profile fields migration

-- Enable RLS on Team table
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on UserTeam junction table
ALTER TABLE "UserTeam" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on UserActivity table
ALTER TABLE "UserActivity" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on UserNotificationPreferences table
ALTER TABLE "UserNotificationPreferences" ENABLE ROW LEVEL SECURITY;
```

3. **Execute the Query**
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)
   - You should see: "Success. No rows returned" - this is correct!

4. **Verify the Migration**
   - Go to Table Editor
   - Check each table: `Team`, `UserTeam`, `UserActivity`, `UserNotificationPreferences`
   - They should no longer show "UNRESTRICTED" - instead they'll show RLS as enabled

## Important Notes

### Your Current Setup

Your application uses **Prisma** with a **service role connection** (the `postgres` user). This means:

✅ **RLS will be enabled** (satisfies Supabase security requirements)  
✅ **Your app will continue to work** (service role bypasses RLS)  
✅ **No additional policies needed** (for now)

### Why Enable RLS?

Even though your app bypasses RLS with the service role:
- ✅ Satisfies Supabase security linter requirements
- ✅ Best practice for database security
- ✅ Protects against accidental direct database access
- ✅ Consistent with other tables in your database

### If You Switch to Anon Role

If you ever want to use Supabase's anon role (for direct PostgREST access), you'll need to create RLS policies. Here's an example:

```sql
-- Example: Allow users to read their own activity logs
CREATE POLICY "Users can read own activity" ON "UserActivity"
  FOR SELECT USING (auth.uid()::text = "userId");

-- Example: Allow users to read their own notification preferences
CREATE POLICY "Users can manage own preferences" ON "UserNotificationPreferences"
  FOR ALL USING (auth.uid()::text = "userId");
```

But for now, with Prisma service role, you don't need these policies.

## After Migration

After running this migration:
- The "UNRESTRICTED" warnings in Supabase will disappear
- Your application will continue to work exactly as before
- All tables will have consistent RLS settings
