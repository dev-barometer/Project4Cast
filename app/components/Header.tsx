'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationBadge from './NotificationBadge';
import UserMenu from './UserMenu';
import { saveScrollPosition } from './AutoRefresh';

type HeaderProps = {
  user?: {
    name?: string | null;
    email?: string;
    role?: string;
  } | null;
  unreadNotificationCount?: number;
};

export default function Header({ user, unreadNotificationCount = 0 }: HeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRefresh = () => {
    saveScrollPosition();
    router.refresh();
  };

  return (
    <header
      id="main-header"
      style={{
        backgroundColor: '#f7fdfc',
        borderBottom: '1px solid #e2e8f0',
        padding: isMobile ? '12px 16px' : '12px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: isMobile ? 12 : 0,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24, paddingLeft: isMobile ? 0 : 16, width: isMobile ? 'auto' : 320 }}>
        <Link
          href="/"
          style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 600,
            color: '#2d3748',
            textDecoration: 'none',
          }}
        >
          Project4cast
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 20, flexWrap: 'wrap' }}>
        {!isMobile && (
          <div
            style={{
              maxWidth: 400,
              width: 300,
              position: 'relative',
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#e5f8fa',
                fontSize: 14,
                color: '#2d3748',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#5a6579',
                fontSize: 16,
              }}
            >
              🔍
            </span>
          </div>
        )}
        {!isMobile && (
          <Link
            href="/my-tasks"
            style={{
              fontSize: 14,
              color: '#5a6579',
              textDecoration: 'none',
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: 8,
            }}
          >
            My Tasks
          </Link>
        )}
        <button
          onClick={handleRefresh}
          style={{
            fontSize: 14,
            color: '#5a6579',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            padding: '6px 12px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          title="Refresh page"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 2V6L12 2L8 2ZM8 14V10L4 14L8 14ZM2 8C2 4.68629 4.68629 2 8 2M14 8C14 11.3137 11.3137 14 8 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!isMobile && <span>Refresh</span>}
        </button>
        <NotificationBadge initialCount={unreadNotificationCount} />
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}

