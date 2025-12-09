'use client';

import { useState, useTransition } from 'react';
import { updateJobResources } from './actions';

type EditableResourcesProps = {
  jobId: string;
  initialResourcesUrl: string | null;
  canEdit: boolean;
};

export default function EditableResources({ jobId, initialResourcesUrl, canEdit }: EditableResourcesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [resourcesUrl, setResourcesUrl] = useState(initialResourcesUrl || '');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = () => {
    setMessage(null);
    
    // Basic URL validation
    if (resourcesUrl && !resourcesUrl.match(/^https?:\/\/.+/)) {
      setMessage({ type: 'error', text: 'Please enter a valid URL (must start with http:// or https://)' });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('resourcesUrl', resourcesUrl);
      
      const result = await updateJobResources(formData);
      
      if (result.success) {
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Files link updated successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update resources link' });
      }
    });
  };

  const handleCancel = () => {
    setResourcesUrl(initialResourcesUrl || '');
    setIsEditing(false);
    setMessage(null);
  };

  const hasResources = initialResourcesUrl && initialResourcesUrl.trim() !== '';

  if (!canEdit && !hasResources) {
    return null; // Don't show anything if no resources and can't edit
  }

  if (!canEdit) {
    return (
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', marginBottom: 12 }}>Files</h3>
        <a
          href={initialResourcesUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            background: '#4299e1',
            color: 'white',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Files
        </a>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', margin: 0 }}>Files</h3>
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
            {hasResources ? 'Edit' : 'Add Link'}
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
          <input
            type="url"
            value={resourcesUrl}
            onChange={(e) => setResourcesUrl(e.target.value)}
            placeholder="https://www.dropbox.com/..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              fontSize: 14,
              fontFamily: 'inherit',
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
      ) : hasResources ? (
        <a
          href={initialResourcesUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            background: '#4299e1',
            color: 'white',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Files
        </a>
      ) : (
        <p style={{ fontSize: 14, color: '#a0aec0', fontStyle: 'italic' }}>
          No files link added. Click "Add Link" to add one.
        </p>
      )}
    </div>
  );
}

