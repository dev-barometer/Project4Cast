'use server';

// This file contains Server Actions
// Server Actions are functions that run on the server
// They can be imported and used in both Server and Client Components

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { saveFile, isValidFileType, getFileUrl, extractPublicIdFromUrl } from '@/lib/file-upload';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (same logic as in file-upload.ts)
// Parse CLOUDINARY_URL or use individual variables
let cloudinaryConfigured = false;

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
      cloudinaryConfigured = true;
    }
  } catch (error) {
    console.error('Error parsing CLOUDINARY_URL:', error);
  }
}

if (!cloudinaryConfigured && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
}

// Server action to update a task
export async function updateTask(formData: FormData) {
  const taskId = formData.get('taskId')?.toString();
  const jobId = formData.get('jobId')?.toString();
  const title = formData.get('title')?.toString().trim();
  const status = formData.get('status')?.toString();
  const priority = formData.get('priority')?.toString();
  const dueDate = formData.get('dueDate')?.toString();

  if (!taskId || !jobId) return;

  // Build update object with only the fields that were provided
  const updateData: {
    title?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: Date | null;
  } = {};

  if (title) updateData.title = title;
  if (status && ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'].includes(status)) {
    updateData.status = status as 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  }
  if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
    updateData.priority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }
  if (dueDate !== null && dueDate !== undefined) {
    // Empty string means clear the due date
    updateData.dueDate = dueDate === '' ? null : new Date(dueDate);
  }

  await prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });

  revalidatePath(`/jobs/${jobId}`);
}

// Server action to add an assignee to a task
export async function addAssignee(formData: FormData) {
  const taskId = formData.get('taskId')?.toString();
  const userId = formData.get('userId')?.toString();
  const jobId = formData.get('jobId')?.toString();

  if (!taskId || !userId || !jobId) return;

  // Check if assignee already exists (the unique constraint will prevent duplicates)
  const existing = await prisma.taskAssignee.findFirst({
    where: {
      taskId,
      userId,
    },
  });

  // Only create if it doesn't exist
  if (!existing) {
    await prisma.taskAssignee.create({
      data: {
        taskId,
        userId,
      },
    });
  }

  revalidatePath(`/jobs/${jobId}`);
}

// Server action to remove an assignee from a task
export async function removeAssignee(formData: FormData) {
  const taskId = formData.get('taskId')?.toString();
  const userId = formData.get('userId')?.toString();
  const jobId = formData.get('jobId')?.toString();

  if (!taskId || !userId || !jobId) return;

  await prisma.taskAssignee.deleteMany({
    where: {
      taskId,
      userId,
    },
  });

  revalidatePath(`/jobs/${jobId}`);
}

// Server action to add a collaborator to a job
export async function addCollaborator(formData: FormData) {
  const jobId = formData.get('jobId')?.toString();
  const userId = formData.get('userId')?.toString();
  const role = formData.get('role')?.toString() || 'COLLABORATOR';

  if (!jobId || !userId) return;

  // Validate role
  if (!['OWNER', 'COLLABORATOR', 'VIEWER'].includes(role)) return;

  // Check if collaborator already exists
  const existing = await prisma.jobCollaborator.findFirst({
    where: {
      jobId,
      userId,
    },
  });

  // Only create if it doesn't exist
  if (!existing) {
    await prisma.jobCollaborator.create({
      data: {
        jobId,
        userId,
        role: role as 'OWNER' | 'COLLABORATOR' | 'VIEWER',
      },
    });
  }

  revalidatePath(`/jobs/${jobId}`);
}

// Server action to remove a collaborator from a job
export async function removeCollaborator(formData: FormData) {
  const jobId = formData.get('jobId')?.toString();
  const userId = formData.get('userId')?.toString();

  if (!jobId || !userId) return;

  await prisma.jobCollaborator.deleteMany({
    where: {
      jobId,
      userId,
    },
  });

  revalidatePath(`/jobs/${jobId}`);
}

// Server action to update a collaborator's role
export async function updateCollaboratorRole(formData: FormData) {
  const jobId = formData.get('jobId')?.toString();
  const userId = formData.get('userId')?.toString();
  const role = formData.get('role')?.toString();

  if (!jobId || !userId || !role) return;

  // Validate role
  if (!['OWNER', 'COLLABORATOR', 'VIEWER'].includes(role)) return;

  await prisma.jobCollaborator.updateMany({
    where: {
      jobId,
      userId,
    },
    data: {
      role: role as 'OWNER' | 'COLLABORATOR' | 'VIEWER',
    },
  });

  revalidatePath(`/jobs/${jobId}`);
}

// Server action to add a comment to a task
// When used with useFormState, the signature is (prevState, formData)
export async function addTaskComment(prevState: any, formData: FormData) {
  try {
    const taskId = formData.get('taskId')?.toString();
    const jobId = formData.get('jobId')?.toString();
    const body = formData.get('body')?.toString().trim();
    const authorId = formData.get('authorId')?.toString();

    if (!taskId || !jobId || !body || !authorId) {
      return { error: 'Missing required fields', success: false };
    }

    await prisma.comment.create({
      data: {
        body,
        taskId,
        authorId,
      },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return { error: error.message || 'Failed to add comment', success: false };
  }
}

// Server action to upload an attachment to a job
export async function uploadJobAttachment(prevState: any, formData: FormData) {
  try {
    const jobId = formData.get('jobId')?.toString();
    const uploadedById = formData.get('uploadedById')?.toString();
    const file = formData.get('file') as File | null;

    if (!jobId || !uploadedById || !file) {
      return { error: 'Missing required fields', success: false };
    }

    // Validate file type
    if (!isValidFileType(file.name, file.type)) {
      return {
        error: 'Invalid file type. Allowed: PDF, DOCX, PNG, PPTX',
        success: false,
      };
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { error: 'File size too large. Maximum: 10MB', success: false };
    }

    // Save file to disk
    const { filename, path } = await saveFile(file, jobId);

    // Get file URL
    const url = getFileUrl(path);

    // Save attachment to database
    await prisma.attachment.create({
      data: {
        jobId,
        filename,
        url,
        mimeType: file.type,
        uploadedById,
      },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error uploading attachment:', error);
    return { error: error.message || 'Failed to upload attachment', success: false };
  }
}

// Server action to upload an attachment to a task
export async function uploadTaskAttachment(prevState: any, formData: FormData) {
  try {
    const taskId = formData.get('taskId')?.toString();
    const jobId = formData.get('jobId')?.toString();
    const uploadedById = formData.get('uploadedById')?.toString();
    const file = formData.get('file') as File | null;

    if (!taskId || !jobId || !uploadedById || !file) {
      return { error: 'Missing required fields', success: false };
    }

    // Validate file type
    if (!isValidFileType(file.name, file.type)) {
      return {
        error: 'Invalid file type. Allowed: PDF, DOCX, PNG, PPTX',
        success: false,
      };
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { error: 'File size too large. Maximum: 10MB', success: false };
    }

    // Save file to disk
    const { filename, path } = await saveFile(file, jobId, taskId);

    // Get file URL
    const url = getFileUrl(path);

    // Save attachment to database
    await prisma.attachment.create({
      data: {
        taskId,
        jobId, // Store jobId for easier queries
        filename,
        url,
        mimeType: file.type,
        uploadedById,
      },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error uploading attachment:', error);
    return { error: error.message || 'Failed to upload attachment', success: false };
  }
}

// Server action to delete an attachment
export async function deleteAttachment(formData: FormData) {
  try {
    const attachmentId = formData.get('attachmentId')?.toString();
    const jobId = formData.get('jobId')?.toString();

    if (!attachmentId || !jobId) {
      return;
    }

    // Get attachment to get file path
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return;
    }

    // Delete file from Cloudinary
    try {
      const publicId = extractPublicIdFromUrl(attachment.url);
      if (publicId) {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId, {
          resource_type: 'auto', // Automatically detect resource type
        });
      } else {
        console.warn('Could not extract public_id from URL:', attachment.url);
      }
    } catch (fileError) {
      // File might not exist, that's okay
      console.warn('Error deleting file from Cloudinary:', fileError);
    }

    // Delete attachment from database
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    revalidatePath(`/jobs/${jobId}`);
  } catch (error: any) {
    console.error('Error deleting attachment:', error);
  }
}

