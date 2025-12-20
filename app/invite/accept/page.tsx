// app/invite/accept/page.tsx
// Page for accepting user invitations

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import InvitationAcceptForm from './InvitationAcceptForm';

type PageProps = {
  searchParams: { token?: string };
};

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const token = searchParams.token;

  if (!token) {
    return (
      <main style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ backgroundColor: '#f7fdfc', padding: 32, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
            Invalid Invitation
          </h1>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 24 }}>
            This invitation link is invalid. Please contact the person who invited you for a new invitation.
          </p>
        </div>
      </main>
    );
  }

  // Find invitation by token
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      invitedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    return (
      <main style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ backgroundColor: '#f7fdfc', padding: 32, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
            Invitation Not Found
          </h1>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 24 }}>
            This invitation link is invalid or has been cancelled. Please contact the person who invited you for a new invitation.
          </p>
        </div>
      </main>
    );
  }

  // Check if invitation is expired
  if (invitation.expiresAt < new Date()) {
    return (
      <main style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ backgroundColor: '#f7fdfc', padding: 32, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
            Invitation Expired
          </h1>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 24 }}>
            This invitation has expired. Please contact {invitation.invitedBy.name || invitation.invitedBy.email} for a new invitation.
          </p>
        </div>
      </main>
    );
  }

  // Check if invitation is already accepted
  if (invitation.status === 'ACCEPTED') {
    return (
      <main style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ backgroundColor: '#f7fdfc', padding: 32, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
            Invitation Already Accepted
          </h1>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 24 }}>
            This invitation has already been accepted. You can{' '}
            <a href="/login" style={{ color: '#14B8A6', textDecoration: 'none' }}>
              sign in here
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  // Check if invitation is cancelled
  if (invitation.status === 'CANCELLED') {
    return (
      <main style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ backgroundColor: '#f7fdfc', padding: 32, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
            Invitation Cancelled
          </h1>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 24 }}>
            This invitation has been cancelled. Please contact {invitation.invitedBy.name || invitation.invitedBy.email} for a new invitation.
          </p>
        </div>
      </main>
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  return (
    <main style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ backgroundColor: '#f7fdfc', padding: 32, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          You&apos;ve been invited!
        </h1>
        <p style={{ color: '#718096', fontSize: 16, marginBottom: 24 }}>
          <strong>{invitation.invitedBy.name || invitation.invitedBy.email}</strong> has invited you to join{' '}
          {process.env.NEXT_PUBLIC_APP_NAME || 'our platform'}.
        </p>

        {existingUser ? (
          <div style={{ padding: 16, backgroundColor: '#fed7d7', borderRadius: 6, marginBottom: 24 }}>
            <p style={{ color: '#742a2a', fontSize: 14, margin: 0 }}>
              An account with this email already exists. Please{' '}
              <a href="/login" style={{ color: '#742a2a', textDecoration: 'underline', fontWeight: 500 }}>
                sign in
              </a>{' '}
              to accept the invitation.
            </p>
          </div>
        ) : (
          <InvitationAcceptForm invitation={invitation} />
        )}
      </div>
    </main>
  );
}

