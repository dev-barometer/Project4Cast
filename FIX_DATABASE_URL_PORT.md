# Fix DATABASE_URL Port Issue

## The Problem

The error says "Authentication failed" - this means it's connecting to the database, but the credentials are wrong.

**The issue:** Supabase connection pooling uses port **6543**, not **5432**!

## The Fix

Your current DATABASE_URL is:
```
postgresql://postgres.ohrkehobojuhhmmlfzzt:gecpo6-toxkiw-Qazdip@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

**Change it to:**
```
postgresql://postgres.ohrkehobojuhhmmlfzzt:gecpo6-toxkiw-Qazdip@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**Notice:** Port changed from `5432` to `6543`

## How to Fix in Vercel

1. Go to **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **Edit**
4. Change the port from `:5432` to `:6543`
5. Click **Save**
6. **Redeploy** (Vercel will ask, or go to Deployments → Redeploy)

## Why This Matters

- Port **5432** = Direct database connection (doesn't work well with serverless)
- Port **6543** = Connection pooler (works great with serverless/Vercel)

After changing the port and redeploying, the password reset should work!

