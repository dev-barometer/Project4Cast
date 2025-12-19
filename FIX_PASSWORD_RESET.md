# Fix Password Reset Issue

## The Problem

The password reset is showing "Something went wrong. Please try again later." This could be due to:

1. **Missing/incorrect environment variables in Vercel**
2. **Email service (Resend) not configured**
3. **Database connection issue**

## Quick Fixes

### Step 1: Check Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and make sure you have:

1. **`NEXT_PUBLIC_BASE_URL`** - Should be your actual Vercel URL:
   - `https://project4-cast-git-main-barometer-group.vercel.app`
   - OR `https://project4-cast.vercel.app` (if you have a custom domain)

2. **`RESEND_API_KEY`** - Your Resend API key (starts with `re_`)

3. **`RESEND_FROM_EMAIL`** - Email address (e.g., `noreply@project4cast.com`)

### Step 2: Check Vercel Logs

1. Go to your Vercel project → **Logs** tab
2. Look for any errors related to password reset
3. Check for database connection errors or email sending errors

### Step 3: Alternative - Create a New User

If password reset isn't working, you can:

1. Go to `/api/dev/seed` (if it's still accessible)
2. Create a new test user
3. Or manually create a user in the database

## Most Likely Issue

The `NEXT_PUBLIC_BASE_URL` is probably still set to `http://localhost:3000` or `https://your-project-name.vercel.app` (placeholder). 

**Update it to your actual Vercel URL:**
- Go to Vercel → Settings → Environment Variables
- Find `NEXT_PUBLIC_BASE_URL`
- Update it to: `https://project4-cast-git-main-barometer-group.vercel.app` (or whatever your actual URL is)

## After Fixing

1. Redeploy the project (or wait for auto-deploy)
2. Try the password reset again
3. Check your email inbox for the reset link

