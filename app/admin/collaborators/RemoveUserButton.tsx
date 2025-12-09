'use client';

import { removeUserFromAllJobs } from './actions';
import { useTransition } from 'react';

type RemoveUserButtonProps = {
  userId: string;
  userName: string;
  userEmail: string;
};

export default function RemoveUserButton({ userId, userName, userEmail }: RemoveUserButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const confirmed = confirm(
      `Remove ${userName || userEmail} from all jobs? This will also remove all their task assignments.`
    );
    
    if (confirmed) {
      const formData = new FormData();
      formData.append('userId', userId);
      startTransition(() => {
        removeUserFromAllJobs(formData);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'inline' }}>
      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid #cbd5e0',
          background: '#ffffff',
          color: '#e53e3e',
          fontSize: 13,
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? 'Removing...' : 'Remove from All Jobs'}
      </button>
    </form>
  );
}

