'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show more helpful error message for database connection issues
        if (data.error?.includes('Database connection') || data.error?.includes("Can't reach database")) {
          setError('Database connection failed. Your Supabase database might be paused. Please check your Supabase dashboard and resume the database if needed. See SUPABASE_FIX.md for help.');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }

      // Redirect to login page with verification message
      router.push('/login?message=Account created! Please check your email to verify your account before signing in.');
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          Sign Up
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#718096',
            marginBottom: 32,
          }}
        >
          Create an account to get started
        </p>

        {error && (
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: '#4a5568',
                marginBottom: 6,
              }}
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="Your name"
            />
          </div>

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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              placeholder="••••••••"
            />
            <div
              style={{
                fontSize: 12,
                color: '#718096',
                marginTop: 4,
              }}
            >
              Must be at least 8 characters
            </div>
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
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 6,
              border: 'none',
              background: isLoading ? '#a0aec0' : '#4299e1',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: 16,
            }}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            fontSize: 14,
            color: '#718096',
          }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              color: '#4299e1',
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

