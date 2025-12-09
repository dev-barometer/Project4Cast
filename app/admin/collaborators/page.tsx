// app/admin/collaborators/page.tsx
// Master collaborator management page for admins

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import RemoveUserButton from './RemoveUserButton';

export default async function CollaboratorsPage() {
  // Get authenticated user
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    redirect('/login');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch all users with their job collaborations and task assignments
  const allUsers = await prisma.user.findMany({
    include: {
      jobs: {
        include: {
          job: {
            select: {
              id: true,
              jobNumber: true,
              title: true,
            },
          },
        },
      },
      tasks: {
        include: {
          task: {
            select: {
              id: true,
              title: true,
              jobId: true,
              job: {
                select: {
                  jobNumber: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { email: 'asc' },
  });

  return (
    <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          Master Collaborator Management
        </h1>
        <p style={{ color: '#718096', fontSize: 15 }}>
          Manage user access to all jobs. Removing a user will remove them from all jobs and all task assignments.
        </p>
        <p style={{ marginTop: 16, fontSize: 14, color: '#718096' }}>
          <Link href="/jobs" style={{ color: '#4299e1', textDecoration: 'none' }}>← Jobs</Link> ·{' '}
          <Link href="/invitations" style={{ color: '#4299e1', textDecoration: 'none' }}>Invitations</Link> ·{' '}
          <Link href="/" style={{ color: '#4299e1', textDecoration: 'none' }}>Home</Link>
        </p>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: '#f7fafc' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                User
              </th>
              <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                Role
              </th>
              <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                Jobs
              </th>
              <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                Task Assignments
              </th>
              <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => {
              const jobCount = user.jobs.length;
              const taskCount = user.tasks.length;
              const hasAccess = jobCount > 0 || taskCount > 0;

              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '12px 16px', color: '#2d3748' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{user.name || user.email}</div>
                      {user.name && (
                        <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 2 }}>{user.email}</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        backgroundColor: user.role === 'ADMIN' ? '#fed7d7' : '#e6f2ff',
                        color: user.role === 'ADMIN' ? '#742a2a' : '#2c5282',
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                    {jobCount > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {user.jobs.slice(0, 3).map((collab) => (
                          <Link
                            key={collab.id}
                            href={`/jobs/${collab.job.id}`}
                            style={{ color: '#4299e1', textDecoration: 'none', fontSize: 12 }}
                          >
                            {collab.job.jobNumber}
                          </Link>
                        ))}
                        {jobCount > 3 && (
                          <span style={{ fontSize: 12, color: '#a0aec0' }}>+{jobCount - 3} more</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#a0aec0' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                    {taskCount > 0 ? (
                      <div>
                        <span style={{ fontWeight: 500 }}>{taskCount}</span>
                        <span style={{ color: '#a0aec0', marginLeft: 4 }}>
                          {taskCount === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#a0aec0' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {hasAccess && user.id !== currentUserId && (
                      <RemoveUserButton
                        userId={user.id}
                        userName={user.name || ''}
                        userEmail={user.email}
                      />
                    )}
                    {!hasAccess && (
                      <span style={{ color: '#a0aec0', fontSize: 13 }}>No access</span>
                    )}
                    {user.id === currentUserId && (
                      <span style={{ color: '#a0aec0', fontSize: 13 }}>You</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Warning */}
      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#fff5f5', borderRadius: 8, border: '1px solid #fed7d7' }}>
        <p style={{ fontSize: 13, color: '#742a2a', margin: 0 }}>
          <strong>Warning:</strong> Removing a user from all jobs will immediately revoke their access to all jobs and remove all their task assignments. This action cannot be undone.
        </p>
      </div>
    </main>
  );
}

