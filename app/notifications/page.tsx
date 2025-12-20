// app/notifications/page.tsx
// Notification center page

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { markNotificationAsRead, markAllNotificationsAsRead } from './actions';
import MarkAllReadButton from './MarkAllReadButton';

export default async function NotificationsPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    redirect('/login');
  }

  // Fetch notifications for the current user
  const notifications = await prisma.notification.findMany({
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

  const unreadCount = notifications.filter((n: typeof notifications[0]) => !n.read).length;

  // Format notification message with link
  const getNotificationLink = (notification: typeof notifications[0]) => {
    if (notification.taskId && notification.jobId) {
      return `/jobs/${notification.jobId}`;
    }
    if (notification.jobId) {
      return `/jobs/${notification.jobId}`;
    }
    if (notification.taskId) {
      return '/tasks';
    }
    return '/';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

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
        <p style={{ color: '#718096', fontSize: 15 }}>
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
        </p>
        <p style={{ marginTop: 16, fontSize: 14, color: '#718096' }}>
          <Link href="/" style={{ color: '#06B6D4', textDecoration: 'none' }}>← Home</Link>
        </p>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
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
          {notifications.map((notification: typeof notifications[0]) => {
            const link = getNotificationLink(notification);
            const actorName = notification.actor?.name || notification.actor?.email || 'Someone';

            return (
              <Link
                key={notification.id}
                href={link}
                style={{
                  display: 'block',
                  backgroundColor: notification.read ? '#ffffff' : '#f0f7ff',
                  border: `1px solid ${notification.read ? '#e2e8f0' : '#cfe2ff'}`,
                  borderRadius: 8,
                  padding: 16,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {!notification.read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#06B6D4',
                            display: 'inline-block',
                          }}
                        />
                      )}
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: notification.read ? 400 : 600,
                          color: '#2d3748',
                          margin: 0,
                        }}
                      >
                        {notification.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: 14, color: '#4a5568', margin: '4px 0 0 0' }}>
                      {notification.message}
                    </p>
                    <p style={{ fontSize: 12, color: '#a0aec0', margin: '8px 0 0 0' }}>
                      {formatTimeAgo(notification.createdAt)}
                      {notification.actor && ` · by ${actorName}`}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

