# Cloudinary Setup Instructions

## ✅ Code is Already Updated!

The code has been updated to use Cloudinary. Now you just need to:

1. **Sign up for Cloudinary** (free)
2. **Get your API keys**
3. **Add them to your `.env` file**

## Step 1: Sign Up for Cloudinary

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account (no credit card required)
3. Verify your email address

## Step 2: Get Your API Keys

1. After signing in, you'll see your **Dashboard**
2. On the Dashboard, you'll see:
   - **Cloud Name** (e.g., `demo`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

3. Copy these three values

## Step 3: Add Keys to `.env` File

**Option 1: Using CLOUDINARY_URL (Easiest - Recommended)**

1. Open your `.env` file in the project root
2. Add this single line (replace with your actual URL from Cloudinary dashboard):

```env
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

**Example:**
```env
CLOUDINARY_URL=cloudinary://425338811227916:**********@dgtgjgby4
```

**Where to find it:**
- Go to your Cloudinary Dashboard
- Look for "Cloudinary URL" or "Account Details"
- Copy the entire URL (starts with `cloudinary://`)

**Option 2: Using Individual Variables**

If you prefer to use individual variables instead:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Note:** Use either Option 1 OR Option 2, not both!

## Step 4: Restart Your Development Server

1. Stop your development server (Ctrl+C)
2. Start it again: `npm run dev`
3. Try uploading a file!

## ✅ That's It!

Your files will now be stored in Cloudinary instead of locally. Everything else works exactly the same!

## Testing

1. Go to any job detail page
2. Click "Add attachment" in the right sidebar
3. Upload a PDF, DOCX, PNG, or PPTX file
4. The file should upload successfully
5. Click the filename to download it
6. The file should be served from Cloudinary (you'll see the URL starts with `https://res.cloudinary.com/`)

## Free Tier Limits

- **25GB storage** - plenty for small projects
- **25GB bandwidth/month** - plenty for small projects
- **No credit card required**
- **No expiration** - free forever (with these limits)

## Troubleshooting

### Error: "Missing required fields"
- Make sure all three environment variables are set in `.env`
- Make sure you restarted your development server after adding them

### Error: "Invalid credentials"
- Double-check your API keys in `.env`
- Make sure there are no extra spaces or quotes
- Try regenerating your API secret in Cloudinary dashboard

### Files not uploading
- Check your browser console for errors
- Check your server logs for errors
- Make sure your file is under 10MB
- Make sure your file type is allowed (PDF, DOCX, PNG, PPTX)

## What Changed

✅ **Updated:** `lib/file-upload.ts` - Now uses Cloudinary instead of local storage
✅ **Updated:** `app/jobs/[id]/actions.ts` - Now deletes from Cloudinary
✅ **Installed:** `cloudinary` package
✅ **No changes needed:** Database, UI, or any other files!

## Next Steps

Once you've added your API keys and restarted your server:
1. Test uploading a file
2. Test downloading a file
3. Test deleting a file
4. Everything should work exactly the same, but files are now in the cloud!

## Need Help?

If you run into any issues:
1. Check the Cloudinary dashboard to see if files are uploading
2. Check your server logs for error messages
3. Make sure your `.env` file has the correct keys
4. Make sure you restarted your development server

You're all set! 🎉

