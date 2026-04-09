'use client';

import { useState, useTransition } from 'react';
import { updateJobNumberAndTitle } from './actions';

type EditableJobTitleProps = {
  jobId: string;
  initialJobNumber: string;
  initialTitle: string;
  canEdit: boolean;
};

export default function EditableJobTitle({ jobId, initialJobNumber, initialTitle, canEdit }: EditableJobTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [jobNumber, setJobNumber] = useState(initialJobNumber);
  const [title, setTitle] = useState(initialTitle);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = () => {
    setMessage(null);
    
    // Validate job number format
    const jobNumberPattern = /^[A-Z]{3}-[0-9]{3}$/;
    if (!jobNumberPattern.test(jobNumber)) {
      setMessage({ type: 'error', text: 'Job number must be in format XXX-000 (3 uppercase letters, hyphen, 3 numbers)' });
      return;
    }

    if (!jobNumber.trim() || !title.trim()) {
      setMessage({ type: 'error', text: 'Job number and title are required' });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('jobNumber', jobNumber.trim().toUpperCase());
      formData.append('title', title.trim());
      
      const result = await updateJobNumberAndTitle(formData);
      
      if (result.success) {
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Job updated successfully' });
        setTimeout(() => {
          setMessage(null);
          window.location.reload(); // Reload to show updated job number in sidebar
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update job' });
      }
    });
  };

  const handleCancel = () => {
    setJobNumber(initialJobNumber);
    setTitle(initialTitle);
    setIsEditing(false);
    setMessage(null);
  };

  if (!canEdit) {
    return null; // Don't show edit button if user can't edit
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
      {isEditing ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {message && (
            <div
              style={{
                backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
                color: message.type === 'success' ? '#22543d' : '#742a2a',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              {message.text}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value.toUpperCase())}
              placeholder="XXX-000"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-input)',
                width: 'auto',
                minWidth: 120,
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
              autoFocus
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job title"
              style={{
                fontSize: 'var(--text-md)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-input)',
                flex: 1,
                minWidth: 200,
                lineHeight: 1.3,
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={isPending}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isPending ? 'var(--border-medium)' : 'var(--theme-500)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-input)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <span
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {jobNumber}
          </span>
          <span
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              lineHeight: 1.3,
            }}
          >
            {title}
          </span>
          {canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 14,
                cursor: 'pointer',
                padding: '2px 4px',
                opacity: 0.6,
                lineHeight: 1,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
              title="Edit job number and title"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}
