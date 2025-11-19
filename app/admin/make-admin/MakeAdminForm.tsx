'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

type MakeAdminFormProps = {
  users: User[];
  currentUserId: string;
};

export default function MakeAdminForm({ users, currentUserId }: MakeAdminFormProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to make user admin');
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setIsSubmitting(false);
      // Refresh the page after 2 seconds to show updated role
      setTimeout(() => {
        router.refresh();
      }, 2000);
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
            htmlFor="user-select"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: '#4a5568',
              marginBottom: 6,
            }}
          >
            Select User
          </label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              fontSize: 14,
              backgroundColor: '#ffffff',
              color: '#2d3748',
              cursor: 'pointer',
            }}
          >
            <option value="">-- Select a user --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} {user.role === 'ADMIN' ? '(Already Admin)' : ''}
              </option>
            ))}
          </select>
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

        {success && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 6,
              backgroundColor: '#c6f6d5',
              color: '#22543d',
              fontSize: 14,
            }}
          >
            User successfully promoted to admin! Refreshing page...
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedUserId}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: 6,
            border: 'none',
            background: isSubmitting || !selectedUserId ? '#a0aec0' : '#4299e1',
            color: 'white',
            fontSize: 16,
            cursor: isSubmitting || !selectedUserId ? 'not-allowed' : 'pointer',
            fontWeight: 500,
          }}
        >
          {isSubmitting ? 'Making Admin...' : 'Make Admin'}
        </button>
      </div>
    </form>
  );
}

