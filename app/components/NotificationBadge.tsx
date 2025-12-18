// app/components/NotificationBadge.tsx
// Client component for notification badge in header

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type NotificationBadgeProps = {
  initialCount: number;
};

export default function NotificationBadge({ initialCount }: NotificationBadgeProps) {
  const [count, setCount] = useState(initialCount);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/notifications/count');
        if (response.ok) {
          const data = await response.json();
          setCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (count === 0) {
    return (
      <Link
        href="/notifications"
        style={{
          fontSize: 14,
          color: '#4a5568',
          textDecoration: 'none',
          position: 'relative',
        }}
      >
        Notifications
      </Link>
    );
  }

  return (
    <Link
      href="/notifications"
      style={{
        fontSize: 14,
        color: '#4a5568',
        textDecoration: 'none',
        position: 'relative',
        fontWeight: 500,
      }}
    >
      Notifications
      <span
        style={{
          position: 'absolute',
          top: -6,
          right: -12,
          backgroundColor: '#e53e3e',
          color: '#ffffff',
          borderRadius: '50%',
          width: 18,
          height: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {count > 99 ? '99+' : count}
      </span>
    </Link>
  );
}







