# Verify DATABASE_URL is Correct

## The Error Shows

The error log shows it's trying to connect to:
- `db.ohrkehobojuhhmmlfzzt.supabase.co:5432` ❌ (WRONG - direct connection)

But it should be:
- `aws-1-us-east-2.pooler.supabase.com:5432` ✅ (CORRECT - pooler connection)

## What to Check in Vercel

1. Go to **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **Edit** (or the eye icon to view it)
4. Make sure it says:
   ```
   postgresql://postgres.ohrkehobojuhhmmlfzzt:gecpo6-toxkiw-Qazdip@aws-1-us-east-2.pooler.supabase.com:5432/postgres
   ```

## If It's Wrong

1. Click **Edit** on `DATABASE_URL`
2. **Delete** the old value
3. **Paste** the correct pooler URL above
4. Click **Save**
5. **Redeploy** (Vercel will ask, or go to Deployments → Redeploy)

## Important

- Make sure you're using the **pooler** URL (has `pooler` in it)
- NOT the direct connection URL (has `db.` in it)
- The pooler URL works better with serverless functions like Vercel

## After Redeploying

Try the password reset again. The database connection should work now.

