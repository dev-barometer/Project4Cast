// Utility functions for creating notifications

import { createNotification } from '@/app/notifications/actions';
import { prisma } from '@/lib/prisma';
import { sendCommentMentionEmail } from '@/lib/email';

// Helper to find users by email or name (for @mentions)
export async function findUsersByMention(mentionText: string): Promise<string[]> {
  // Remove @ symbol and trim
  let searchTerm = mentionText.replace('@', '').trim();

  if (!searchTerm) return [];

  // Check if it looks like an email address
  const isEmail = searchTerm.includes('@') && searchTerm.includes('.');
  
  // If it's an email, search for exact match first, then contains
  // If it's not an email, search by name or email contains
  const users = await prisma.user.findMany({
    where: isEmail
      ? {
          OR: [
            { email: { equals: searchTerm, mode: 'insensitive' as const } },
            { email: { contains: searchTerm, mode: 'insensitive' as const } },
          ],
        }
      : {
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' as const } },
            { name: { contains: searchTerm, mode: 'insensitive' as const } },
          ],
        },
    select: { id: true },
  });

  return users.map((u) => u.id);
}

// Parse @mentions from comment text
export function parseMentions(text: string): string[] {
  // Match @mentions - supports:
  // - @username (word characters, dots, hyphens)
  // - @email@domain.com (full email addresses)
  // - @First Last (names with spaces)
  // Matches @ followed by word characters, dots, hyphens, @ (for emails), or spaces
  const mentionRegex = /@([\w.@-]+(?:\s+[\w.@-]+)*)/g;
  const matches = text.match(mentionRegex);
  
  if (!matches) return [];
  
  // Return unique mentions
  return Array.from(new Set(matches));
}

// Create task assignment notification
export async function notifyTaskAssignment({
  userId,
  taskId,
  taskTitle,
  jobId,
  jobTitle,
  actorId,
}: {
  userId: string;
  taskId: string;
  taskTitle: string;
  jobId?: string | null;
  jobTitle?: string | null;
  actorId?: string | null;
}) {
  const jobContext = jobTitle ? ` on ${jobTitle}` : '';
  await createNotification({
    userId,
    type: 'TASK_ASSIGNED',
    title: "You've been assigned to a task",
    message: `${taskTitle}${jobContext}`,
    taskId,
    jobId: jobId || null,
    actorId: actorId || null,
  });
}

// Create job assignment notification
export async function notifyJobAssignment({
  userId,
  jobId,
  jobTitle,
  actorId,
}: {
  userId: string;
  jobId: string;
  jobTitle: string;
  actorId?: string | null;
}) {
  await createNotification({
    userId,
    type: 'JOB_ASSIGNED',
    title: "You've been added to a job",
    message: jobTitle,
    jobId,
    actorId: actorId || null,
  });
}

// Create task completion notification
export async function notifyTaskCompletion({
  userId,
  taskId,
  taskTitle,
  jobId,
  jobTitle,
  actorId,
}: {
  userId: string;
  taskId: string;
  taskTitle: string;
  jobId?: string | null;
  jobTitle?: string | null;
  actorId?: string | null;
}) {
  const jobContext = jobTitle ? ` on ${jobTitle}` : '';
  await createNotification({
    userId,
    type: 'TASK_COMPLETED',
    title: 'Task completed',
    message: `${taskTitle}${jobContext}`,
    taskId,
    jobId: jobId || null,
    actorId: actorId || null,
  });
}

// Create comment mention notification
export async function notifyCommentMention({
  userId,
  commentId,
  taskId,
  taskTitle,
  jobId,
  jobTitle,
  actorId,
  actorName,
  actorEmail,
  taskUrl,
}: {
  userId: string;
  commentId: string;
  taskId?: string | null;
  taskTitle?: string | null;
  jobId?: string | null;
  jobTitle?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  taskUrl?: string | null;
}) {
  // Check user's notification preferences
  const preferences = await prisma.userNotificationPreferences.findUnique({
    where: { userId },
  });

  // Default to true if preferences don't exist (backward compatibility)
  const shouldNotifyInApp = preferences?.commentMentionInApp !== false;
  const shouldNotifyEmail = preferences?.commentMentionEmail !== false;

  // Get the mentioned user's email
  const mentionedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!mentionedUser) {
    return; // User doesn't exist
  }

  // Create in-app notification if enabled
  if (shouldNotifyInApp) {
    const context = taskTitle || jobTitle || 'a task';
    const actor = actorName || 'Someone';
    await createNotification({
      userId,
      type: 'COMMENT_MENTION',
      title: `${actor} mentioned you in a comment`,
      message: context,
      taskId: taskId || null,
      jobId: jobId || null,
      commentId,
      actorId: actorId || null,
    });
  }

  // Send email notification if enabled
  if (shouldNotifyEmail && taskUrl) {
    try {
      await sendCommentMentionEmail({
        email: mentionedUser.email,
        taskTitle: taskTitle || null,
        jobTitle: jobTitle || null,
        commenterName: actorName || null,
        commenterEmail: actorEmail || 'System',
        taskUrl,
      });
    } catch (emailError) {
      // Don't fail the notification if email fails
      console.error('Error sending comment mention email:', emailError);
    }
  }
}











