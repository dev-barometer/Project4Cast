'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { resetPassword } from './actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(resetPassword, null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    formData.append('token', token);
    setSubmitted(true);
    formAction(formData);
  };

  // Redirect on success
  if (state?.success) {
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  }

  return (
    <>
      {state?.success && (
        <div
          style={{
            backgroundColor: '#c6f6d5',
            color: '#22543d',
            padding: '12px 16px',
            borderRadius: 6,
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          {state.message} Redirecting to login...
        </div>
      )}

      {state?.error && (
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
          {state.error}
        </div>
      )}

      {!state?.success && (
        <form action={formAction} onSubmit={() => setSubmitted(true)}>
          <input type="hidden" name="token" value={token} />
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#4a5568',
                marginBottom: 6,
              }}
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                fontSize: 14,
                backgroundColor: '#ffffff',
                color: '#2d3748',
              }}
              placeholder="••••••••"
            />
            <p style={{ fontSize: 12, color: '#a0aec0', marginTop: 4, marginBottom: 0 }}>
              Must be at least 8 characters
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#4a5568',
                marginBottom: 6,
              }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                fontSize: 14,
                backgroundColor: '#ffffff',
                color: '#2d3748',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitted}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 6,
              border: 'none',
              background: submitted ? '#a0aec0' : '#06B6D4',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              cursor: submitted ? 'not-allowed' : 'pointer',
              marginBottom: 16,
            }}
          >
            {submitted ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      <div
        style={{
          textAlign: 'center',
          fontSize: 14,
          color: '#718096',
        }}
      >
        <Link
          href="/login"
          style={{
            color: '#06B6D4',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Back to Sign In
        </Link>
      </div>
    </>
  );
}

