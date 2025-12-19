// Utility functions for file uploads
// Using Vercel Blob Storage for cloud storage

import { put, del } from '@vercel/blob';

// Allowed file types (MIME types)
export const ALLOWED_MIME_TYPES = [
  'application/pdf', // PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'image/png', // PNG
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
];

// Allowed file extensions
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.pptx'];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

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

// Save file to Vercel Blob Storage
export async function saveFile(
  file: File,
  jobId?: string,
  taskId?: string
): Promise<{ filename: string; path: string }> {
  // Convert file to blob
  const bytes = await file.arrayBuffer();
  const blob = new Blob([bytes], { type: file.type });

  // Create file path for organization
  let filePath = 'uploads/';
  if (jobId) {
    filePath = `uploads/jobs/${jobId}/`;
    if (taskId) {
      filePath = `${filePath}tasks/${taskId}/`;
    }
  }
  
  // Generate unique filename (timestamp + original filename, sanitized)
  const timestamp = Date.now();
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  filePath += `${timestamp}-${sanitizedFilename}`;

  // Upload to Vercel Blob
  const result = await put(filePath, blob, {
    access: 'public', // Make file publicly accessible
    contentType: file.type,
  });

  return {
    filename: file.name,
    path: result.url, // Vercel Blob URL
  };
}

// Get URL for file (Vercel Blob URLs are already full URLs and public)
// Re-export from file-url-utils for backward compatibility
export { getFileUrl } from './file-url-utils';

// Extract blob URL for deletion (Vercel Blob uses the full URL)
export function extractPublicIdFromUrl(url: string): string | null {
  // For Vercel Blob, we can use the full URL directly for deletion
  // But we need to extract just the path part
  try {
    // Vercel Blob URLs look like: https://[hash].public.blob.vercel-storage.com/[path]
    // We can use the full URL for deletion, but for compatibility, return the path
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  } catch (error) {
    console.error('Error extracting path from Vercel Blob URL:', error);
    return null;
  }
}

// Delete file from Vercel Blob
export async function deleteFile(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error('Error deleting file from Vercel Blob:', error);
    return false;
  }
}
