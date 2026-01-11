'use client';

import { useState } from 'react';
import Link from 'next/link';

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actor?: {
    name: string | null;
    email: string;
  } | null;
  taskId?: string | null;
  jobId?: string | null;
  job?: {
    id: string;
    title: string;
    jobNumber: string;
  } | null;
  task?: {
    id: string;
    title: string;
    jobId: string | null;
  } | null;
};

type ReadNotificationsAccordionProps = {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    actor?: {
      name: string | null;
      email: string;
    } | null;
    taskId?: string | null;
    jobId?: string | null;
    job?: {
      id: string;
      title: string;
      jobNumber: string;
    } | null;
    task?: {
      id: string;
      title: string;
      jobId: string | null;
    } | null;
  }>;
  getNotificationLink: (notification: any) => string;
  formatTimeAgo: (date: Date) => string;
};

export default function ReadNotificationsAccordion({
  notifications,
  getNotificationLink,
  formatTimeAgo,
}: ReadNotificationsAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: '#f7fdfc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          color: '#4a5568',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f7ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f7fdfc';
        }}
      >
        <span>Read Items ({notifications.length})</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="#4a5568"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>
      
      {isExpanded && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((notification) => {
            const link = getNotificationLink(notification);
            const actorName = notification.actor?.name || notification.actor?.email || 'Someone';

            return (
              <Link
                key={notification.id}
                href={link}
                style={{
                  display: 'block',
                  backgroundColor: '#f7fdfc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 16,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 400,
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
    </div>
  );
}
