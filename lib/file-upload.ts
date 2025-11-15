// Utility functions for file uploads
// Using Cloudinary for cloud storage

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// Parse CLOUDINARY_URL or use individual variables
let cloudinaryConfigured = false;

if (process.env.CLOUDINARY_URL) {
  // Parse CLOUDINARY_URL format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  try {
    const url = process.env.CLOUDINARY_URL.trim();
    // Match format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, apiKey, apiSecret, cloudName] = match;
      cloudinary.config({
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
      });
      cloudinaryConfigured = true;
    } else {
      console.error('Invalid CLOUDINARY_URL format. Expected: cloudinary://API_KEY:API_SECRET@CLOUD_NAME');
      console.error('Got:', url.replace(/:([^:@]+)@/, ':*****@')); // Hide secret in logs
    }
  } catch (error) {
    console.error('Error parsing CLOUDINARY_URL:', error);
  }
}

if (!cloudinaryConfigured) {
  // Try individual variables as fallback
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
      api_key: process.env.CLOUDINARY_API_KEY.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    });
    cloudinaryConfigured = true;
  } else {
    console.error('Cloudinary not configured. Please set CLOUDINARY_URL or individual variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
  }
}

// Allowed file types (MIME types)
export const ALLOWED_MIME_TYPES = [
  'application/pdf', // PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'image/png', // PNG
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
];

// Allowed file extensions
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.pptx'];

// Get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.'));
}

// Validate file type
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

  // Generate unique filename (timestamp + original filename, sanitized)
  const timestamp = Date.now();
  const originalFilename = file.name;
  const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
  // Remove file extension for public_id (Cloudinary will add it back)
  const filenameWithoutExt = sanitizedFilename.replace(/\.[^/.]+$/, '');
  const publicId = `${timestamp}-${filenameWithoutExt}`;

  // Upload to Cloudinary
  // Convert buffer to base64 data URI for upload
  const base64Data = buffer.toString('base64');
  const dataUri = `data:${file.type};base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: folder,
    resource_type: 'auto', // Automatically detects file type (image, raw, etc.)
    public_id: publicId,
    overwrite: false, // Don't overwrite existing files
  });

  return {
    filename: originalFilename,
    path: result.secure_url, // Cloudinary URL (HTTPS)
  };
}

// Get URL for file (Cloudinary URLs are already full URLs)
export function getFileUrl(filePath: string): string {
  // Cloudinary URLs are already complete URLs, so just return as-is
  return filePath;
}

// Extract public_id from Cloudinary URL for deletion
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URLs look like:
    // https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{folder}/{public_id}.{format}
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/uploads/jobs/123/1234567890-filename.pdf
    
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) {
      return null;
    }
    
    // Get the part after /upload/
    let afterUpload = urlParts[1];
    
    // Remove version prefix (v1234567890/)
    afterUpload = afterUpload.replace(/^v\d+\//, '');
    
    // Remove file extension (everything after the last dot)
    afterUpload = afterUpload.replace(/\.[^/.]+$/, '');
    
    // The result is the full public_id including folder
    return afterUpload;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
}

