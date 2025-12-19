'use client';

import { useState, useTransition } from 'react';
import { updateJobBrief } from './actions';

type EditableJobBriefProps = {
  jobId: string;
  initialBrief: string | null;
  canEdit: boolean;
};

export default function EditableJobBrief({ jobId, initialBrief, canEdit }: EditableJobBriefProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [brief, setBrief] = useState(initialBrief || '');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('brief', brief);
      
      const result = await updateJobBrief(formData);
      
      if (result.success) {
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Brief updated successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update brief' });
      }
    });
  };

  const handleCancel = () => {
    setBrief(initialBrief || '');
    setIsEditing(false);
    setMessage(null);
  };

  if (!canEdit) {
    return (
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', marginBottom: 12 }}>Brief</h3>
        <p style={{ fontSize: 14, marginTop: 8, color: '#4a5568', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {initialBrief || <em style={{ color: '#a0aec0' }}>No brief added yet.</em>}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', margin: 0 }}>Brief</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e0',
              background: '#ffffff',
              color: '#4a5568',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        )}
      </div>

      {message && (
        <div
          style={{
            backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
            color: message.type === 'success' ? '#22543d' : '#742a2a',
            padding: '8px 12px',
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {message.text}
        </div>
      )}

      {isEditing ? (
        <div>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Enter job brief..."
            style={{
              width: '100%',
              minHeight: 120,
              padding: '12px',
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              fontSize: 14,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              color: '#2d3748',
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={handleSave}
              disabled={isPending}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                background: isPending ? '#a0aec0' : '#4299e1',
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
                background: '#ffffff',
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
        <p style={{ fontSize: 14, marginTop: 8, color: '#4a5568', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {brief || <em style={{ color: '#a0aec0' }}>No brief added yet. Click Edit to add one.</em>}
        </p>
      )}
    </div>
  );
}








