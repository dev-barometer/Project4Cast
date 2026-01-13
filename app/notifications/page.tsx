// app/notifications/page.tsx
// Notification center page

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { markNotificationAsRead, markAllNotificationsAsRead } from './actions';
import MarkAllReadButton from './MarkAllReadButton';
import ReadNotificationsAccordion from './ReadNotificationsAccordion';
import NotificationItem from './NotificationItem';

// Force dynamic rendering since we use auth()
export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    redirect('/login');
  }

  let notifications = [];
  let errorDetails: any = null;
  try {
    // First, verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new Error(`User ${currentUserId} not found`);
    }

    // Fetch notifications for the current user
    notifications = await prisma.notification.findMany({
      where: {
        userId: currentUserId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            jobId: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            jobNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to 100 most recent
    });

    // Fetch comments for notifications that have commentId
    const commentIds = notifications
      .map(n => n.commentId)
      .filter((id): id is string => id !== null);
    
    const comments = commentIds.length > 0
      ? await prisma.comment.findMany({
          where: {
            id: { in: commentIds },
          },
          select: {
            id: true,
            body: true,
          },
        })
      : [];

    // Create a map of commentId -> comment for easy lookup
    const commentMap = new Map(comments.map(c => [c.id, c]));

    // Attach comments to notifications
    notifications = notifications.map(n => ({
      ...n,
      comment: n.commentId ? commentMap.get(n.commentId) || null : null,
    }));
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    errorDetails = {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
      name: error.name,
    };
    
    // Log full error details for debugging
    console.error('Full error details:', JSON.stringify(errorDetails, null, 2));
    
    return (
      <main style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: '#fed7d7',
            color: '#742a2a',
            padding: '20px 24px',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          <strong>Error loading notifications:</strong> {error.message || 'Failed to load notifications'}
          {error.code && (
            <div style={{ marginTop: 8, fontSize: 12, fontFamily: 'monospace' }}>
              Error Code: {error.code}
            </div>
          )}
          {process.env.NODE_ENV === 'development' && errorDetails && (
            <details style={{ marginTop: 12, fontSize: 12 }}>
              <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Technical Details</summary>
              <pre style={{ 
                backgroundColor: '#fff', 
                padding: 12, 
                borderRadius: 4, 
                overflow: 'auto',
                fontSize: 11,
                maxHeight: '300px'
              }}>
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </details>
          )}
          <div style={{ marginTop: 12 }}>
            <Link href="/" style={{ color: '#742a2a', textDecoration: 'underline' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Convert Date objects to ISO strings for serialization and pre-compute links
  const serializedNotifications = notifications.map((n) => {
    // Ensure createdAt exists and is a Date object
    const createdAt = n.createdAt instanceof Date 
      ? n.createdAt.toISOString() 
      : new Date(n.createdAt).toISOString();
    
    // Pre-compute the link (can't pass functions to client components)
    let link = '/';
    if (n.taskId && n.jobId) {
      link = `/jobs/${n.jobId}`;
    } else if (n.jobId) {
      link = `/jobs/${n.jobId}`;
    } else if (n.taskId) {
      link = '/tasks';
    }
    
    return {
      ...n,
      createdAt,
      link, // Pre-computed link
      type: n.type,
    };
  });

  // Separate read and unread notifications
  const unreadNotifications = serializedNotifications.filter((n) => !n.read);
  const readNotifications = serializedNotifications.filter((n) => n.read);
  const unreadCount = unreadNotifications.length;

  return (
    <main style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', margin: 0 }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <MarkAllReadButton />
          )}
        </div>
      </div>

      {/* Notifications List */}
      {serializedNotifications.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f7fdfc',
            borderRadius: 8,
            padding: 48,
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <p style={{ color: '#a0aec0', fontSize: 16, margin: 0 }}>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Unread notifications */}
          {unreadNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}

          {/* Read notifications accordion */}
          <ReadNotificationsAccordion
            notifications={readNotifications}
          />
        </div>
      )}
    </main>
  );
}

