# Find Email for BarclayM GitHub Account

## How to Find Your GitHub Account Email

### Method 1: Check GitHub Account Settings

1. Go to https://github.com
2. Make sure you're logged in as "BarclayM" (not dev-barometer)
3. Click your profile picture (top right) → **Settings**
4. In the left sidebar, click **"Emails"**
5. You'll see all emails associated with that GitHub account
6. Use the **primary email** (usually the one that's verified and shown first)

### Method 2: Check Your Git Config

Your local Git might be configured with the email:

```bash
git config user.email
```

This shows: `barclay@missen.co`

**Try using:** `barclay@missen.co` in Vercel

### Method 3: Check GitHub Profile

1. Go to https://github.com/BarclayM (or your profile)
2. Check if your email is visible on your profile
3. Or check the email you used when you signed up for GitHub

## What to Do in Vercel

1. In Vercel → Settings → Team → Invite Member
2. Enter the email address associated with your "BarclayM" GitHub account
3. Most likely: `barclay@missen.co` (from your Git config)
4. Send the invitation
5. Check that email inbox for the invitation
6. Accept it and make sure to connect your "BarclayM" GitHub account

## If You're Not Sure

Try these emails in order:
1. `barclay@missen.co` (from your Git config)
2. `barclay@barometergroup.com` (your Vercel account email)
3. Any other email you use regularly

The invitation will be sent to that email, so make sure you can access it!

