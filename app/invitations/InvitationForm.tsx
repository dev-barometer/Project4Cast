'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { createInvitation } from './actions';

export default function InvitationForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [state, formAction] = useFormState(createInvitation, { success: false, error: null });

  // Reset form on successful submission
  useEffect(() => {
    if (state?.success && isExpanded) {
      setEmail('');
      setRole('USER');
      setIsExpanded(false);
    }
  }, [state?.success, isExpanded]);

  return (
    <div style={{ backgroundColor: '#f7fdfc', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          style={{
            padding: '10px 16px',
            borderRadius: 6,
            border: '1px solid #cbd5e0',
            background: '#f7fdfc',
            color: '#14B8A6',
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>+</span>
          <span>Send Invitation</span>
        </button>
      ) : (
        <form action={formAction}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label
                htmlFor="invitation-email"
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#4a5568',
                  marginBottom: 6,
                }}
              >
                Email Address *
              </label>
              <input
                id="invitation-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
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
                htmlFor="invitation-role"
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#4a5568',
                  marginBottom: 6,
                }}
              >
                Role
              </label>
              <select
                id="invitation-role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e0',
                  fontSize: 14,
                  backgroundColor: '#f7fdfc',
                  color: '#4a5568',
                  cursor: 'pointer',
                }}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <p style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                ADMIN users can invite other users and manage the platform.
              </p>
            </div>

            {state?.error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  backgroundColor: '#fed7d7',
                  color: '#742a2a',
                  fontSize: 14,
                }}
              >
                {state.error}
              </div>
            )}

            {state?.success && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  backgroundColor: '#c6f6d5',
                  color: '#22543d',
                  fontSize: 14,
                }}
              >
                Invitation sent successfully!
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setEmail('');
                  setRole('USER');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e0',
                  background: '#f7fdfc',
                  color: '#4a5568',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!email.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: email.trim() ? '#14B8A6' : '#a0aec0',
                  color: 'white',
                  fontSize: 14,
                  cursor: email.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 500,
                }}
              >
                Send Invitation
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

