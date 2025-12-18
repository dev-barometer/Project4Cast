// Pure utility functions for file URLs
// This can be safely imported in client components

// Get URL for file (Vercel Blob URLs are already full URLs and public)
// For backward compatibility, also handle old Cloudinary URLs
export function getFileUrl(filePath: string): string {
  // Vercel Blob URLs are already complete and public, return as-is
  // Also handle old Cloudinary URLs for backward compatibility
  if (filePath.includes('blob.vercel-storage.com')) {
    // Vercel Blob URL - return as-is
    return filePath;
  }
  
  // Handle old Cloudinary URLs (for files uploaded before the switch)
  if (filePath.includes('cloudinary.com')) {
    // Fix URLs that were incorrectly uploaded as images when they should be raw files
    if (filePath.includes('/image/upload/')) {
      const isDocument = /\.(pdf|docx|pptx)$/i.test(filePath);
      if (isDocument) {
        filePath = filePath.replace('/image/upload/', '/raw/upload/');
      }
    }
    // Remove invalid transformations
    if (filePath.includes('/raw/upload/fl_inline/')) {
      filePath = filePath.replace('/raw/upload/fl_inline/', '/raw/upload/');
    }
  }
  
  return filePath;
}
