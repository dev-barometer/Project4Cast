'use client';

import { useState } from 'react';
import Link from 'next/link';
import { markNotificationAsRead } from './actions';

type NotificationItemProps = {
  notification: {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link: string;
    type: string;
    actor?: {
      name: string | null;
      email: string;
    } | null;
    job?: {
      id: string;
      title: string;
      jobNumber: string;
    } | null;
    comment?: {
      id: string;
      body: string;
    } | null;
  };
};

export default function NotificationItem({ notification }: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.read);
  const [isMarking, setIsMarking] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isMarking || isRead) return;
    
    setIsMarking(true);
    try {
      await markNotificationAsRead(notification.id);
      setIsRead(true);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsMarking(false);
    }
  };

  const actorName = notification.actor?.name || notification.actor?.email || 'Someone';
  const timeAgo = formatTimeAgo(notification.createdAt);
  const jobNumber = notification.job?.jobNumber || '';
  const commentBody = notification.comment?.body || '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: isRead ? '#f7fdfc' : '#f0f7ff',
        border: `1px solid ${isRead ? '#e2e8f0' : '#cfe2ff'}`,
        borderRadius: 8,
        padding: 16,
        transition: 'all 0.2s',
      }}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isRead}
        onChange={handleCheckboxChange}
        disabled={isMarking || isRead}
        style={{
          marginTop: 2,
          cursor: isRead ? 'default' : 'pointer',
          width: 18,
          height: 18,
        }}
      />

      {/* Content */}
      <Link
        href={notification.link}
        style={{
          flex: 1,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div>
          {/* First line: Job number and mention */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
              {jobNumber && (
                <span style={{ fontWeight: 600, color: '#2d3748', fontSize: 14 }}>
                  {jobNumber}
                </span>
              )}
              {notification.type === 'COMMENT_MENTION' && (
                <span style={{ fontSize: 14, color: '#2d3748' }}>
                  <span style={{ color: '#4299e1', fontWeight: 500 }}>@{actorName}</span>
                  {' '}mentioned you in a comment
                </span>
              )}
              {notification.type !== 'COMMENT_MENTION' && (
                <span style={{ fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
                  {notification.title}
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#a0aec0', whiteSpace: 'nowrap', marginLeft: 8 }}>
              {timeAgo}
            </span>
          </div>

          {/* Comment message (for mention notifications) */}
          {notification.type === 'COMMENT_MENTION' && commentBody && (
            <p style={{ fontSize: 14, color: '#4a5568', margin: '4px 0 0 0' }}>
              {commentBody}
            </p>
          )}

          {/* Regular message (for non-mention notifications) */}
          {notification.type !== 'COMMENT_MENTION' && (
            <p style={{ fontSize: 14, color: '#4a5568', margin: '4px 0 0 0' }}>
              {notification.message}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
