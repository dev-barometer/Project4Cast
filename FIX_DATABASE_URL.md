# How to Fix Your DATABASE_URL in Vercel

## The Problem

You put this in Vercel:
```
postgresql://postgres:[YOUR-PASSWORD]@db.ohrkehobojuhhmmlfzzt.supabase.co:5432/postgres
```

But `[YOUR-PASSWORD]` is a placeholder - you need your **actual password**!

## How to Find Your Supabase Database Password

### Option 1: Check Your Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **"Connection string"** section
5. Look for **"URI"** or **"Connection pooling"**
6. You'll see a connection string that looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

**Important:** The password might be hidden with dots or asterisks. If you can't see it, use Option 2.

### Option 2: Reset Your Database Password

If you can't see your password:

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. Copy the new password (you'll only see it once!)
5. Use this new password in your Vercel DATABASE_URL

### Option 3: Check Your Local .env File

If you have a `.env` file on your computer that works locally:

1. Open your `.env` file
2. Look for `DATABASE_URL=`
3. Copy the entire connection string
4. Use that exact string in Vercel

## How to Update in Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. Click **Edit** (or the pencil icon)
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Click **Save**
7. **Redeploy** your project (go to Deployments → click the three dots → Redeploy)

## Example of Correct Format

**Wrong:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.ohrkehobojuhhmmlfzzt.supabase.co:5432/postgres
```

**Right:**
```
postgresql://postgres:MyActualPassword123!@db.ohrkehobojuhhmmlfzzt.supabase.co:5432/postgres
```

(Replace `MyActualPassword123!` with your real password)

## After Fixing

Once you update the DATABASE_URL with the real password and redeploy, the build should succeed!

## Need Help?

- Can't find your password? Reset it in Supabase (Option 2 above)
- Still having issues? Check that your Supabase project is active and the database is running
