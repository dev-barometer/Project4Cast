// Example: Cloudinary Implementation
// This is what file-upload.ts would look like if using Cloudinary
// 
// To use this:
// 1. Install: npm install cloudinary
// 2. Add to .env:
//    CLOUDINARY_CLOUD_NAME=your_cloud_name
//    CLOUDINARY_API_KEY=your_api_key
//    CLOUDINARY_API_SECRET=your_api_secret
// 3. Replace lib/file-upload.ts with this file
// 4. Update the import in app/jobs/[id]/actions.ts

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed file types (same as before)
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.pptx'];

export function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.'));
}

export function isValidFileType(filename: string, mimeType: string): boolean {
  const extension = getFileExtension(filename).toLowerCase();
  return (
    ALLOWED_EXTENSIONS.includes(extension) &&
    ALLOWED_MIME_TYPES.includes(mimeType)
  );
}

// Save file to Cloudinary
export async function saveFile(
  file: File,
  jobId?: string,
  taskId?: string
): Promise<{ filename: string; path: string }> {
  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create folder path for organization
  let folder = 'uploads';
  if (jobId) {
    folder = `uploads/jobs/${jobId}`;
    if (taskId) {
      folder = `${folder}/tasks/${taskId}`;
    }
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(
    `data:${file.type};base64,${buffer.toString('base64')}`,
    {
      folder: folder,
      resource_type: 'auto', // Automatically detects file type (image, raw, etc.)
      public_id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      overwrite: false, // Don't overwrite existing files
    }
  );

  return {
    filename: file.name,
    path: result.secure_url, // Cloudinary URL (HTTPS)
  };
}

// Get URL for file (Cloudinary URLs are already full URLs)
export function getFileUrl(filePath: string): string {
  // Cloudinary URLs are already complete URLs, so just return as-is
  return filePath;
}

// Note: Cloudinary handles file deletion automatically when you delete from database
// But if you want to delete from Cloudinary explicitly, you can use:
// await cloudinary.uploader.destroy(publicId);

