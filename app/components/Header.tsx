'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  user?: {
    name?: string | null;
    email?: string;
  } | null;
};

export default function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link
          href="/"
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#2d3748',
            textDecoration: 'none',
          }}
        >
          Project Management
        </Link>
        <nav style={{ display: 'flex', gap: 16 }}>
          <Link
            href="/my-tasks"
            style={{
              fontSize: 14,
              color: '#4a5568',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            My Tasks
          </Link>
          <Link
            href="/jobs"
            style={{
              fontSize: 14,
              color: '#4a5568',
              textDecoration: 'none',
            }}
          >
            Jobs
          </Link>
          <Link
            href="/tasks"
            style={{
              fontSize: 14,
              color: '#4a5568',
              textDecoration: 'none',
            }}
          >
            All Tasks
          </Link>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <span
            style={{
              fontSize: 14,
              color: '#4a5568',
            }}
          >
            {user.name || user.email}
          </span>
        )}
        <button
          onClick={handleSignOut}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #cbd5e0',
            background: '#ffffff',
            color: '#4a5568',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

