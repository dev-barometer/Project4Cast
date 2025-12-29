# Staging Environment Setup Guide

This guide will help you set up a non-production (staging) environment so you can test changes without affecting your production site.

## Overview

You'll have two environments:
- **Production**: Deploys from `main` branch → `project4-cast.vercel.app` (or your custom domain)
- **Staging**: Deploys from `staging` branch → `project4-cast-staging.vercel.app` (separate URL)

## Step 1: Create a Staging Branch

```bash
# Create and switch to staging branch
git checkout -b staging

# Push staging branch to GitHub
git push -u origin staging
```

## Step 2: Set Up Staging Project in Vercel

### Option A: Create a New Vercel Project (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import the same GitHub repository (`dev-barometer/Project4Cast`)
4. **Important**: Under "Configure Project":
   - **Project Name**: `project4cast-staging` (or similar)
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)
5. **Branch**: Select `staging` (not `main`)
6. Click **"Deploy"**

### Option B: Use Branch-Based Deployments (Simpler)

1. Go to your existing project in Vercel Dashboard
2. Go to **Settings** → **Git**
3. Under **Production Branch**, ensure it's set to `main`
4. Vercel will automatically create preview deployments for other branches
5. Go to **Settings** → **Git** → **Deploy Hooks** (optional)
   - Create a deploy hook for the `staging` branch if you want manual control

## Step 3: Configure Environment Variables for Staging

1. In your **new staging project** (or branch settings):
   - Go to **Settings** → **Environment Variables**
   - Copy all environment variables from your production project:
     - `DATABASE_URL` (can use same database, or create a separate one)
     - `AUTH_SECRET`
     - `RESEND_API_KEY`
     - `RESEND_FROM_EMAIL`
     - `NEXT_PUBLIC_BASE_URL` (set to staging URL)
     - `NEXT_PUBLIC_APP_NAME`
     - `BLOB_READ_WRITE_TOKEN`
     - `NODE_ENV` (set to `production` for staging too)

2. **Important**: Update `NEXT_PUBLIC_BASE_URL` to your staging URL:
   - If using Option A: `https://project4cast-staging.vercel.app`
   - If using Option B: Vercel will auto-generate a preview URL

## Step 4: Workflow

### For Production Changes:
```bash
# Make changes on main branch
git checkout main
# ... make changes ...
git add .
git commit -m "Your production change"
git push origin main
# Production auto-deploys
```

### For Staging/Testing Changes:
```bash
# Make changes on staging branch
git checkout staging
# ... make changes ...
git add .
git commit -m "Your staging change"
git push origin staging
# Staging auto-deploys

# Once tested, merge to main:
git checkout main
git merge staging
git push origin main
```

## Step 5: Database Considerations

**Option 1: Shared Database (Simpler)**
- Use the same `DATABASE_URL` for both environments
- **Pros**: No data duplication, simpler setup
- **Cons**: Staging changes affect production data (be careful!)

**Option 2: Separate Database (Safer)**
- Create a new Supabase project for staging
- Use a different `DATABASE_URL` for staging
- **Pros**: Complete isolation, safe testing
- **Cons**: Need to manage two databases

**Recommendation**: Start with Option 1 (shared database) since you're the only user. Switch to Option 2 later if needed.

## Quick Reference

- **Production URL**: `https://project4-cast.vercel.app`
- **Staging URL**: `https://project4cast-staging.vercel.app` (or preview URL)
- **Production Branch**: `main`
- **Staging Branch**: `staging`

## Troubleshooting

- **Staging not deploying?** Check that the branch is pushed to GitHub
- **Environment variables not working?** Make sure they're set for the correct branch/environment
- **Database connection issues?** Verify `DATABASE_URL` is set correctly in staging project settings

