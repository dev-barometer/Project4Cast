# Vercel Environment Variables Setup

## Quick Guide: What to Add in Vercel

When you're on the Vercel "New Project" page, here's what to add in the **Environment Variables** section:

### Step 1: Remove the Example Variable

1. Click the **minus (-)** button next to `EXAMPLE_NAME` to remove it
2. You don't need that one

### Step 2: Add These Variables

Click **"+ Add More"** for each variable below:

---

## Required Variables (Must Have)

### 1. `DATABASE_URL`
**What it is:** Your Supabase database connection string

**Where to find it:**
1. Go to your Supabase project dashboard
2. Go to **Settings** → **Database**
3. Look for **"Connection string"** or **"Connection pooling"**
4. Copy the **URI** (starts with `postgresql://`)

**Example:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**In Vercel:**
- **Key:** `DATABASE_URL`
- **Value:** (paste your Supabase connection string)

---

### 2. `AUTH_SECRET`
**What it is:** A secret key for NextAuth (authentication)

**How to create it:**
Run this command in your terminal (or I can generate one for you):
```bash
openssl rand -base64 32
```

**In Vercel:**
- **Key:** `AUTH_SECRET`
- **Value:** (paste the generated secret - it's a long random string)

---

## Optional Variables (Only if you use email features)

### 3. `RESEND_API_KEY` (Optional)
**What it is:** API key for sending emails (invitations, notifications)

**Where to find it:**
1. Go to https://resend.com
2. Sign up/login
3. Go to **API Keys**
4. Create a new key
5. Copy it

**In Vercel:**
- **Key:** `RESEND_API_KEY`
- **Value:** (paste your Resend API key, starts with `re_`)

---

### 4. `RESEND_FROM_EMAIL` (Optional)
**What it is:** Email address to send emails from

**For testing:**
- **Key:** `RESEND_FROM_EMAIL`
- **Value:** `onboarding@resend.dev`

**For production:** Use your verified domain email

---

### 5. `NEXT_PUBLIC_BASE_URL` (Optional)
**What it is:** Your app's URL

**Vercel will set this automatically**, but if you want to override:
- **Key:** `NEXT_PUBLIC_BASE_URL`
- **Value:** `https://your-project-name.vercel.app` (Vercel will give you this after first deploy)

---

### 6. `NEXT_PUBLIC_APP_NAME` (Optional)
**What it is:** Your app's name (used in emails)

**In Vercel:**
- **Key:** `NEXT_PUBLIC_APP_NAME`
- **Value:** `Asana Replacement` (or whatever you want)

---

## ⚠️ Important: BLOB_READ_WRITE_TOKEN

**Don't add this yet!** 

You'll get this token **after** you create the project:
1. After clicking "Deploy" and the project is created
2. Go to **Settings** → **Storage**
3. Click **"Create Blob Store"**
4. Copy the token
5. Go to **Settings** → **Environment Variables**
6. Add `BLOB_READ_WRITE_TOKEN` with the token value
7. Redeploy the project

---

## Summary: Minimum Required

For the app to work, you **must** add at minimum:

1. ✅ `DATABASE_URL` - Your Supabase connection string
2. ✅ `AUTH_SECRET` - Generate with `openssl rand -base64 32`

Everything else is optional and can be added later!

---

## Quick Copy-Paste Format

If you want to use the "Import .env" feature, here's the format:

```env
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
AUTH_SECRET=your-generated-secret-here
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_NAME=Asana Replacement
```

---

## Need Help?

- **Don't have Supabase?** You'll need to set up a database first
- **Don't know your DATABASE_URL?** Check your Supabase dashboard
- **Need to generate AUTH_SECRET?** Run `openssl rand -base64 32` or ask me!

