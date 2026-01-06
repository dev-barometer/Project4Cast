# Fix Login Issue - Database Connection Problem

## The Problem

You can't sign in because the database connection is failing. The error shows:
```
Authentication failed against database server, the provided database credentials are not valid.
```

## Quick Fix Options

### Option 1: Get Fresh Database Credentials (Recommended)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings → Database**
4. **Get Connection String**:
   - Look for **"Connection pooling"** tab
   - Select **"Transaction"** mode
   - Copy the connection string (should look like):
     ```
     postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
5. **Update your `.env` file**:
   - Open `.env` in your project
   - Find `DATABASE_URL=`
   - Replace it with the new connection string
   - Save the file
6. **Restart your dev server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

### Option 2: Reset Database Password

If you can't find the connection string:

1. Go to **Supabase Dashboard → Settings → Database**
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. **Copy the new password** (you'll only see it once!)
5. Update your `.env` file `DATABASE_URL` with the new password
6. Restart your dev server

### Option 3: Sign Up a New Account (If Database Works)

If the database connection works but you just don't have an account:

1. Go to: **http://localhost:3000/signup**
2. Create a new account
3. Then sign in at: **http://localhost:3000/login**

### Option 4: Create Test Users

After fixing the database connection:

1. Visit: **http://localhost:3000/api/dev/seed**
2. This will create test users:
   - `alice@example.com` / `password123`
   - `bob@example.com` / `password123`
   - `charlie@example.com` / `password123`
3. Then sign in with any of these accounts

## Check Your Current DATABASE_URL

Your `.env` file should have something like:
```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:**
- Make sure `[PASSWORD]` is your **actual password** (not a placeholder)
- Use the **pooler** connection (has `pooler` in the URL)
- Port should be **6543** for pooler (or **5432** for direct)

## After Fixing

1. Restart your dev server
2. Try signing in again
3. If you still can't sign in, try creating a new account at `/signup`

## Need Help?

If you're still having issues:
1. Check if your Supabase database is **active** (not paused)
2. Verify your `.env` file has the correct format
3. Make sure there are no extra quotes or spaces in the DATABASE_URL




