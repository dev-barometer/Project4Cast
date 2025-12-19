# Fix Your DATABASE_URL in Vercel

## The Problem

Your DATABASE_URL in Vercel is incomplete/truncated. It shows:
```
j5Edxols44yTNMSV]@db.ohrkehobojuhhmn
```

But it should be the **full connection string** from your `.env` file.

## The Correct Value

From your local `.env` file, the correct DATABASE_URL is:

```
postgresql://postgres.ohrkehobojuhhmmlfzzt:gecpo6-toxkiw-Qazdip@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

## How to Fix in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Find `DATABASE_URL` in the list
4. Click **Edit** (or the pencil icon)
5. **Delete** the current value (the truncated one)
6. **Paste** the full connection string above
7. Click **Save**

## After Fixing

1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest failed deployment
3. Click **"Redeploy"**
4. The build should now succeed!

## Important Notes

- Make sure you copy the **entire** connection string - it's long!
- Don't add quotes around it
- Don't add any spaces
- The connection string should start with `postgresql://` and end with `/postgres`

