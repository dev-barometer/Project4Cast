# Step-by-Step: Create Staging Project in Vercel

## 🎯 Goal
Create a separate Vercel project for staging so you can test without affecting production.

---

## Step 1: Go to Vercel Dashboard

1. Open your web browser
2. Go to: **https://vercel.com/dashboard**
3. Log in if needed

**✅ Checkpoint**: You should see your Vercel dashboard with your projects.

---

## Step 2: Start Creating a New Project

1. Look for a button that says **"Add New..."** or **"New Project"** or **"Create"**
   - Usually in the top right or top center
2. Click it
3. Select **"Project"** from the dropdown (if there's a dropdown)

**✅ Checkpoint**: You should see a page asking you to import a repository.

---

## Step 3: Import Your GitHub Repository

1. You should see a list of your GitHub repositories
2. Look for: **`dev-barometer/Project4Cast`**
3. Click on it (or click "Import" next to it)

**✅ Checkpoint**: You should see a "Configure Project" page.

---

## Step 4: Configure the Project

**⚠️ IMPORTANT**: This is where we make it different from production!

1. **Project Name**: 
   - Change it to: `project4cast-staging`
   - ⚠️ **Must be different** from your production project name!
   - This is how you'll tell them apart in Vercel

2. **Framework Preset**: 
   - Should say "Next.js" (leave as is)

3. **Root Directory**: 
   - Leave as `./` (default)

4. **Build Command**: 
   - Leave as `npm run build` (default)

5. **Output Directory**: 
   - Leave as `.next` (default)

6. **Install Command**: 
   - Leave as `npm install` (default)

**✅ Checkpoint**: All settings should look correct.

---

## Step 5: Select the Staging Branch

**⚠️ THIS IS CRITICAL!**

1. Look for a section called **"Branch"** or **"Production Branch"**
2. You should see a dropdown or selector
3. **Change it from `main` to `staging`**
   - Click the dropdown
   - Select `staging`
   - ⚠️ **Make sure it says `staging`, NOT `main`!**

**✅ Checkpoint**: Branch should say `staging`.

---

## Step 6: Add Environment Variables (Part 1)

**Don't deploy yet!** We need to add environment variables first.

1. Look for a section called **"Environment Variables"** or **"Env Vars"**
2. Click **"Add"** or **"+ Add More"** for each variable below

You'll need to copy these from your **production project**. Let me guide you through that next.

---

## Step 7: Copy Environment Variables from Production

### First, get the values from production:

1. **Open a new tab** in your browser
2. Go to your **production project** in Vercel
   - Look for the project named `project4-cast` (or whatever your production project is called)
3. Go to **Settings** → **Environment Variables**
4. **Keep this tab open** - you'll need to copy values from here

### Now, back in your new staging project:

Add these variables one by one (click the eye icon 👁️ in production to see the values):

1. **`DATABASE_URL`**
   - Copy from production
   - Paste into staging

2. **`AUTH_SECRET`**
   - Copy from production
   - Paste into staging

3. **`BLOB_READ_WRITE_TOKEN`**
   - Copy from production
   - Paste into staging

4. **`RESEND_API_KEY`** (if you have it)
   - Copy from production
   - Paste into staging

5. **`RESEND_FROM_EMAIL`** (if you have it)
   - Copy from production
   - Paste into staging

6. **`NEXT_PUBLIC_BASE_URL`**
   - **DON'T copy from production!**
   - Set it to: `https://project4cast-staging.vercel.app`
   - (Vercel will give you the actual URL after deployment, but use this for now)

7. **`NEXT_PUBLIC_APP_NAME`**
   - Copy from production (or set to `Project4Cast`)

8. **`NEXT_PUBLIC_ENV`** ⭐ **NEW ONE!**
   - **Key**: `NEXT_PUBLIC_ENV`
   - **Value**: `staging`
   - This makes the yellow banner appear!

**✅ Checkpoint**: All environment variables should be added.

---

## Step 7: Deploy!

1. Scroll down to the bottom
2. Click **"Deploy"** button
3. Wait 2-3 minutes for it to build

**✅ Checkpoint**: You should see a build progress screen.

---

## Step 8: Get Your Staging URL

1. Once deployment finishes, you'll see a URL
2. It should be something like: `https://project4cast-staging-xxxxx.vercel.app`
3. **Copy this URL**
4. Go back to **Settings** → **Environment Variables**
5. **Update `NEXT_PUBLIC_BASE_URL`** with the actual staging URL

---

## Step 9: Test It!

1. Open your staging URL in a browser
2. **Look for the yellow banner** at the top: "⚠️ STAGING ENVIRONMENT - Testing Only"
3. If you see it, **SUCCESS!** 🎉

---

## Troubleshooting

**"I don't see the staging branch option"**
- Make sure you pushed the staging branch to GitHub first
- Try refreshing the page

**"The banner doesn't show"**
- Make sure `NEXT_PUBLIC_ENV=staging` is set
- Make sure you're on the staging URL (not production)

**"Environment variables aren't working"**
- Make sure you copied them exactly (no extra spaces)
- Redeploy after adding variables

---

## What's Next?

Once staging is set up:
- ✅ Work on `staging` branch locally
- ✅ Push to `staging` → Auto-deploys to staging URL
- ✅ Test on staging (yellow banner = safe!)
- ✅ Merge to `main` → Deploys to production

---

**Need help?** Let me know which step you're on and I'll help! 🚀



