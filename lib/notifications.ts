// Utility functions for creating notifications

import { createNotification } from '@/app/notifications/actions';
import { prisma } from '@/lib/prisma';
import { sendCommentMentionEmail } from '@/lib/email';

// Helper to find users by email or name (for @mentions)
export async function findUsersByMention(mentionText: string): Promise<string[]> {
  // Remove @ symbol and trim
  let searchTerm = mentionText.replace('@', '').trim();

  console.log('[findUsersByMention] Searching for mention:', mentionText, '-> searchTerm:', searchTerm);

  if (!searchTerm) {
    console.log('[findUsersByMention] Empty search term, returning empty array');
    return [];
  }

  // Check if it looks like an email address
  const isEmail = searchTerm.includes('@') && searchTerm.includes('.');
  
  console.log('[findUsersByMention] Is email?', isEmail);
  
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
            // Also try exact name match (case-insensitive)
            { name: { equals: searchTerm, mode: 'insensitive' as const } },
          ],
        },
    select: { id: true, name: true, email: true },
  });

  console.log('[findUsersByMention] Found users:', users.map(u => ({ id: u.id, name: u.name, email: u.email })));

  return users.map((u) => u.id);
}

// Parse @mentions from comment text
export function parseMentions(text: string): string[] {
  // Match @mentions - supports:
  // - @username (word characters, dots, hyphens)
  // - @email@domain.com (full email addresses)
  // - @First Last (names with spaces, but stops at punctuation or end of word)
  // The regex matches @ followed by word characters, but stops at:
  // - End of string
  // - Whitespace followed by non-word characters
  // - Punctuation (except @, ., - which are allowed in names/emails)
  // We use word boundaries and lookahead to stop at the right place
  const mentionRegex = /@[\w.@-]+(?:\s+[\w.@-]+)*(?=\s|$|[^\w.@-])/g;
  const matches = text.match(mentionRegex);
  
  console.log('[parseMentions] Text:', text);
  console.log('[parseMentions] Matches:', matches);
  
  if (!matches) {
    console.log('[parseMentions] No matches found');
    return [];
  }
  
  // Clean up mentions - remove trailing spaces and trim
  const cleanedMentions = matches.map(m => m.trim());
  
  // Return unique mentions
  const uniqueMentions = Array.from(new Set(cleanedMentions));
  console.log('[parseMentions] Unique mentions:', uniqueMentions);
  return uniqueMentions;
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
    console.log('[notifyCommentMention] Creating in-app notification for user:', userId, 'actor:', actor);
    try {
      await createNotification({
        userId,
        type: 'COMMENT_MENTION',
        title: `@${actor} mentioned you`,
        message: `in a comment on ${context}`,
        taskId: taskId || null,
        jobId: jobId || null,
        commentId,
        actorId: actorId || null,
      });
      console.log('[notifyCommentMention] In-app notification created successfully');
    } catch (notifError: any) {
      console.error('[notifyCommentMention] Failed to create notification:', notifError);
      console.error('[notifyCommentMention] Error details:', {
        message: notifError.message,
        code: notifError.code,
        meta: notifError.meta,
      });
      // Don't throw - we still want to try sending email even if in-app fails
    }
  } else {
    console.log('[notifyCommentMention] In-app notifications disabled for user:', userId);
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











