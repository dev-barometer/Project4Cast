'use client';

// Client Component for displaying and uploading attachments

import { uploadJobAttachment, uploadTaskAttachment, deleteAttachment } from './actions';
import { useState, useRef, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { getFileUrl } from '@/lib/file-url-utils';
import { MAX_FILE_SIZE, isValidFileType } from '@/lib/file-upload';

type Attachment = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  uploadedAt: Date | string;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

type AttachmentManagerProps = {
  jobId: string;
  taskId?: string; // If provided, uploads to task; otherwise, uploads to job
  attachments: Attachment[];
  currentUserId: string;
};

export default function AttachmentManager({
  jobId,
  taskId,
  attachments,
  currentUserId,
}: AttachmentManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [state, formAction] = useFormState(
    taskId ? uploadTaskAttachment : uploadJobAttachment,
    { success: false, error: null }
  );

  // Reset file input on successful upload
  useEffect(() => {
    if (state?.success && fileInputRef.current) {
      fileInputRef.current.value = '';
      setFileError(null);
    }
  }, [state?.success]);

  const handleDelete = (attachmentId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const formData = new FormData();
      formData.append('attachmentId', attachmentId);
      formData.append('jobId', jobId);
      deleteAttachment(formData);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('presentation')) return '📊';
    return '📎';
  };


  return (
    <div style={{ marginTop: 8 }}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'none',
          border: 'none',
          color: '#06B6D4',
          cursor: 'pointer',
          fontSize: 12,
          padding: '4px 0',
          textDecoration: 'underline',
        }}
      >
        {attachments.length === 0
          ? 'Add attachment'
          : `${attachments.length} ${attachments.length === 1 ? 'file' : 'files'}`}
      </button>

      {/* Attachments section */}
      {isExpanded && (
        <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f7fafc', borderRadius: 6 }}>
          {/* Error message */}
          {state?.error && (
            <div
              style={{
                backgroundColor: '#fed7d7',
                color: '#742a2a',
                padding: '8px 12px',
                borderRadius: 4,
                marginBottom: 12,
                fontSize: 12,
              }}
            >
              <strong>Error:</strong> {state.error}
            </div>
          )}

          {/* Existing attachments */}
          {attachments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    marginBottom: 8,
                    backgroundColor: '#ffffff',
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <span style={{ fontSize: 18 }}>{getFileIcon(attachment.mimeType)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a
                        href={getFileUrl(attachment.url)}
                        download={attachment.filename}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#06B6D4',
                          textDecoration: 'none',
                          fontSize: 13,
                          fontWeight: 500,
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={attachment.filename}
                      >
                        {attachment.filename}
                      </a>
                      <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                        {attachment.uploadedBy?.name || attachment.uploadedBy?.email || 'Unknown'} ·{' '}
                        {new Date(attachment.uploadedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(attachment.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: '4px 8px',
                      marginLeft: 8,
                    }}
                    title="Delete file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload form */}
          <form action={formAction} encType="multipart/form-data">
            <input type="hidden" name="jobId" value={jobId} />
            {taskId && <input type="hidden" name="taskId" value={taskId} />}
            <input type="hidden" name="uploadedById" value={currentUserId} />
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              accept=".pdf,.docx,.png,.pptx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file type
                  if (!isValidFileType(file.name, file.type)) {
                    setFileError('Invalid file type. Allowed: PDF, DOCX, PNG, PPTX');
                    e.target.value = ''; // Clear the input
                    return;
                  }
                  
                  // Validate file size
                  if (file.size > MAX_FILE_SIZE) {
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
                    setFileError(`File too large: ${sizeMB}MB. Maximum size: ${maxMB}MB`);
                    e.target.value = ''; // Clear the input
                    return;
                  }
                  
                  // Clear any previous errors
                  setFileError(null);
                  // Submit form when file is selected
                  e.target.form?.requestSubmit();
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 4,
                border: fileError ? '1px solid #e53e3e' : '1px solid #cbd5e0',
                fontSize: 13,
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            />
            {fileError && (
              <div
                style={{
                  fontSize: 11,
                  color: '#e53e3e',
                  marginTop: 4,
                  padding: '4px 8px',
                  backgroundColor: '#fed7d7',
                  borderRadius: 4,
                }}
              >
                {fileError}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>
              Allowed: PDF, DOCX, PNG, PPTX (max 10MB)
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

