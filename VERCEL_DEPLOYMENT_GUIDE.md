# Vercel Deployment Guide

## ✅ Current Status

- ✅ Git repository is set up
- ✅ All changes committed (including Vercel Blob migration)
- ✅ Ready to connect to Vercel

## Next Steps (When You Return)

### Step 1: Push Your Code to GitHub/GitLab/Bitbucket

If you haven't already, push your code to a Git hosting service:

```bash
# If you have a remote already set up:
git push origin main

# If you need to create a new repository on GitHub:
# 1. Go to github.com and create a new repository
# 2. Then run:
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Import Project"** (the big button you saw)
3. **Select your Git provider** (GitHub/GitLab/Bitbucket)
4. **Authorize Vercel** to access your repositories
5. **Select your repository** from the list
6. **Configure the project**:
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (should auto-detect)
   - Output Directory: `.next` (should auto-detect)

### Step 3: Add Environment Variables

Before deploying, add your environment variables in Vercel:

1. In the project setup, go to **"Environment Variables"**
2. Add all your `.env` variables:
   - `DATABASE_URL` (your Supabase connection string)
   - `NEXTAUTH_SECRET` (your NextAuth secret)
   - `NEXTAUTH_URL` (will be auto-set, but you can override)
   - `RESEND_API_KEY` (if using email)
   - Any other secrets from your `.env` file

**Important:** Do NOT add `BLOB_READ_WRITE_TOKEN` here yet - we'll get that in the next step!

### Step 4: Get Your Blob Storage Token

1. After the project is created, go to **Settings** → **Storage**
2. Click **"Create Blob Store"**
3. Give it a name (e.g., "asana-replacement-files")
4. Copy the `BLOB_READ_WRITE_TOKEN`
5. Go back to **Settings** → **Environment Variables**
6. Add `BLOB_READ_WRITE_TOKEN` with the token value

### Step 5: Deploy!

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build your app (`npm run build`)
   - Deploy it to a live URL
3. Wait 2-3 minutes for the build to complete
4. You'll get a URL like: `https://your-project-name.vercel.app`

### Step 6: Set Up Database (If Needed)

If you're using Supabase:
1. Make sure your `DATABASE_URL` in Vercel points to your Supabase database
2. Run migrations if needed (Vercel can do this automatically, or you can run them manually)

## After Deployment

### Test File Uploads

1. Go to your live URL
2. Log in
3. Try uploading a file (PDF, DOCX, PNG, or PPTX)
4. It should work without any 401 errors! 🎉

### Auto-Deployments

From now on:
- Every time you `git push` to your main branch
- Vercel will automatically deploy the new version
- No manual steps needed!

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Make sure all environment variables are set
- Verify `package.json` has all dependencies

### File Uploads Don't Work
- Check that `BLOB_READ_WRITE_TOKEN` is set in Vercel environment variables
- Make sure you restarted/redeployed after adding the token

### Database Connection Issues
- Verify `DATABASE_URL` is correct in Vercel
- Check that your Supabase database allows connections from Vercel's IPs

## Quick Reference

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project Settings**: Settings → General
- **Environment Variables**: Settings → Environment Variables
- **Storage/Blob**: Settings → Storage
- **Deployments**: Deployments tab

## What's Different Now?

- ✅ Files stored in Vercel Blob (not Cloudinary)
- ✅ No more 401 errors
- ✅ Simpler setup
- ✅ Better integration with Next.js
- ✅ Automatic deployments on every push

Good luck! 🚀
