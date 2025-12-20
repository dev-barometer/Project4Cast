'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThreeDotMenu } from './ThreeDotMenu';

type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string;
  };
};

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 6,
        }}
      >
        {/* Avatar placeholder - will be replaced with actual avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4a5568',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize: 14, color: '#2d3748', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
          {user.name || user.email}
        </span>
        <ThreeDotMenu />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minWidth: 200,
            zIndex: 1000,
          }}
        >
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'block',
              padding: '12px 16px',
              textDecoration: 'none',
              color: '#5a6579',
              fontSize: 14,
              
            }}
          >
            User Profile
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              color: '#5a6579',
              fontSize: 14,
              
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
