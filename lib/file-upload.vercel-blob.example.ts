// Example: Vercel Blob Storage Implementation
// This is what file-upload.ts would look like if using Vercel Blob
// 
// To use this:
// 1. Install: npm install @vercel/blob
// 2. Add to .env: BLOB_READ_WRITE_TOKEN=your_token (get from Vercel dashboard)
// 3. Replace lib/file-upload.ts with this file
// 4. Update the import in app/jobs/[id]/actions.ts

import { put } from '@vercel/blob';

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

// Save file to Vercel Blob
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
  filePath += `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

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

// Get URL for file (Vercel Blob URLs are already full URLs)
export function getFileUrl(filePath: string): string {
  // Vercel Blob URLs are already complete URLs, so just return as-is
  return filePath;
}

// To delete a file from Vercel Blob:
// import { del } from '@vercel/blob';
// await del(fileUrl);

