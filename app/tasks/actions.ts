'use server';

// Server Actions for creating standalone tasks (not associated with a job)

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { notifyTaskAssignment } from '@/lib/notifications';
import { sendTaskAssignmentEmail } from '@/lib/email';

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
      // Add assignees if provided
      ...(assigneeIds.length > 0 ? {
        assignees: {
          create: assigneeIds.map(userId => ({ userId })),
        },
      } : {}),
      // Connect to job if jobId is provided
      ...(jobId ? {
        job: {
          connect: { id: jobId },
        },
      } : {}),
    };

    const task = await prisma.task.create({
      data: createData,
    });

    // If task has assignees and is associated with a job, automatically add assignees as collaborators
    if (jobId && assigneeIds.length > 0) {
      // Get existing collaborators for this job
      const existingCollaborators = await prisma.jobCollaborator.findMany({
        where: {
          jobId,
          userId: { in: assigneeIds },
        },
        select: { userId: true },
      });

      const existingUserIds = existingCollaborators.map(c => c.userId);
      const newCollaboratorIds = assigneeIds.filter(id => !existingUserIds.includes(id));

      // Add new collaborators
      if (newCollaboratorIds.length > 0) {
        await prisma.jobCollaborator.createMany({
          data: newCollaboratorIds.map(userId => ({
            jobId,
            userId,
            role: 'COLLABORATOR',
          })),
        });
      }
    }

    // Send notifications to assignees
    if (assigneeIds.length > 0) {
      try {
        const session = await auth();
        const actorId = session?.user?.id;
        const actor = actorId ? await prisma.user.findUnique({ where: { id: actorId } }) : null;

        // Get task and job details
        const createdTask = await prisma.task.findUnique({
          where: { id: task.id },
          include: {
            job: {
              include: {
                brand: {
                  include: {
                    client: true,
                  },
                },
              },
            },
          },
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const taskUrl = jobId ? `${baseUrl}/jobs/${jobId}` : `${baseUrl}/tasks`;

        // Notify each assignee
        for (const assigneeId of assigneeIds) {
          const assignedUser = await prisma.user.findUnique({
            where: { id: assigneeId },
          });

          if (assignedUser && createdTask) {
            // Create in-app notification
            await notifyTaskAssignment({
              userId: assigneeId,
              taskId: task.id,
              taskTitle: createdTask.title,
              jobId: createdTask.jobId,
              jobTitle: createdTask.job?.title || null,
              actorId: actorId || null,
            });

            // Send email notification
            try {
              await sendTaskAssignmentEmail({
                email: assignedUser.email,
                taskTitle: createdTask.title,
                jobTitle: createdTask.job?.title || null,
                assignerName: actor?.name || null,
                assignerEmail: actor?.email || 'System',
                taskUrl,
              });
            } catch (emailError) {
              console.error('Error sending task assignment email:', emailError);
            }
          }
        }
      } catch (notificationError) {
        console.error('Error creating notifications:', notificationError);
      }
    }

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

  // Get current task to check if status is changing to DONE
  const currentTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      job: {
        include: {
          collaborators: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  const wasCompleted = currentTask?.status === 'DONE';
  const isCompleting = status === 'DONE' && !wasCompleted;

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

  // If task was just completed, notify relevant users
  if (isCompleting && currentTask) {
    try {
      const session = await auth();
      const actorId = session?.user?.id;
      const actor = actorId ? await prisma.user.findUnique({ where: { id: actorId } }) : null;

      // Notify job admins and task creator (if we track that)
      // For now, notify all job collaborators who are admins
      if (currentTask.job) {
        const adminCollaborators = currentTask.job.collaborators.filter(
          (c) => c.user.role === 'ADMIN'
        );

        const { notifyTaskCompletion } = await import('@/lib/notifications');
        for (const collaborator of adminCollaborators) {
          if (collaborator.userId !== actorId) {
            // Don't notify the person who completed it
            await notifyTaskCompletion({
              userId: collaborator.userId,
              taskId,
              taskTitle: currentTask.title,
              jobId: currentTask.jobId,
              jobTitle: currentTask.job.title,
              actorId: actorId || null,
            });
          }
        }
      }
    } catch (notificationError) {
      console.error('Error creating task completion notification:', notificationError);
    }
  }

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

  // Get current user (actor)
  const session = await auth();
  const actorId = session?.user?.id;

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

    // If task is associated with a job, automatically add user as collaborator
    if (jobId) {
      const existingCollaborator = await prisma.jobCollaborator.findFirst({
        where: {
          jobId,
          userId,
        },
      });

      if (!existingCollaborator) {
        await prisma.jobCollaborator.create({
          data: {
            jobId,
            userId,
            role: 'COLLABORATOR',
          },
        });
      }
    }

    // Create notification and send email
    try {
      // Get task and job details
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          job: {
            include: {
              brand: {
                include: {
                  client: true,
                },
              },
            },
          },
        },
      });

      const assignedUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      const actor = actorId ? await prisma.user.findUnique({ where: { id: actorId } }) : null;

      if (task && assignedUser) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const taskUrl = jobId ? `${baseUrl}/jobs/${jobId}` : `${baseUrl}/tasks`;

        // Create in-app notification
        await notifyTaskAssignment({
          userId,
          taskId,
          taskTitle: task.title,
          jobId: task.jobId,
          jobTitle: task.job?.title || null,
          actorId: actorId || null,
        });

        // Send email notification
        try {
          await sendTaskAssignmentEmail({
            email: assignedUser.email,
            taskTitle: task.title,
            jobTitle: task.job?.title || null,
            assignerName: actor?.name || null,
            assignerEmail: actor?.email || 'System',
            taskUrl,
          });
        } catch (emailError) {
          // Don't fail the assignment if email fails
          console.error('Error sending task assignment email:', emailError);
        }
      }
    } catch (notificationError) {
      // Don't fail the assignment if notification fails
      console.error('Error creating notification:', notificationError);
    }
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

