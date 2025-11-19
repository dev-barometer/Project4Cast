// app/admin/make-admin/page.tsx
// Simple page to make a user an admin (one-time setup)

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MakeAdminForm from './MakeAdminForm';

export default async function MakeAdminPage() {
  // Get authenticated user
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    redirect('/login');
  }

  // Get current user
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  if (!currentUser) {
    redirect('/login');
  }

  // Get all users
  const allUsers = await prisma.user.findMany({
    orderBy: { email: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return (
    <main style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ backgroundColor: '#ffffff', padding: 32, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          Make User an Admin
        </h1>
        <p style={{ color: '#718096', fontSize: 16, marginBottom: 24 }}>
          Select a user to make them an administrator. Administrators can send invitations to other users.
        </p>

        <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f7fafc', borderRadius: 6 }}>
          <p style={{ fontSize: 14, color: '#4a5568', margin: 0, fontWeight: 500 }}>
            Your current role: <span style={{ color: currentUser.role === 'ADMIN' ? '#22543d' : '#742a2a' }}>
              {currentUser.role}
            </span>
          </p>
        </div>

        <MakeAdminForm users={allUsers} currentUserId={currentUserId} />

        <div style={{ marginTop: 32, padding: 16, backgroundColor: '#fff5f5', borderRadius: 6 }}>
          <p style={{ fontSize: 13, color: '#742a2a', margin: 0 }}>
            <strong>Note:</strong> Once you make someone an admin, they will have full access to invite users and manage the platform. 
            Make sure you trust the person you're promoting.
          </p>
        </div>
      </div>
    </main>
  );
}

