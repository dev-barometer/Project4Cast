// app/reset-password/page.tsx
// Reset password page (with token from email)

import { verifyResetToken, resetPassword } from './actions';
import { redirect } from 'next/navigation';
import ResetPasswordForm from './ResetPasswordForm';

type ResetPasswordPageProps = {
  searchParams: { token?: string };
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams.token;

  if (!token) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7fafc',
          padding: 20,
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '40px 32px',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#2d3748',
              marginBottom: 8,
            }}
          >
            Invalid Reset Link
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#718096',
              marginBottom: 24,
            }}
          >
            This password reset link is invalid. Please request a new one.
          </p>
          <a
            href="/forgot-password"
            style={{
              display: 'inline-block',
              padding: '12px 16px',
              borderRadius: 6,
              border: 'none',
              background: '#4299e1',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Request New Reset Link
          </a>
        </div>
      </main>
    );
  }

  // Verify token
  const tokenVerification = await verifyResetToken(token);

  if (!tokenVerification.valid) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7fafc',
          padding: 20,
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '40px 32px',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#2d3748',
              marginBottom: 8,
            }}
          >
            {tokenVerification.error || 'Invalid Reset Link'}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#718096',
              marginBottom: 24,
            }}
          >
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <a
            href="/forgot-password"
            style={{
              display: 'inline-block',
              padding: '12px 16px',
              borderRadius: 6,
              border: 'none',
              background: '#4299e1',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Request New Reset Link
          </a>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc',
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '40px 32px',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#2d3748',
            marginBottom: 8,
          }}
        >
          Reset Password
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#718096',
            marginBottom: 32,
          }}
        >
          Enter your new password below.
        </p>

        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}



