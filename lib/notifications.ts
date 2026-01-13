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
  // - @First Last (names with spaces)
  // Strategy: Match @ followed by words, but stop when we hit:
  // - End of string
  // - A space followed by text that doesn't look like a name continuation
  //   (e.g., all lowercase gibberish, or punctuation)
  // We'll match word by word and stop when we hit something that's clearly not part of the mention
  
  const mentions: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    // Find the next @ symbol
    const atIndex = text.indexOf('@', i);
    if (atIndex === -1) break;
    
    // Start matching from the @
    let matchEnd = atIndex + 1; // Skip the @
    let words: string[] = [];
    let currentWord = '';
    let inWord = false;
    
    // Match words after @
    for (let j = atIndex + 1; j < text.length; j++) {
      const char = text[j];
      const isWordChar = /[\w.@-]/.test(char);
      const isSpace = /\s/.test(char);
      
      if (isWordChar) {
        currentWord += char;
        inWord = true;
      } else if (isSpace && inWord) {
        // We hit a space after a word
        words.push(currentWord);
        currentWord = '';
        inWord = false;
        
        // Look ahead to see if the next word looks like part of the mention
        // Skip spaces
        let nextWordStart = j + 1;
        while (nextWordStart < text.length && /\s/.test(text[nextWordStart])) {
          nextWordStart++;
        }
        
        // Check if next word starts with capital (likely part of name) or is short
        if (nextWordStart < text.length) {
          const nextChar = text[nextWordStart];
          const nextWordMatch = text.substring(nextWordStart).match(/^[\w.@-]+/);
          const nextWord = nextWordMatch ? nextWordMatch[0] : '';
          
          // Stop if next word is all lowercase and long (probably not part of name)
          // or if it's clearly not a name continuation
          if (nextWord && nextWord.length > 10 && nextWord === nextWord.toLowerCase()) {
            // Long all-lowercase word - probably not part of mention
            break;
          }
          
          // Continue if next word starts with capital or is short (could be part of name)
          if (nextChar && nextChar === nextChar.toUpperCase() && /[A-Z]/.test(nextChar)) {
            // Next word starts with capital - might be part of name, continue
            continue;
          }
          
          // If we have 2+ words already, stop (names are usually 1-2 words)
          if (words.length >= 2) {
            break;
          }
        }
      } else {
        // Hit punctuation or end - stop
        if (inWord) {
          words.push(currentWord);
        }
        break;
      }
    }
    
    // Add final word if we ended in the middle of one
    if (inWord && currentWord) {
      words.push(currentWord);
    }
    
    // If we found at least one word, it's a mention
    if (words.length > 0) {
      const mention = '@' + words.join(' ');
      mentions.push(mention);
    }
    
    // Move past this mention
    i = atIndex + 1;
  }
  
  console.log('[parseMentions] Text:', text);
  console.log('[parseMentions] Found mentions:', mentions);
  
  // Return unique mentions
  return Array.from(new Set(mentions));
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
  let messageText = '';
  if (jobTitle) {
    messageText = `"${taskTitle}" in job "${jobTitle}"`;
  } else {
    messageText = `"${taskTitle}"`;
  }
  
  await createNotification({
    userId,
    type: 'TASK_ASSIGNED',
    title: "You've been assigned to a task",
    message: messageText,
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
    const actor = actorName || 'Someone';
    let contextMessage = '';
    if (taskTitle && jobTitle) {
      contextMessage = `on task "${taskTitle}" in job "${jobTitle}"`;
    } else if (taskTitle) {
      contextMessage = `on task "${taskTitle}"`;
    } else if (jobTitle) {
      contextMessage = `on job "${jobTitle}"`;
    } else {
      contextMessage = 'on a task';
    }
    
    console.log('[notifyCommentMention] Creating in-app notification for user:', userId, 'actor:', actor);
    try {
      await createNotification({
        userId,
        type: 'COMMENT_MENTION',
        title: `${actor} mentioned you`,
        message: `in a comment ${contextMessage}`,
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











