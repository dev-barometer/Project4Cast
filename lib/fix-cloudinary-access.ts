// Utility to fix Cloudinary file access mode
// Run this to make existing files publicly accessible

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (same as file-upload.ts)
if (process.env.CLOUDINARY_URL) {
  try {
    const url = process.env.CLOUDINARY_URL.trim();
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, apiKey, apiSecret, cloudName] = match;
      cloudinary.config({
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
      });
    }
  } catch (error) {
    console.error('Error parsing CLOUDINARY_URL:', error);
  }
}

// Extract public_id from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) {
      return null;
    }
    
    let afterUpload = urlParts[1];
    // Remove version prefix (v1234567890/)
    afterUpload = afterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    afterUpload = afterUpload.replace(/\.[^/.]+$/, '');
    
    return afterUpload;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
}

// Make a file publicly accessible
export async function makeFilePublic(cloudinaryUrl: string): Promise<boolean> {
  try {
    const publicId = extractPublicIdFromUrl(cloudinaryUrl);
    if (!publicId) {
      console.error('Could not extract public_id from URL:', cloudinaryUrl);
      return false;
    }

    // Determine resource type from URL
    const resourceType = cloudinaryUrl.includes('/raw/upload/') ? 'raw' : 'image';

    // Update the file to be public
    await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      resource_type: resourceType,
      access_mode: 'public',
    });

    console.log(`Successfully made file public: ${publicId}`);
    return true;
  } catch (error: any) {
    console.error('Error making file public:', error);
    return false;
  }
}
