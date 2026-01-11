'use client';

// Client Component for displaying and uploading attachments

import { uploadJobAttachment, uploadTaskAttachment, deleteAttachment } from './actions';
import { useState, useRef, useEffect } from 'react';
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Reset file input and selected files after successful uploads
  useEffect(() => {
    // Check if all files have been uploaded
    const allUploaded = selectedFiles.length > 0 && 
      selectedFiles.every((file) => uploadProgress[file.name] === true);
    
    if (allUploaded && fileInputRef.current) {
      fileInputRef.current.value = '';
      setSelectedFiles([]);
      setFileError(null);
      setUploadProgress({});
      setIsUploading(false);
    }
  }, [selectedFiles, uploadProgress]);

  const handleDelete = (attachmentId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const formData = new FormData();
      formData.append('attachmentId', attachmentId);
      formData.append('jobId', jobId);
      deleteAttachment(formData).then(() => {
        // Refresh the page to show updated attachments
        window.location.reload();
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const errors: string[] = [];
      
      files.forEach((file) => {
        // Validate file type
        if (!isValidFileType(file.name, file.type)) {
          errors.push(`${file.name}: Invalid file type. Allowed: PDF, DOCX, PNG, PPTX`);
          return;
        }
        
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
          errors.push(`${file.name}: File too large (${sizeMB}MB). Maximum: ${maxMB}MB`);
          return;
        }
        
        validFiles.push(file);
      });
      
      if (errors.length > 0) {
        setFileError(errors.join('; '));
      } else {
        setFileError(null);
      }
      
      setSelectedFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setFileError(null);
    
    // Upload files one at a time to prevent race conditions
    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('jobId', jobId);
        if (taskId) {
          formData.append('taskId', taskId);
        }
        formData.append('uploadedById', currentUserId);
        formData.append('file', file);
        
        const uploadAction = taskId ? uploadTaskAttachment : uploadJobAttachment;
        const result = await uploadAction(null, formData);
        
        if (result?.error) {
          setFileError(`Failed to upload ${file.name}: ${result.error}`);
          setIsUploading(false);
          return;
        }
        
        // Mark this file as uploaded
        setUploadProgress(prev => ({ ...prev, [file.name]: true }));
      } catch (error: any) {
        setFileError(`Failed to upload ${file.name}: ${error.message}`);
        setIsUploading(false);
        return;
      }
    }
    
    // All files uploaded successfully, refresh the page
    window.location.reload();
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      newFiles.forEach(f => dt.items.add(f));
      fileInputRef.current.files = dt.files;
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
          color: '#14B8A6',
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
        <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f7fdfc', borderRadius: 6 }}>
          {/* Error message */}
          {fileError && (
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
                <strong>Error:</strong> {fileError}
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
                    backgroundColor: '#f7fdfc',
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
                          color: '#14B8A6',
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
          <div>
            <input
              ref={fileInputRef}
              type="file"
              name="files"
              multiple
              accept=".pdf,.docx,.png,.pptx"
              onChange={handleFileChange}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 4,
                border: fileError ? '1px solid #e53e3e' : '1px solid #cbd5e0',
                fontSize: 13,
                backgroundColor: isUploading ? '#e2e8f0' : '#f7fdfc',
                cursor: isUploading ? 'not-allowed' : 'pointer',
              }}
            />
            
            {/* Show selected files */}
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
                  Selected files ({selectedFiles.length}):
                </div>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      marginBottom: 4,
                      backgroundColor: '#e5f8fa',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📎 {file.name}
                    </span>
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e53e3e',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: 16,
                          lineHeight: 1,
                        }}
                        title="Remove file"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload button */}
            {selectedFiles.length > 0 && !isUploading && (
              <button
                type="button"
                onClick={handleUpload}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#14B8A6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}
              </button>
            )}
            
            {isUploading && (
              <div
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#e5f8fa',
                  color: '#2d3748',
                  borderRadius: 4,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                Uploading files...
              </div>
            )}
            
            {fileError && (
              <div
                style={{
                  fontSize: 11,
                  color: '#e53e3e',
                  marginTop: 8,
                  padding: '8px 12px',
                  backgroundColor: '#fed7d7',
                  borderRadius: 4,
                }}
              >
                {fileError}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#718096', marginTop: 8 }}>
              Allowed: PDF, DOCX, PNG, PPTX (max 10MB per file)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

