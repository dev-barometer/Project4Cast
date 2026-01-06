# Get DATABASE_URL from Vercel - Step by Step

The password in your local DATABASE_URL is outdated. Here's exactly how to get the working one from Vercel:

## Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Log in if needed

2. **Find Your Project**
   - Look for the project (probably named "project4-cast" or similar)
   - Click on it

3. **Go to Settings**
   - Click **"Settings"** in the top navigation
   - Then click **"Environment Variables"** in the left sidebar

4. **Find DATABASE_URL**
   - Scroll through the list to find `DATABASE_URL`
   - Click the **eye icon** (👁️) next to it to reveal the value

5. **Copy the Entire String**
   - It should look like:
     ```
     postgresql://postgres.ohrkehobojuhhmmlfzzt:ACTUAL_PASSWORD_HERE@aws-1-us-east-2.pooler.supabase.com:5432/postgres
     ```
   - Copy the **entire** string (it's long!)

6. **Paste It Here**
   - Once you have it, paste it here and I'll update your `.env` file
   - Or update it yourself in `.env`:
     ```
     DATABASE_URL=postgresql://postgres.ohrkehobojuhhmmlfzzt:ACTUAL_PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres
     ```

7. **Restart Your Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

## Quick Alternative

If you can't find it in Vercel, you can also:
1. Go to **Supabase Dashboard** → Your Project → **Settings** → **Database**
2. Get the connection string from there (it will have the correct password)

## Important Notes

- The password in the connection string is **different** from what's in git
- Vercel has the correct, working password
- Once you update it locally, sign-in should work!




