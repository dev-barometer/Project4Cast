'use client';

import { useState, useTransition } from 'react';
import { resendVerificationEmail } from '../verify-email/actions';

type EmailVerificationBannerProps = {
  userId: string;
  email: string;
};

export default function EmailVerificationBanner({ userId, email }: EmailVerificationBannerProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResend = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await resendVerificationEmail(userId);
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Verification email sent!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send email' });
      }
    });
  };

  return (
    <div
      style={{
        backgroundColor: '#fff5f5',
        border: '1px solid #fed7d7',
        borderRadius: 8,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <strong style={{ fontSize: 14, color: '#742a2a' }}>Email Not Verified</strong>
        </div>
        <p style={{ fontSize: 13, color: '#742a2a', margin: 0 }}>
          Please verify your email address ({email}) to access all features. Check your inbox for the verification link.
        </p>
        {message && (
          <p
            style={{
              fontSize: 12,
              color: message.type === 'success' ? '#22543d' : '#742a2a',
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            {message.text}
          </p>
        )}
      </div>
      <button
        onClick={handleResend}
        disabled={isPending}
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid #fed7d7',
          background: '#ffffff',
          color: '#742a2a',
          fontSize: 13,
          fontWeight: 500,
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? 'Sending...' : 'Resend Verification Email'}
      </button>
    </div>
  );
}







