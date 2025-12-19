# Troubleshoot Database Connection

## Step 1: Get Exact Connection String from Supabase

Instead of manually building it, get it directly from Supabase:

1. Go to Supabase Dashboard → Your Project
2. **Settings** → **Database**
3. Scroll to **"Connection string"** section
4. Click **"Connection pooling"** tab
5. Select **"Transaction"** mode
6. Click **"Copy"** button next to the connection string
7. This will copy the EXACT format Supabase wants

## Step 2: Check for Special Characters

If your password has special characters (like `@`, `#`, `%`, etc.), they need to be URL-encoded in the connection string.

Common encodings:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- `&` becomes `%26`

## Step 3: Verify Format

The connection string should look EXACTLY like this format:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Make sure:
- Username is `postgres.[PROJECT_REF]` (with the dot)
- Port is `6543` (for pooler)
- Host has `pooler` in it
- No extra spaces or quotes

## Step 4: Test Connection

After updating, check the latest error logs to see if it's still authentication or a different error.

## Alternative: Use Direct Connection (Temporary)

If pooler keeps failing, try the direct connection temporarily:
1. Supabase → Settings → Database → Connection string
2. Click **"Direct connection"** tab
3. Copy that connection string
4. Use it in Vercel (but this might have connection limit issues)

Let me know what the latest error says!

