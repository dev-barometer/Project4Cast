# Fix Database Connection Issue

## The Problem
You're getting this error when trying to sign up:
```
Can't reach database server at aws-1-us-east-2.pooler.supabase.com:5432
```

## Most Likely Cause
**Your Supabase database is paused** (common with free tier after inactivity).

## Quick Fix Steps

### 1. Check Your Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Find your project (the one with database `ohrkehobojuhhmmlfzzt`)
4. **Check if the database status shows "Paused" or "Inactive"**

### 2. Resume Your Database
If your database is paused:
1. Click on your project
2. Look for a **"Resume"** or **"Restore"** button
3. Click it and wait 1-2 minutes for the database to start
4. You should see the status change to **"Active"** or **"Running"**

### 3. Test the Connection
After resuming:
1. Go back to http://localhost:3000/signup
2. Try creating an account again
3. It should work now!

## If Database is Already Active

If your database shows as "Active" but you're still getting errors:

### Option 1: Get a Fresh Connection String
1. In Supabase dashboard, go to **Settings** → **Database**
2. Look for **"Connection string"** or **"Connection pooling"**
3. Copy the **"URI"** format (starts with `postgresql://`)
4. Update your `.env` file with the new connection string
5. Restart your server

### Option 2: Check Your Database URL Format
Your current DATABASE_URL should look like:
```
DATABASE_URL="postgresql://postgres.ohrkehobojuhhmmlfzzt:PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

Make sure:
- No extra spaces
- Password is correct (not expired)
- No quotes inside the URL (only around the whole thing)

### Option 3: Try Direct Connection (Not Pooler)
Sometimes the pooler has issues. Try using the direct connection:
1. In Supabase dashboard, go to **Settings** → **Database**
2. Find **"Connection string"** → **"Direct connection"**
3. Copy that URL
4. Update your `.env` file
5. Restart your server

## After Fixing

Once your database is running:
1. Try the signup page again
2. Create your account
3. Sign in with your new account
4. Everything should work!

## Still Having Issues?

If none of these work:
1. Check your Supabase project is not over quota
2. Verify your database credentials haven't expired
3. Try creating a new Supabase project
4. Or use a local PostgreSQL database for development

Let me know what you see in your Supabase dashboard!

