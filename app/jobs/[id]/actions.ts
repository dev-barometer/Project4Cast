'use server';

// This file contains Server Actions
// Server Actions are functions that run on the server
// They can be imported and used in both Server and Client Components

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { saveFile, isValidFileType, getFileUrl, deleteFile } from '@/lib/file-upload';
import { auth } from '@/auth';
import { notifyJobAssignment, notifyTaskAssignment } from '@/lib/notifications';
import { sendJobAssignmentEmail, sendTaskAssignmentEmail } from '@/lib/email';
import { parseMentions, findUsersByMention, notifyCommentMention } from '@/lib/notifications';

// Server action to update a task
export async function updateTask(formData: FormData) {
  const taskId = formData.get('taskId')?.toString();
  const jobId = formData.get('jobId')?.toString();
  const title = formData.get('title')?.toString().trim();
  const description = formData.get('description')?.toString();
  const status = formData.get('status')?.toString();
  const priority = formData.get('priority')?.toString();
  const dueDate = formData.get('dueDate')?.toString();

  if (!taskId || !jobId) return;

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
    description?: string | null;
    status?: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: Date | null;
  } = {};

  if (title) updateData.title = title;
  if (description !== undefined) {
    // Allow empty string to clear description
    updateData.description = description === '' ? null : description;
  }
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

  // If task was just completed, mark all related notifications as read for the current user
  if (isCompleting) {
    try {
      const session = await auth();
      const currentUserId = session?.user?.id;
      
      if (currentUserId) {
        // Mark all unread notifications for this task as read for the current user
        await prisma.notification.updateMany({
          where: {
            taskId: taskId,
            userId: currentUserId,
            read: false,
          },
          data: {
            read: true,
          },
        });
      }
    } catch (error) {
      console.error('Error marking task notifications as read:', error);
    }
  }

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
          (c) => c.user.role === 'ADMIN' || c.user.role === 'OWNER'
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

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath('/notifications');
  revalidatePath('/'); // Update header notification badge
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

    // Automatically add user as collaborator if they're not already one
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

  // Get current user (actor)
  const session = await auth();
  const actorId = session?.user?.id;

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

    // Create notification and send email
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      const assignedUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      const actor = actorId ? await prisma.user.findUnique({ where: { id: actorId } }) : null;

      if (job && assignedUser) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const jobUrl = `${baseUrl}/jobs/${jobId}`;

        // Create in-app notification
        await notifyJobAssignment({
          userId,
          jobId,
          jobTitle: job.title,
          actorId: actorId || null,
        });

        // Send email notification
        try {
          await sendJobAssignmentEmail({
            email: assignedUser.email,
            jobTitle: job.title,
            jobNumber: job.jobNumber,
            assignerName: actor?.name || null,
            assignerEmail: actor?.email || 'System',
            jobUrl,
          });
        } catch (emailError) {
          console.error('Error sending job assignment email:', emailError);
        }
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
  }

  revalidatePath(`/jobs/${jobId}`);
}

// Server action to invite a collaborator via email for a specific job
export async function inviteCollaboratorByEmail(prevState: any, formData: FormData) {
  'use server';

  const jobId = formData.get('jobId')?.toString();
  const email = formData.get('email')?.toString().trim().toLowerCase();

  if (!jobId || !email) {
    return { success: false, error: 'Job ID and email are required' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address' };
  }

  // Get current user
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in to send invitations' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Check if user has permission to add collaborators to this job
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      collaborators: true,
    },
  });

  if (!job) {
    return { success: false, error: 'Job not found' };
  }

  const isOwner = job.collaborators.some(
    (c) => c.userId === session.user.id && c.role === 'OWNER'
  );
  const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER';

  if (!isOwner && !isAdmin) {
    return { success: false, error: 'You do not have permission to invite collaborators to this job' };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // User exists - check if they're already a collaborator
      const existingCollaborator = await prisma.jobCollaborator.findFirst({
        where: {
          jobId,
          userId: existingUser.id,
        },
      });

      if (existingCollaborator) {
        return { success: false, error: 'This user is already a collaborator on this job' };
      }

      // Add them as a collaborator directly
      await prisma.jobCollaborator.create({
        data: {
          jobId,
          userId: existingUser.id,
          role: 'COLLABORATOR',
        },
      });

      revalidatePath(`/jobs/${jobId}`);
      return { success: true, error: null };
    }

    // Check if there's a pending invitation for this email and job
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        jobId,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return { success: false, error: 'A pending invitation already exists for this email' };
    }

    // Import invitation functions
    const { randomBytes } = await import('crypto');
    const { sendInvitationEmail } = await import('@/lib/email');

    // Generate invitation token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation linked to this job
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role: 'USER', // Default role for job invitations
        invitedById: user.id,
        jobId, // Link to the job
        expiresAt,
      },
    });

    // Send invitation email
    try {
      await sendInvitationEmail({
        email,
        invitationToken: token,
        inviterName: user.name,
        inviterEmail: user.email,
      });
    } catch (emailError: any) {
      // If email fails, delete the invitation and return error
      await prisma.invitation.delete({
        where: { id: invitation.id },
      });
      console.error('Error sending invitation email:', emailError);
      return {
        success: false,
        error: `Failed to send invitation email: ${emailError.message || 'Unknown error'}. Please check your email configuration.`,
      };
    }

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error inviting collaborator:', error);
    return { success: false, error: error.message || 'Failed to send invitation' };
  }
}

// Server action to remove a collaborator from a job
export async function removeCollaborator(formData: FormData) {
  const jobId = formData.get('jobId')?.toString();
  const userId = formData.get('userId')?.toString();

  if (!jobId || !userId) return;

  // Remove collaborator and all their task assignments for this job in a transaction
  await prisma.$transaction([
    // Remove all task assignments for this user on tasks in this job
    prisma.taskAssignee.deleteMany({
      where: {
        userId,
        task: {
          jobId,
        },
      },
    }),
    // Remove the collaborator
    prisma.jobCollaborator.deleteMany({
      where: {
        jobId,
        userId,
      },
    }),
  ]);

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath('/tasks');
  revalidatePath('/my-tasks');
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

// Server action to add a new task
// When used with useFormState, the signature is (prevState, formData)
export async function addTask(prevState: any, formData: FormData) {
  const title = formData.get('title')?.toString().trim();
  const jobId = formData.get('jobId')?.toString();
  const priority = formData.get('priority')?.toString() || 'MEDIUM';
  const dueDate = formData.get('dueDate')?.toString();
  const assigneeIds = formData.getAll('assigneeIds').map(id => id.toString()).filter(Boolean);
  const taskIdempotencyKey = formData.get('idempotencyKey')?.toString(); // Optional idempotency key

  if (!title) {
    return { success: false, error: 'Task title is required' };
  }

  if (!jobId) {
    return { success: false, error: 'Job ID is required' };
  }

  try {
    // Validate priority
    const validPriority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority) 
      ? priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      : 'MEDIUM';

    // Check for duplicate task (same title, job, and created within last 5 seconds)
    // This helps prevent accidental double-submissions
    if (taskIdempotencyKey) {
      // Check for duplicate task (same title and jobId)
      // Note: createdAt field is not available in Task model, so we can't filter by time
      const recentDuplicate = await prisma.task.findFirst({
        where: {
          jobId,
          title,
        },
      });

      if (recentDuplicate) {
        // Task was just created, return success without creating duplicate
        revalidatePath(`/jobs/${jobId}`);
        return { success: true, error: null };
      }
    }

    // Create task with optional jobId and assignees if provided
    const task = await prisma.task.create({
      data: {
        title,
        jobId: jobId || null,
        status: 'TODO',
        priority: validPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignees: assigneeIds.length > 0 ? {
          create: assigneeIds.map(userId => ({ userId })),
        } : undefined,
      },
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

    // Revalidate job page if jobId exists, otherwise revalidate task pages
    // This must be OUTSIDE the assignee notification block so it always runs
    if (jobId) {
      revalidatePath(`/jobs/${jobId}`);
    } else {
      revalidatePath('/tasks');
      revalidatePath('/my-tasks');
    }
    revalidatePath('/');
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return { success: false, error: error.message || 'Failed to create task' };
  }
}

// Server action to add a comment to a task
// When used with useFormState, the signature is (prevState, formData)
export async function addTaskComment(prevState: any, formData: FormData) {
  try {
    const taskId = formData.get('taskId')?.toString();
    const jobId = formData.get('jobId')?.toString();
    const body = formData.get('body')?.toString().trim();
    const authorId = formData.get('authorId')?.toString();

    if (!taskId || !body || !authorId) {
      return { error: 'Missing required fields', success: false };
    }
    // jobId is optional (for standalone tasks)

    const comment = await prisma.comment.create({
      data: {
        body,
        taskId,
        authorId,
      },
    });

    // Handle file uploads if any
    const files = formData.getAll('files') as File[];
    if (files.length > 0 && files[0].size > 0) {
      for (const file of files) {
        if (file.size === 0) continue; // Skip empty files

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

        // Save attachment to database (linked to task, will be matched to comment by timestamp)
        await prisma.attachment.create({
          data: {
            taskId,
            jobId,
            filename,
            url,
            mimeType: file.type,
            uploadedById: authorId,
          },
        });
      }
    }

    // Parse @mentions and send notifications
    try {
      const mentions = parseMentions(body);
      console.log('[addTaskComment] Comment body:', body);
      console.log('[addTaskComment] Parsed mentions:', mentions);
      
      if (mentions.length > 0) {
        const author = await prisma.user.findUnique({
          where: { id: authorId },
        });

        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            job: true,
          },
        });

        // Find users mentioned
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const taskUrl = jobId ? `${baseUrl}/jobs/${jobId}` : `${baseUrl}/tasks`;
        
        for (const mention of mentions) {
          console.log('[addTaskComment] Processing mention:', mention);
          const userIds = await findUsersByMention(mention);
          console.log('[addTaskComment] Found user IDs for mention:', userIds);
          
          for (const mentionedUserId of userIds) {
            // Don't notify the author
            if (mentionedUserId !== authorId) {
              console.log('[addTaskComment] Creating notification for user:', mentionedUserId);
              await notifyCommentMention({
                userId: mentionedUserId,
                commentId: comment.id,
                taskId: task?.id || null,
                taskTitle: task?.title || null,
                jobId: task?.jobId || null,
                jobTitle: task?.job?.title || null,
                actorId: authorId,
                actorName: author?.name || null,
                actorEmail: author?.email || null,
                taskUrl,
              });
              console.log('[addTaskComment] Notification created successfully');
            } else {
              console.log('[addTaskComment] Skipping notification - user is the author');
            }
          }
        }
      } else {
        console.log('[addTaskComment] No mentions found in comment');
      }
    } catch (mentionError: any) {
      console.error('[addTaskComment] Error processing mentions:', mentionError);
      console.error('[addTaskComment] Error stack:', mentionError instanceof Error ? mentionError.stack : 'No stack trace');
      console.error('[addTaskComment] Error details:', {
        message: mentionError.message,
        code: mentionError.code,
        meta: mentionError.meta,
      });
      // Don't fail the comment creation if mention processing fails
      // But log it so we can debug
    }

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return { error: error.message || 'Failed to add comment', success: false };
  }
}

// Server action to edit a comment
export async function editTaskComment(prevState: any, formData: FormData) {
  'use server';
  
  try {
    const commentId = formData.get('commentId')?.toString();
    const body = formData.get('body')?.toString().trim();
    const currentUserId = formData.get('currentUserId')?.toString();
    const jobId = formData.get('jobId')?.toString();

    if (!commentId || !body || !currentUserId) {
      return { error: 'Missing required fields', success: false };
    }

    // Verify the comment exists and the user is the author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: true },
    });

    if (!comment) {
      return { error: 'Comment not found', success: false };
    }

    if (comment.authorId !== currentUserId) {
      return { error: 'You can only edit your own comments', success: false };
    }

    // Update the comment
    await prisma.comment.update({
      where: { id: commentId },
      data: { body },
    });

    const finalJobId = jobId || comment.task?.jobId;
    if (finalJobId) {
      revalidatePath(`/jobs/${finalJobId}`);
    }
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error editing comment:', error);
    return { error: error.message || 'Failed to edit comment', success: false };
  }
}

// Server action to delete a comment
export async function deleteTaskComment(prevState: any, formData: FormData) {
  'use server';
  
  try {
    const commentId = formData.get('commentId')?.toString();
    const currentUserId = formData.get('currentUserId')?.toString();
    const jobId = formData.get('jobId')?.toString();

    if (!commentId || !currentUserId) {
      return { error: 'Missing required fields', success: false };
    }

    // Verify the comment exists and the user is the author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: true },
    });

    if (!comment) {
      return { error: 'Comment not found', success: false };
    }

    if (comment.authorId !== currentUserId) {
      return { error: 'You can only delete your own comments', success: false };
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    const finalJobId = jobId || comment.task?.jobId;
    if (finalJobId) {
      revalidatePath(`/jobs/${finalJobId}`);
    }
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return { error: error.message || 'Failed to delete comment', success: false };
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

    // Delete file from Vercel Blob
    try {
      await deleteFile(attachment.url);
    } catch (fileError) {
      // File might not exist, that's okay
      console.warn('Error deleting file from Vercel Blob:', fileError);
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

// Server action to update job brief
export async function updateJobBrief(formData: FormData) {
  const jobId = formData.get('jobId')?.toString();
  const brief = formData.get('brief')?.toString().trim() || null;

  if (!jobId) {
    return { success: false, error: 'Job ID is required' };
  }

  // Check if user is authenticated
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in' };
  }

  // Check if user has access to this job (must be a collaborator or admin/owner)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

  if (!isAdmin) {
    // Check if user is a collaborator (any role except VIEWER can edit)
    const collaborator = await prisma.jobCollaborator.findFirst({
      where: {
        jobId,
        userId: session.user.id,
        role: { not: 'VIEWER' }, // VIEWER role cannot edit
      },
    });

    if (!collaborator) {
      return { success: false, error: 'You do not have permission to edit this job' };
    }
  }

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { brief },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating job brief:', error);
    return { success: false, error: error.message || 'Failed to update brief' };
  }
}

// Server action to update job number and title
export async function updateJobNumberAndTitle(formData: FormData) {
  const jobId = formData.get('jobId')?.toString();
  const jobNumber = formData.get('jobNumber')?.toString().trim();
  const title = formData.get('title')?.toString().trim();

  if (!jobId) {
    return { success: false, error: 'Job ID is required' };
  }

  if (!jobNumber || !title) {
    return { success: false, error: 'Job number and title are required' };
  }

  // Validate job number format: XXX-000 (3 uppercase letters, hyphen, 3 numbers)
  const jobNumberPattern = /^[A-Z]{3}-[0-9]{3}$/;
  if (!jobNumberPattern.test(jobNumber)) {
    return { success: false, error: 'Job number must be in format XXX-000 (3 uppercase letters, hyphen, 3 numbers)' };
  }

  // Check if user is authenticated
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in' };
  }

  // Check if user has access to this job (must be a collaborator or admin/owner)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

  if (!isAdmin) {
    // Check if user is a collaborator (any role except VIEWER can edit)
    const collaborator = await prisma.jobCollaborator.findFirst({
      where: {
        jobId,
        userId: session.user.id,
        role: { not: 'VIEWER' }, // VIEWER role cannot edit
      },
    });

    if (!collaborator) {
      return { success: false, error: 'You do not have permission to edit this job' };
    }
  }

  // Check if job number already exists (for a different job)
  const existingJob = await prisma.job.findUnique({
    where: { jobNumber },
  });

  if (existingJob && existingJob.id !== jobId) {
    return { success: false, error: 'Job number already exists' };
  }

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { jobNumber, title },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating job number and title:', error);
    return { success: false, error: error.message || 'Failed to update job' };
  }
}

// Server action to update job resources URL
export async function updateJobResources(formData: FormData) {
  const jobId = formData.get('jobId')?.toString();
  const resourcesUrl = formData.get('resourcesUrl')?.toString().trim() || null;

  if (!jobId) {
    return { success: false, error: 'Job ID is required' };
  }

  // Check if user is authenticated
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in' };
  }

  // Check if user has access to this job (must be a collaborator or admin/owner)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

  if (!isAdmin) {
    // Check if user is a collaborator (any role except VIEWER can edit)
    const collaborator = await prisma.jobCollaborator.findFirst({
      where: {
        jobId,
        userId: session.user.id,
        role: { not: 'VIEWER' }, // VIEWER role cannot edit
      },
    });

    if (!collaborator) {
      return { success: false, error: 'You do not have permission to edit this job' };
    }
  }

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { resourcesUrl },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating job resources URL:', error);
    return { success: false, error: error.message || 'Failed to update resources link' };
  }
}

// Server action to move a task to another job
export async function moveTask(formData: FormData) {
  const taskId = formData.get('taskId')?.toString();
  const newJobId = formData.get('newJobId')?.toString();
  const currentJobId = formData.get('currentJobId')?.toString();

  if (!taskId || !newJobId || !currentJobId) {
    return { success: false, error: 'Task ID, new job ID, and current job ID are required' };
  }

  // Check if user is authenticated
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in' };
  }

  // Check if user has permission to edit both jobs
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

  // Check permissions for current job
  if (!isAdmin) {
    const currentJobCollaborator = await prisma.jobCollaborator.findFirst({
      where: {
        jobId: currentJobId,
        userId: session.user.id,
        role: { not: 'VIEWER' },
      },
    });
    if (!currentJobCollaborator) {
      return { success: false, error: 'You do not have permission to move tasks from this job' };
    }
  }

  // Check permissions for new job
  if (!isAdmin) {
    const newJobCollaborator = await prisma.jobCollaborator.findFirst({
      where: {
        jobId: newJobId,
        userId: session.user.id,
        role: { not: 'VIEWER' },
      },
    });
    if (!newJobCollaborator) {
      return { success: false, error: 'You do not have permission to move tasks to this job' };
    }
  }

  try {
    // Move the task to the new job
    await prisma.task.update({
      where: { id: taskId },
      data: { jobId: newJobId },
    });

    // Automatically add task assignees as collaborators to the new job
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignees: true },
    });

    if (task && task.assignees.length > 0) {
      const assigneeUserIds = task.assignees.map(a => a.userId);
      
      // Get existing collaborators for the new job
      const existingCollaborators = await prisma.jobCollaborator.findMany({
        where: {
          jobId: newJobId,
          userId: { in: assigneeUserIds },
        },
        select: { userId: true },
      });

      const existingUserIds = existingCollaborators.map(c => c.userId);
      const newCollaboratorIds = assigneeUserIds.filter(id => !existingUserIds.includes(id));

      // Add new collaborators
      if (newCollaboratorIds.length > 0) {
        await prisma.jobCollaborator.createMany({
          data: newCollaboratorIds.map(userId => ({
            jobId: newJobId,
            userId,
            role: 'COLLABORATOR',
          })),
        });
      }
    }

    revalidatePath(`/jobs/${currentJobId}`);
    revalidatePath(`/jobs/${newJobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error moving task:', error);
    return { success: false, error: error.message || 'Failed to move task' };
  }
}

// Server action to delete (soft delete) a task
export async function deleteTask(formData: FormData) {
  const taskId = formData.get('taskId')?.toString();
  const jobId = formData.get('jobId')?.toString();

  if (!taskId || !jobId) {
    return { success: false, error: 'Task ID and job ID are required' };
  }

  // Check if user is authenticated
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in' };
  }

  // Check if user has permission to edit this job
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

  if (!isAdmin) {
    const collaborator = await prisma.jobCollaborator.findFirst({
      where: {
        jobId,
        userId: session.user.id,
        role: { not: 'VIEWER' },
      },
    });
    if (!collaborator) {
      return { success: false, error: 'You do not have permission to delete tasks from this job' };
    }
  }

  try {
    // Temporarily hard delete until migration adds deletedAt column
    // Once migration runs, change this back to soft delete:
    // data: { deletedAt: new Date() }
    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message || 'Failed to delete task' };
  }
}


