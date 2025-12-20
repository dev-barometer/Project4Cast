'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { requestPasswordReset } from '../reset-password/actions';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordReset, null);
  const [submitted, setSubmitted] = useState(false);

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
          Forgot Password
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#718096',
            marginBottom: 32,
          }}
        >
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

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
            {state.message}
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

        {!submitted || !state?.success ? (
          <form action={formAction} onSubmit={() => setSubmitted(true)}>
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#4a5568',
                  marginBottom: 6,
                }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e0',
                  fontSize: 14,
                  backgroundColor: '#ffffff',
                  color: '#2d3748',
                }}
                placeholder="you@example.com"
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
              {submitted ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : null}

        <div
          style={{
            textAlign: 'center',
            fontSize: 14,
            color: '#718096',
          }}
        >
          Remember your password?{' '}
          <Link
            href="/login"
            style={{
              color: '#06B6D4',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

