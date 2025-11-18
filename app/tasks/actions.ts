'use server';

// Server Actions for creating standalone tasks (not associated with a job)

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

// Server action to create a standalone task (no job required)
// When used with useFormState, the signature is (prevState, formData)
export async function createStandaloneTask(prevState: any, formData: FormData) {
  'use server';

  const title = formData.get('title')?.toString().trim();
  const priority = formData.get('priority')?.toString() || 'MEDIUM';
  const dueDate = formData.get('dueDate')?.toString();
  const assigneeIds = formData.getAll('assigneeIds').map(id => id.toString()).filter(Boolean);
  const jobId = formData.get('jobId')?.toString() || null; // Optional - null if not provided

  if (!title) return { success: false, error: 'Task title is required' };

  // Validate priority
  const validPriority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority) 
    ? priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    : 'MEDIUM';

  try {
    // Create task with optional jobId and assignees if provided
    // Use Prisma's generated type for type safety
    const createData: Prisma.TaskCreateInput = {
      title,
      status: 'TODO',
      priority: validPriority,
      dueDate: dueDate ? new Date(dueDate) : null,
      // Set jobId directly (can be null for standalone tasks)
      jobId: jobId || null,
      // Add assignees if provided
      ...(assigneeIds.length > 0 ? {
        assignees: {
          create: assigneeIds.map(userId => ({ userId })),
        },
      } : {}),
    };

    const task = await prisma.task.create({
      data: createData,
    });

    // Revalidate both task pages
    revalidatePath('/tasks');
    revalidatePath('/my-tasks');
    if (jobId) {
      revalidatePath(`/jobs/${jobId}`);
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return { success: false, error: error.message || 'Failed to create task' };
  }
}

// Server action to update a task (handles optional jobId for standalone tasks)
export async function updateTask(formData: FormData) {
  'use server';

  const taskId = formData.get('taskId')?.toString();
  const jobId = formData.get('jobId')?.toString() || null; // Optional for standalone tasks
  const title = formData.get('title')?.toString().trim();
  const status = formData.get('status')?.toString();
  const priority = formData.get('priority')?.toString();
  const dueDate = formData.get('dueDate')?.toString();

  if (!taskId) return;

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

  // Revalidate appropriate paths
  if (jobId) {
    revalidatePath(`/jobs/${jobId}`);
  }
  revalidatePath('/tasks');
  revalidatePath('/my-tasks');
}

// Server action to add an assignee to a task (handles optional jobId)
export async function addAssignee(formData: FormData) {
  'use server';

  const taskId = formData.get('taskId')?.toString();
  const userId = formData.get('userId')?.toString();
  const jobId = formData.get('jobId')?.toString() || null; // Optional for standalone tasks

  if (!taskId || !userId) return;

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

  // Revalidate appropriate paths
  if (jobId) {
    revalidatePath(`/jobs/${jobId}`);
  }
  revalidatePath('/tasks');
  revalidatePath('/my-tasks');
}

// Server action to remove an assignee from a task (handles optional jobId)
export async function removeAssignee(formData: FormData) {
  'use server';

  const taskId = formData.get('taskId')?.toString();
  const userId = formData.get('userId')?.toString();
  const jobId = formData.get('jobId')?.toString() || null; // Optional for standalone tasks

  if (!taskId || !userId) return;

  await prisma.taskAssignee.deleteMany({
    where: {
      taskId,
      userId,
    },
  });

  // Revalidate appropriate paths
  if (jobId) {
    revalidatePath(`/jobs/${jobId}`);
  }
  revalidatePath('/tasks');
  revalidatePath('/my-tasks');
}

