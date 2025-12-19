'use client';

import { markAllNotificationsAsRead } from './actions';
import { useTransition } from 'react';

export default function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      markAllNotificationsAsRead();
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        padding: '6px 12px',
        borderRadius: 4,
        border: '1px solid #cbd5e0',
        background: '#ffffff',
        color: '#4a5568',
        fontSize: 13,
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? 'Marking...' : 'Mark all as read'}
    </button>
  );
}








