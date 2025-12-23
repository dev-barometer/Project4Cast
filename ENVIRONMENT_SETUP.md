# Environment Setup - Production vs Staging

## 🎯 The Goal

Have **two separate environments** you can easily tell apart:
- **PRODUCTION** (live, real users) - Don't break this!
- **STAGING** (testing, safe to experiment) - Break things here!

---

## 📋 Quick Reference Card

| | **PRODUCTION** | **STAGING** | **LOCAL** |
|---|---|---|---|
| **URL** | `project4-cast.vercel.app` | `project4cast-staging.vercel.app` | `localhost:3000` |
| **Branch** | `main` | `staging` | `main` or `staging` |
| **Color** | 🟢 Green (safe) | 🟡 Yellow (testing) | 🔵 Blue (dev) |
| **Banner** | None (clean) | "STAGING" banner | "LOCAL DEV" banner |
| **Database** | Production DB | Same DB (or separate) | Same DB |
| **When to use** | Only when ready! | Testing new features | Development |

---

## 🚀 Setup Steps

### Step 1: Create Staging Branch

```bash
# Create staging branch from main
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```

### Step 2: Create Staging Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import same repo: `dev-barometer/Project4Cast`
4. **Project Name**: `project4cast-staging` ⚠️ **Must be different!**
5. **Branch**: Select `staging` (not `main`)
6. Click **"Deploy"**

### Step 3: Copy Environment Variables

In your **new staging project**:
1. Go to **Settings** → **Environment Variables**
2. Copy all variables from production project
3. **Update `NEXT_PUBLIC_BASE_URL`** to staging URL:
   ```
   https://project4cast-staging.vercel.app
   ```
4. **Add `NEXT_PUBLIC_ENV=staging`** (for the banner)

### Step 4: Add Visual Indicators

The app will automatically show:
- **Production**: No banner (clean)
- **Staging**: Yellow "STAGING" banner at top
- **Local**: Blue "LOCAL DEV" banner at top

---

## 🔄 Daily Workflow

### Working on New Features (Staging)

```bash
# 1. Switch to staging branch
git checkout staging

# 2. Make your changes
# ... edit files ...

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin staging

# 4. Test on staging URL
# Go to: https://project4cast-staging.vercel.app
```

### When Ready for Production

```bash
# 1. Make sure staging works!
# Test everything on staging first!

# 2. Switch to main
git checkout main

# 3. Merge staging into main
git merge staging

# 4. Push to production
git push origin main

# 5. Production auto-deploys
# Go to: https://project4-cast.vercel.app
```

### Working Locally

```bash
# Use staging branch for local dev
git checkout staging
npm run dev

# Or use main if you want to match production
git checkout main
npm run dev
```

---

## 🎨 Visual Indicators

The app shows banners so you always know which environment you're in:

- **Production**: No banner (clean interface)
- **Staging**: 🟡 Yellow banner: "⚠️ STAGING ENVIRONMENT - Testing Only"
- **Local**: 🔵 Blue banner: "🔧 LOCAL DEVELOPMENT"

---

## ⚠️ Safety Rules

1. **Always test on STAGING first**
2. **Never push directly to `main`** (use staging → main merge)
3. **Check the banner** before making changes
4. **Production = Real data** (be careful!)
5. **Staging = Safe to break** (experiment freely!)

---

## 🔍 How to Tell Which Environment You're On

### In the Browser:
- **Look at the URL**: 
  - `project4-cast.vercel.app` = Production
  - `project4cast-staging.vercel.app` = Staging
  - `localhost:3000` = Local
- **Look at the banner** at the top of the page

### In Vercel:
- **Project name**: 
  - `project4-cast` = Production
  - `project4cast-staging` = Staging
- **Branch**: 
  - `main` = Production
  - `staging` = Staging

### In Git:
```bash
# Check current branch
git branch

# Should show:
# * staging  (if working on staging)
# * main    (if working on production)
```

---

## 🛠️ Troubleshooting

**"I can't tell which environment I'm on!"**
- Check the URL
- Look for the banner at the top
- Check Vercel project name

**"I accidentally pushed to production!"**
- Don't panic!
- Check if it broke anything
- If broken, revert: `git revert HEAD` and push

**"Staging isn't deploying"**
- Check that branch is pushed: `git push origin staging`
- Check Vercel project is connected to `staging` branch
- Check environment variables are set

---

## 📝 Next Steps

1. ✅ Create staging branch
2. ✅ Create staging project in Vercel
3. ✅ Copy environment variables
4. ✅ Add visual indicators (banner)
5. ✅ Test workflow: staging → production

---

**Remember**: When in doubt, use STAGING! 🟡

