# Update App Name in Vercel

## What We Changed in Code

✅ Updated `package.json` name to "project4cast"
✅ Updated `app/layout.tsx` description
✅ Updated `lib/email.ts` fallback names

## What You Need to Update in Vercel

The app name is controlled by the `NEXT_PUBLIC_APP_NAME` environment variable. Update it:

1. Go to Vercel → Your project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_NAME`
3. Click **Edit**
4. Change the value from `Asana Replacement` to `Project4Cast`
5. Click **Save**
6. **Redeploy** (Vercel will ask, or go to Deployments → Redeploy)

## After Redeploying

The app name will be updated everywhere:
- Email invitations
- Email subjects
- Page metadata
- Anywhere else that uses `NEXT_PUBLIC_APP_NAME`

## Optional: Update Project Name in Vercel

You can also rename the project itself:
1. Go to **Settings** → **General**
2. Change "Project Name" from "project4-cast" to whatever you want
3. This doesn't affect functionality, just the display name in Vercel dashboard

