# Sync Vercel Environment Variables to Local

Your local `.env` is out of date. Here's how to sync it with what's working on Vercel:

## Step 1: Get Environment Variables from Vercel

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Copy these values (click the eye icon 👁️ to reveal):

### Required:
1. **`DATABASE_URL`** - Database connection string
2. **`AUTH_SECRET`** - Authentication secret
3. **`BLOB_READ_WRITE_TOKEN`** - For file uploads (get from Settings → Storage → Blob)

### Optional (if you use emails):
4. **`RESEND_API_KEY`** - For sending emails
5. **`RESEND_FROM_EMAIL`** - Email address to send from
6. **`NEXT_PUBLIC_BASE_URL`** - Your app URL
7. **`NEXT_PUBLIC_APP_NAME`** - App name

## Step 2: Update Your Local .env File

Once you have the values, I can help you update your `.env` file. Or you can do it manually:

1. Open `.env` in your project root
2. Replace/update these values:
   - `DATABASE_URL=` (from Vercel)
   - `AUTH_SECRET=` (from Vercel)
   - `BLOB_READ_WRITE_TOKEN=` (from Vercel Storage → Blob)
3. You can remove or comment out the Cloudinary variables (they're not used anymore):
   ```
   # CLOUDINARY_CLOUD_NAME=dgtgjgby4
   # CLOUDINARY_API_KEY=425338811227916
   # CLOUDINARY_API_SECRET=oURG5Yzksn2_8-Rg7WFKmyLn1TA
   ```

## Step 3: Restart Your Dev Server

After updating `.env`:
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Quick Copy-Paste Format

Your `.env` should look like:
```env
DATABASE_URL=postgresql://postgres.xxx:xxx@aws-0-xxx.pooler.supabase.com:6543/postgres
AUTH_SECRET=your-auth-secret-from-vercel
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@project4cast.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Project4Cast
```

## Need Help?

Once you have the values from Vercel, paste them here and I'll update your `.env` file for you!



