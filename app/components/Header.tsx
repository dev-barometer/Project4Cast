'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NotificationBadge from './NotificationBadge';
import UserMenu from './UserMenu';

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        <NotificationBadge initialCount={unreadNotificationCount} />
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}

