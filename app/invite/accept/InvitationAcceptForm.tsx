'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Invitation = {
  id: string;
  email: string;
  token: string;
  role: 'OWNER' | 'ADMIN' | 'USER';
};

type InvitationAcceptFormProps = {
  invitation: Invitation;
};

export default function InvitationAcceptForm({ invitation }: InvitationAcceptFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: invitation.token,
          name: name.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to accept invitation');
        setIsSubmitting(false);
        return;
      }

      // Redirect to login page with success message
      router.push('/login?invited=true');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label
            htmlFor="accept-name"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: '#4a5568',
              marginBottom: 6,
            }}
          >
            Your Name *
          </label>
          <input
            id="accept-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              fontSize: 14,
              backgroundColor: '#f7fdfc',
              color: '#2d3748',
            }}
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="accept-email"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: '#4a5568',
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            id="accept-email"
            type="email"
            value={invitation.email}
            disabled
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              fontSize: 14,
              backgroundColor: '#f7fdfc',
              color: '#718096',
              cursor: 'not-allowed',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="accept-password"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: '#4a5568',
              marginBottom: 6,
            }}
          >
            Password *
          </label>
          <input
            id="accept-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="At least 6 characters"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              fontSize: 14,
              backgroundColor: '#f7fdfc',
              color: '#2d3748',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="accept-confirm-password"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: '#4a5568',
              marginBottom: 6,
            }}
          >
            Confirm Password *
          </label>
          <input
            id="accept-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Confirm your password"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              fontSize: 14,
              backgroundColor: '#f7fdfc',
              color: '#2d3748',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 6,
              backgroundColor: '#fed7d7',
              color: '#742a2a',
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !password || !confirmPassword}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: 6,
            border: 'none',
            background: isSubmitting || !name.trim() || !password || !confirmPassword ? '#a0aec0' : '#14B8A6',
            color: 'white',
            fontSize: 16,
            cursor: isSubmitting || !name.trim() || !password || !confirmPassword ? 'not-allowed' : 'pointer',
            fontWeight: 500,
          }}
        >
          {isSubmitting ? 'Creating Account...' : 'Accept Invitation & Create Account'}
        </button>
      </div>
    </form>
  );
}

