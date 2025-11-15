# Cloudinary Configuration Fix

## ✅ Code Updated!

I've updated the code to explicitly parse the `CLOUDINARY_URL` environment variable. The issue was that Cloudinary's SDK doesn't always automatically read `CLOUDINARY_URL` in Next.js server actions.

## Your `.env` File

Make sure your `.env` file has exactly this format (no quotes, no extra spaces):

```env
CLOUDINARY_URL=cloudinary://425338811227916:YOUR_ACTUAL_API_SECRET@dgtgjgby4
```

**Important:**
- Replace `YOUR_ACTUAL_API_SECRET` with your **actual API secret** from Cloudinary dashboard
- Do NOT use asterisks (`**********`) - use the real secret
- No quotes around the value
- No spaces before or after the `=`
- No spaces in the URL itself

## How to Get Your API Secret

1. Go to your Cloudinary Dashboard
2. Click on "Account Details" or "Settings"
3. Look for "API Secret"
4. Click "Reveal" or "Show" to see it
5. Copy the entire secret (it's a long string of characters)

## Example `.env` File

```env
DATABASE_URL=your_database_url
CLOUDINARY_URL=cloudinary://425338811227916:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz@dgtgjgby4
```

## Restart Your Server

After updating your `.env` file:

1. **Stop the server**: Press `Ctrl + C` (or `Cmd + C` on Mac)
2. **Start it again**: `npm run dev`
3. **Wait for "Ready"** message
4. **Try uploading a file**

## Verification

To verify your configuration is correct, check your server terminal. You should NOT see any errors about:
- "Cloudinary not configured"
- "Invalid CLOUDINARY_URL format"
- "Unknown API key"

If you see these errors, double-check your `.env` file format.

## Common Issues

### Issue 1: Using Asterisks Instead of Real Secret
**Wrong:**
```env
CLOUDINARY_URL=cloudinary://425338811227916:**********@dgtgjgby4
```

**Right:**
```env
CLOUDINARY_URL=cloudinary://425338811227916:your_actual_secret_here@dgtgjgby4
```

### Issue 2: Extra Spaces
**Wrong:**
```env
CLOUDINARY_URL = cloudinary://425338811227916:secret@dgtgjgby4
CLOUDINARY_URL="cloudinary://425338811227916:secret@dgtgjgby4"
```

**Right:**
```env
CLOUDINARY_URL=cloudinary://425338811227916:secret@dgtgjgby4
```

### Issue 3: Missing Parts
Make sure your URL has all three parts:
- API Key (before the `:`)
- API Secret (between `:` and `@`)
- Cloud Name (after the `@`)

## Alternative: Use Individual Variables

If you prefer, you can use individual variables instead:

```env
CLOUDINARY_CLOUD_NAME=dgtgjgby4
CLOUDINARY_API_KEY=425338811227916
CLOUDINARY_API_SECRET=your_actual_api_secret_here
```

**Note:** Use either `CLOUDINARY_URL` OR the individual variables, not both!

## Testing

1. Update your `.env` file with the correct format
2. Restart your server
3. Go to any job detail page
4. Click "Add attachment"
5. Upload a file
6. It should work without errors!

## Still Having Issues?

If you're still getting errors:

1. **Check your server terminal** for error messages
2. **Verify your API secret** in Cloudinary dashboard
3. **Make sure you restarted** the server after updating `.env`
4. **Check for typos** in your `.env` file
5. **Try using individual variables** instead of `CLOUDINARY_URL`

Let me know what error message you see and I'll help you fix it!

