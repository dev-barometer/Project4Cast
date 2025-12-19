// app/invitations/page.tsx
// Admin page for managing user invitations

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InvitationForm from './InvitationForm';
import { cancelInvitation, resendInvitation } from './actions';

export default async function InvitationsPage() {
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

  // Fetch all invitations
  const invitations = await prisma.invitation.findMany({
    include: {
      invitedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Separate invitations by status
  const pendingInvitations = invitations.filter((inv) => inv.status === 'PENDING' && inv.expiresAt > new Date());
  const expiredInvitations = invitations.filter((inv) => inv.status === 'PENDING' && inv.expiresAt <= new Date());
  const acceptedInvitations = invitations.filter((inv) => inv.status === 'ACCEPTED');
  const cancelledInvitations = invitations.filter((inv) => inv.status === 'CANCELLED');

  return (
    <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          User Invitations
        </h1>
        <p style={{ color: '#718096', fontSize: 15 }}>
          Invite users to join the platform by sending them an email invitation.
        </p>
        <p style={{ marginTop: 16, fontSize: 14, color: '#718096' }}>
          <Link href="/jobs" style={{ color: '#4299e1', textDecoration: 'none' }}>← Jobs</Link> ·{' '}
          <Link href="/tasks" style={{ color: '#4299e1', textDecoration: 'none' }}>All Tasks</Link> ·{' '}
          <Link href="/my-tasks" style={{ color: '#4299e1', textDecoration: 'none' }}>My Tasks</Link> ·{' '}
          <Link href="/" style={{ color: '#4299e1', textDecoration: 'none' }}>Home</Link>
        </p>
      </div>

      {/* Invitation Form */}
      <div style={{ marginBottom: 32 }}>
        <InvitationForm />
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
            Pending Invitations ({pendingInvitations.length})
          </h2>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Email
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Role
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Invited By
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Sent
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Expires
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingInvitations.map((invitation) => (
                  <tr key={invitation.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px 16px', color: '#2d3748' }}>{invitation.email}</td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: invitation.role === 'ADMIN' ? '#fed7d7' : '#e6f2ff',
                          color: invitation.role === 'ADMIN' ? '#742a2a' : '#2c5282',
                        }}
                      >
                        {invitation.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                      {invitation.invitedBy.name || invitation.invitedBy.email}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                      {new Date(invitation.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                      {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <form action={async (formData: FormData) => {
                          'use server';
                          await resendInvitation(formData);
                        }} style={{ display: 'inline' }}>
                          <input type="hidden" name="invitationId" value={invitation.id} />
                          <button
                            type="submit"
                            style={{
                              padding: '6px 12px',
                              borderRadius: 4,
                              border: '1px solid #cbd5e0',
                              background: '#ffffff',
                              color: '#4299e1',
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            Resend
                          </button>
                        </form>
                        <form action={cancelInvitation} style={{ display: 'inline' }}>
                          <input type="hidden" name="invitationId" value={invitation.id} />
                          <button
                            type="submit"
                            style={{
                              padding: '6px 12px',
                              borderRadius: 4,
                              border: '1px solid #cbd5e0',
                              background: '#ffffff',
                              color: '#e53e3e',
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expired Invitations */}
      {expiredInvitations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
            Expired Invitations ({expiredInvitations.length})
          </h2>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Email
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Role
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Expired
                  </th>
                </tr>
              </thead>
              <tbody>
                {expiredInvitations.map((invitation) => (
                  <tr key={invitation.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px 16px', color: '#2d3748' }}>{invitation.email}</td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: invitation.role === 'ADMIN' ? '#fed7d7' : '#e6f2ff',
                          color: invitation.role === 'ADMIN' ? '#742a2a' : '#2c5282',
                        }}
                      >
                        {invitation.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#a0aec0', fontSize: 13 }}>
                      {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accepted Invitations */}
      {acceptedInvitations.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
            Accepted Invitations ({acceptedInvitations.length})
          </h2>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Email
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Role
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Accepted
                  </th>
                </tr>
              </thead>
              <tbody>
                {acceptedInvitations.map((invitation) => (
                  <tr key={invitation.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px 16px', color: '#2d3748' }}>{invitation.email}</td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: invitation.role === 'ADMIN' ? '#fed7d7' : '#e6f2ff',
                          color: invitation.role === 'ADMIN' ? '#742a2a' : '#2c5282',
                        }}
                      >
                        {invitation.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                      {invitation.acceptedAt
                        ? new Date(invitation.acceptedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {invitations.length === 0 && (
        <div style={{ backgroundColor: '#ffffff', padding: 48, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <p style={{ color: '#718096', fontSize: 16 }}>No invitations sent yet.</p>
          <p style={{ color: '#a0aec0', fontSize: 14, marginTop: 8 }}>
            Use the form above to invite users to join the platform.
          </p>
        </div>
      )}
    </main>
  );
}

