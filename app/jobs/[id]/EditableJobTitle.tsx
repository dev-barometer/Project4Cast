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
    <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', width: '100%' }}>
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
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#2d3748',
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                backgroundColor: '#f7fdfc',
                width: 'auto',
                minWidth: 150,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
              autoFocus
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job title"
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#2d3748',
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                backgroundColor: '#f7fdfc',
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
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                background: isPending ? '#a0aec0' : '#14B8A6',
                color: 'white',
                fontSize: 13,
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
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                background: '#f7fdfc',
                color: '#4a5568',
                fontSize: 13,
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
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#2d3748',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {jobNumber}
          </span>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#2d3748',
              lineHeight: 1.3,
            }}
          >
            {title}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid #cbd5e0',
              background: '#f7fdfc',
              color: '#4a5568',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              marginLeft: 'auto',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5f8fa';
              e.currentTarget.style.borderColor = '#14B8A6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f7fdfc';
              e.currentTarget.style.borderColor = '#cbd5e0';
            }}
            title="Edit job number and title"
          >
            ✏️
          </button>
        </>
      )}
    </div>
  );
}
