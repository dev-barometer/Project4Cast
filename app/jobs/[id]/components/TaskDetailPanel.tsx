'use client';

import { useState, useEffect, useRef } from 'react';
import { addTaskComment } from '../actions';
import { useFormState } from 'react-dom';
import { getFileUrl } from '@/lib/file-url-utils';
import { MAX_FILE_SIZE, isValidFileType } from '@/lib/file-upload';
import MentionAutocomplete from '@/app/components/MentionAutocomplete';

type User = {
  id: string;
  name: string | null;
  email: string;
};

type TaskDetailPanelProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    comments: Array<{
      id: string;
      body: string;
      createdAt: Date | string;
      author: {
        id: string;
        name: string | null;
        email: string;
      } | null;
    }>;
    attachments: Array<{
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
    }>;
  } | null;
  jobId: string;
  currentUserId: string;
  canEdit: boolean;
  allUsers?: User[];
};

export default function TaskDetailPanel({
  task,
  jobId,
  currentUserId,
  canEdit,
  allUsers = [],
}: TaskDetailPanelProps) {
  const [state, formAction] = useFormState(addTaskComment, { success: false, error: null });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Scroll to bottom when new comment is added
  useEffect(() => {
    if (state?.success && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
      // Clear selected files after successful submission
      setSelectedFiles([]);
      setFileError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [state?.success]);
  
  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
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
        // Clear invalid files from input
        if (fileInputRef.current) {
          const dt = new DataTransfer();
          validFiles.forEach(f => dt.items.add(f));
          fileInputRef.current.files = dt.files;
        }
      } else {
        setFileError(null);
      }
      
      setSelectedFiles(validFiles);
    }
  };

  // Scroll to bottom when task changes
  useEffect(() => {
    if (commentsContainerRef.current && task?.comments.length) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [task?.id]);

  if (!task) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#f7fdfc',
          padding: '40px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a0aec0',
          fontSize: 14,
          
        }}
      >
        Select a task to view details
      </div>
    );
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get attachments for a comment (match by timestamp - within 30 seconds)
  // TODO: Add commentId to Attachment model for proper linking
  const getCommentAttachments = (commentCreatedAt: Date | string, commentAuthorId: string) => {
    const commentTime = typeof commentCreatedAt === 'string' 
      ? new Date(commentCreatedAt).getTime() 
      : commentCreatedAt.getTime();
    
    return task.attachments.filter(att => {
      const attTime = typeof att.uploadedAt === 'string'
        ? new Date(att.uploadedAt).getTime()
        : att.uploadedAt.getTime();
      // Match attachments uploaded within 30 seconds of comment by the same user
      const timeDiff = Math.abs(attTime - commentTime);
      const sameUser = att.uploadedBy?.id === commentAuthorId;
      return timeDiff < 30000 && sameUser; // 30 seconds window
    });
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#f7fdfc',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Comments Section - Scrollable */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Comments Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <h4
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#2d3748',
              margin: 0,
              
            }}
          >
            Comments
          </h4>
        </div>

        {/* Scrollable Comments List */}
        <div
          ref={commentsContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
            minHeight: 0, // Important for flex scrolling
          }}
        >
          {task.comments.length === 0 ? (
            <p
              style={{
                color: '#a0aec0',
                fontSize: 14,
                fontStyle: 'italic',
                textAlign: 'center',
                marginTop: 32,
              }}
            >
              No comments yet. Add one below.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {task.comments.map((comment) => {
                const commentAttachments = getCommentAttachments(comment.createdAt, comment.author?.id || '');
                return (
                  <div
                    key={comment.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f7fdfc',
                      borderRadius: 8,
                      position: 'relative',
                    }}
                  >
                    {/* Edit Icon */}
                    {canEdit && comment.author?.id === currentUserId && (
                      <button
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#718096',
                          fontSize: 14,
                        }}
                        title="Edit comment"
                      >
                        ✏️
                      </button>
                    )}

                    {/* Comment Text */}
                    <div
                      style={{
                        fontSize: 14,
                        color: '#2d3748',
                        lineHeight: 1.6,
                        marginBottom: 12,
                        paddingRight: canEdit && comment.author?.id === currentUserId ? 32 : 0,
                      }}
                    >
                      {comment.body}
                    </div>

                    {/* Comment Attachments */}
                    {commentAttachments.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        {commentAttachments.map((att) => (
                          <a
                            key={att.id}
                            href={getFileUrl(att.url)}
                            download={att.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 10px',
                              backgroundColor: '#f7fdfc',
                              borderRadius: 6,
                              border: '1px solid #e2e8f0',
                              fontSize: 12,
                              color: '#14B8A6',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#cbfdee';
                              e.currentTarget.style.borderColor = '#14B8A6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f7fdfc';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                            title={`Open ${att.filename}`}
                          >
                            <span>📎</span>
                            <span>{att.filename}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Comment Date */}
                    <div
                      style={{
                        fontSize: 12,
                        color: '#718096',
                      }}
                    >
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* New Comment Input - Fixed at Bottom */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f7fdfc',
          }}
        >
          {(state?.error || fileError) && (
            <div
              style={{
                backgroundColor: '#fed7d7',
                color: '#742a2a',
                padding: '8px 12px',
                borderRadius: 6,
                marginBottom: 12,
                fontSize: 12,
              }}
            >
              <strong>Error:</strong> {fileError || state.error}
            </div>
          )}

          {/* Show selected files */}
          {selectedFiles.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 12,
                padding: '8px 12px',
                backgroundColor: '#f7fdfc',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
              }}
            >
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: '#4a5568',
                  }}
                >
                  <span>📎</span>
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = selectedFiles.filter((_, i) => i !== index);
                      setSelectedFiles(newFiles);
                      // Update file input
                      if (fileInputRef.current) {
                        const dt = new DataTransfer();
                        newFiles.forEach(f => dt.items.add(f));
                        fileInputRef.current.files = dt.files;
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#e53e3e',
                      fontSize: 14,
                      padding: '0 4px',
                    }}
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <form action={formAction} encType="multipart/form-data">
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="jobId" value={jobId} />
            <input type="hidden" name="authorId" value={currentUserId} />
            
            {/* File input for attachments */}
            <input
              ref={fileInputRef}
              type="file"
              name="files"
              multiple
              accept=".pdf,.docx,.png,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
              }}
            >
              {/* Paperclip Icon */}
              <button
                type="button"
                onClick={handlePaperclipClick}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: '#718096',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Attach file"
              >
                📎
              </button>

              {/* Textarea with Mention Autocomplete */}
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  name="body"
                  placeholder="Add comment here... (type @ to mention someone)"
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    backgroundColor: '#e5f8fa',
                    color: '#2d3748',
                    resize: 'none',
                  }}
                />
                {allUsers.length > 0 && (
                  <MentionAutocomplete
                    textareaRef={textareaRef}
                    users={allUsers}
                    onSelect={() => {}}
                  />
                )}
              </div>

              {/* Submit Button (+) */}
              <button
                type="submit"
                style={{
                  background: '#14B8A6',
                  border: 'none',
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 20,
                  fontWeight: 500,
                  flexShrink: 0,
                }}
                title="Post comment"
              >
                +
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
