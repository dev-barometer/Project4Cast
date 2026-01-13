'use client';

import { useState } from 'react';
import NotificationItem from './NotificationItem';

type ReadNotificationsAccordionProps = {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string; // ISO string
    link: string; // Pre-computed link
    type: string;
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
    comment?: {
      id: string;
      body: string;
    } | null;
  }>;
};

export default function ReadNotificationsAccordion({
  notifications,
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
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
