# Database Connection Troubleshooting

## Current Issue

You're getting this error:
```
Can't reach database server at `aws-1-us-east-2.pooler.supabase.com:5432`
```

## Possible Causes

1. **Database Server is Down** - Supabase database might be paused or offline
2. **Network Issues** - Your internet connection might be blocking the connection
3. **Database Credentials Changed** - The password might have expired
4. **Database URL Format** - The DATABASE_URL might be incorrectly formatted

## Quick Fixes

### 1. Check Your Supabase Database

1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Check if your database project is:
   - **Active** (not paused)
   - **Running** (green status)
4. If it's paused, click "Resume" or "Restore"

### 2. Verify Your DATABASE_URL

Your current DATABASE_URL in `.env`:
```
DATABASE_URL="postgresql://postgres.ohrkehobojuhhmmlfzzt:gecpo6-toxkiw-Qazdip@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

**Check:**
- Is the password correct? (`gecpo6-toxkiw-Qazdip`)
- Is the cloud name correct? (`ohrkehobojuhhmmlfzzt`)
- Are there any extra quotes or spaces?

### 3. Get a Fresh DATABASE_URL from Supabase

1. Go to your Supabase project dashboard
2. Click on "Settings" → "Database"
3. Look for "Connection string" or "Connection pooling"
4. Copy the "URI" format (should start with `postgresql://`)
5. Replace the DATABASE_URL in your `.env` file
6. Restart your server

### 4. Test Database Connection

Run this command to test the connection:
```bash
npx prisma db execute --stdin <<< "SELECT 1;"
```

If this fails, your database is not accessible.

## What I've Done

I've added error handling to your pages so they won't crash if the database is unavailable. Instead, you'll see a helpful error message.

## Next Steps

1. **Check Supabase Dashboard** - Make sure your database is running
2. **Verify DATABASE_URL** - Make sure it's correct in `.env`
3. **Get Fresh Credentials** - If needed, get a new connection string from Supabase
4. **Restart Server** - After updating `.env`, restart the server

## If Database is Paused (Supabase Free Tier)

Supabase free tier databases pause after inactivity. To resume:
1. Go to Supabase dashboard
2. Find your project
3. Click "Resume" or "Restore"
4. Wait a few minutes for it to start
5. Try your app again

## Alternative: Use Local Database (For Development)

If Supabase is unreliable, you can use a local PostgreSQL database:

1. Install PostgreSQL locally
2. Create a database
3. Update DATABASE_URL in `.env` to point to localhost
4. Run migrations: `npx prisma migrate deploy`

But for now, let's try to get Supabase working first!

## Need Help?

1. Check Supabase dashboard - is the database running?
2. Try getting a fresh connection string from Supabase
3. Update your `.env` file with the new connection string
4. Restart your server
5. Try again!

Let me know what you find in the Supabase dashboard!

