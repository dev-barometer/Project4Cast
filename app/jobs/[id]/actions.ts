'use server';

// This file contains Server Actions
// Server Actions are functions that run on the server
// They can be imported and used in both Server and Client Components

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

