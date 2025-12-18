# Vercel Blob Storage Setup

## ✅ Code is Already Updated!

The code has been switched from Cloudinary to Vercel Blob Storage. Now you just need to:

1. **Get your Vercel Blob token**
2. **Add it to your `.env` file**

## Step 1: Get Your Vercel Blob Token

### If You're Using Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project (or create one)
3. Go to **Settings** → **Storage** → **Blob**
4. Create a new Blob store (if you don't have one)
5. Copy the **BLOB_READ_WRITE_TOKEN**

### If You're NOT Using Vercel:

You can still use Vercel Blob! Just sign up for a free Vercel account and create a project.

## Step 2: Add Token to `.env` File

Open your `.env` file and add:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:**
- No quotes around the token
- No spaces before or after the `=`
- The token starts with `vercel_blob_rw_`

## Step 3: Restart Your Development Server

1. Stop your server (Ctrl+C or Cmd+C)
2. Start it again: `npm run dev`
3. Try uploading a file!

## ✅ That's It!

Your files will now be stored in Vercel Blob instead of Cloudinary. Everything else works exactly the same!

## Benefits of Vercel Blob

- ✅ **Simpler** - No access mode issues, files are always public
- ✅ **Better Integration** - Designed specifically for Next.js
- ✅ **Free Tier** - 100GB storage, 1TB bandwidth/month (more generous than Cloudinary)
- ✅ **No Configuration** - Just add the token and it works
- ✅ **Reliable** - Files are always accessible, no 401 errors

## Testing

1. Go to any job detail page
2. Click "Add attachment" or add a comment with attachment
3. Upload a PDF, DOCX, PNG, or PPTX file
4. The file should upload successfully
5. Click the filename - it should download with the correct extension!

## Free Tier Limits

- **100GB storage** - plenty for small projects
- **1TB bandwidth/month** - very generous
- **No credit card required**

## Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN is not defined"
- Make sure you added `BLOB_READ_WRITE_TOKEN` to your `.env` file
- Make sure you restarted your server after adding it

### Files not uploading
- Check your browser console for errors
- Check your server logs for errors
- Make sure your file is under 10MB
- Make sure your file type is allowed (PDF, DOCX, PNG, PPTX)

## Migration from Cloudinary

Old Cloudinary URLs will still work (they're handled for backward compatibility), but all new uploads will use Vercel Blob.
