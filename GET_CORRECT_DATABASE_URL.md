# Get Correct DATABASE_URL from Supabase

## The Problem

The authentication is failing, which means either:
1. The password is wrong/expired
2. The connection string format is incorrect
3. The database password needs to be reset

## Solution: Get Fresh Connection String from Supabase

### Step 1: Go to Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project

### Step 2: Get Connection String

1. Go to **Settings** → **Database**
2. Scroll down to **"Connection string"** section
3. Look for **"Connection pooling"** tab (not "Direct connection")
4. Select **"Transaction"** mode (or "Session" mode)
5. Copy the connection string (it should look like):
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 3: Update in Vercel

1. Go to Vercel → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Click **Edit**
4. **Delete** the old value
5. **Paste** the NEW connection string from Supabase
6. Click **Save**
7. **Redeploy**

## Alternative: Reset Database Password

If you can't find the connection string:

1. Go to Supabase → Settings → Database
2. Look for **"Database password"** section
3. Click **"Reset database password"**
4. Copy the new password (you'll only see it once!)
5. Update your DATABASE_URL with the new password
6. Redeploy

## Important Notes

- Make sure you're using the **pooler** connection string (has `pooler` in it)
- Use port **6543** for pooler (not 5432)
- The username format should be `postgres.[PROJECT_REF]` (not just `postgres`)

After updating with the correct connection string from Supabase, it should work!

