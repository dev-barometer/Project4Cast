# Row Level Security (RLS) Setup

## What Was Done

RLS has been enabled on all public tables in your Supabase database to resolve the security linter warnings. This migration was applied:

- `20250115000000_enable_rls` - Enables RLS on all tables

## Tables with RLS Enabled

- `_prisma_migrations` (Prisma system table)
- `Client`
- `Brand`
- `JobCollaborator`
- `Task`
- `TaskAssignee`
- `Attachment`
- `Comment`
- `User`
- `Invitation`
- `Job`
- `Notification`
- `PasswordResetToken`
- `EmailVerificationToken`

## Important Notes

### Your Current Setup

Your application uses **Prisma** with a **service role connection** (the `postgres` user). This means:

✅ **RLS is enabled** (satisfies Supabase security requirements)  
✅ **Your app will continue to work** (service role bypasses RLS)  
✅ **No additional policies needed** (for now)

### If You Switch to Anon Role

If you ever want to use Supabase's anon role (for direct PostgREST access), you'll need to create RLS policies. Here's an example of what those policies might look like:

```sql
-- Example: Allow users to read their own data
CREATE POLICY "Users can read own data" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

-- Example: Allow service role full access (for Prisma)
CREATE POLICY "Service role full access" ON "User"
  FOR ALL USING (auth.role() = 'service_role');
```

### Testing

After enabling RLS, test your application to ensure everything still works:

1. Try logging in
2. Create a new task
3. View jobs and tasks
4. Check notifications

If you encounter any "permission denied" errors, you may need to:
- Verify you're using the service role connection string
- Or create appropriate RLS policies

## Supabase Dashboard

You can verify RLS is enabled in your Supabase dashboard:
1. Go to **Database** → **Tables**
2. Click on any table
3. Check the **RLS** tab - it should show "Enabled"

The security linter warnings should now be resolved! ✅


