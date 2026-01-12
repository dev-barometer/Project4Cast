'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Create a notification
export async function createNotification({
  userId,
  type,
  title,
  message,
  taskId,
  jobId,
  commentId,
  actorId,
}: {
  userId: string;
  type: 'TASK_ASSIGNED' | 'JOB_ASSIGNED' | 'TASK_COMPLETED' | 'COMMENT_MENTION';
  title: string;
  message: string;
  taskId?: string | null;
  jobId?: string | null;
  commentId?: string | null;
  actorId?: string | null;
}) {
  try {
    console.log('[createNotification] Creating notification:', {
      userId,
      type,
      title,
      message,
      taskId,
      jobId,
      commentId,
      actorId,
    });
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        taskId: taskId || null,
        jobId: jobId || null,
        commentId: commentId || null,
        actorId: actorId || null,
      },
    });
    console.log('[createNotification] Notification created successfully:', notification.id);
    return notification;
  } catch (error: any) {
    console.error('[createNotification] Error creating notification:', error);
    console.error('[createNotification] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    // Re-throw the error so callers know it failed
    throw error;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  'use server';

  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) return;

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: currentUserId, // Ensure user can only mark their own notifications as read
    },
    data: {
      read: true,
    },
  });

  revalidatePath('/notifications');
  revalidatePath('/');
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  'use server';

  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) return;

  await prisma.notification.updateMany({
    where: {
      userId: currentUserId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  revalidatePath('/notifications');
  revalidatePath('/');
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}








