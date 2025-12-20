// app/verify-email/page.tsx
// Email verification page

import { verifyEmail } from './actions';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

type VerifyEmailPageProps = {
  searchParams: { token?: string };
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const token = searchParams.token;

  if (!token) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7fdfc',
          padding: 20,
        }}
      >
        <div
          style={{
            backgroundColor: '#f7fdfc',
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
            Invalid Verification Link
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#718096',
              marginBottom: 24,
            }}
          >
            This verification link is invalid. Please check your email for the correct link.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '12px 16px',
              borderRadius: 6,
              border: 'none',
              background: '#14B8A6',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </main>
    );
  }

  // Verify email
  const result = await verifyEmail(token);

  if (result.success) {
    // Revalidate to update session and remove banner
    revalidatePath('/', 'layout');
    // Redirect to login with success message (redirect throws, so code after won't execute)
    redirect('/login?message=Email verified successfully! You can now sign in.');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fdfc',
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: '#f7fdfc',
          padding: '40px 32px',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <div
          style={{
            backgroundColor: '#fed7d7',
            color: '#742a2a',
            padding: '12px 16px',
            borderRadius: 6,
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          {result.error}
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#2d3748',
            marginBottom: 8,
          }}
        >
          Verification Failed
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#718096',
            marginBottom: 24,
          }}
        >
          {result.error === 'This verification link has expired'
            ? 'This verification link has expired. Please request a new verification email.'
            : 'Please check your email for a valid verification link or request a new one.'}
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: '12px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#14B8A6',
            color: 'white',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
            marginRight: 12,
          }}
        >
          Go to Sign In
        </Link>
      </div>
    </main>
  );
}

