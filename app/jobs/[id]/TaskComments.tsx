'use client';

// Client Component for displaying and adding task comments

import { addTaskComment, editTaskComment, deleteTaskComment } from './actions';
import { useState, useRef, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import MentionAutocomplete from '@/app/components/MentionAutocomplete';
import { getFileUrl } from '@/lib/file-url-utils';
import { MAX_FILE_SIZE, isValidFileType } from '@/lib/file-upload';

type User = {
  id: string;
  name: string | null;
  email: string;
};

type Comment = {
  id: string;
  body: string;
  createdAt: Date | string;
  author: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

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

type TaskCommentsProps = {
  taskId: string;
  jobId: string;
  comments: Comment[];
  currentUserId: string;
  allUsers?: User[];
  alwaysExpanded?: boolean; // When true, always show content (no internal toggle)
  attachments?: Attachment[]; // Task attachments to match with comments
};

export default function TaskComments({
  taskId,
  jobId,
  comments,
  currentUserId,
  allUsers = [],
  alwaysExpanded = false,
  attachments = [],
}: TaskCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(alwaysExpanded);
  const [state, formAction] = useFormState(addTaskComment, { success: false, error: null });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Clear form and refresh page when comment is successfully added
  useEffect(() => {
    if (state?.success && textareaRef.current) {
      textareaRef.current.value = '';
      setSelectedFiles([]);
      setFileError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh the page to show the new comment
      router.refresh();
    }
  }, [state?.success, router]);

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

  // Get attachments for a comment (match by timestamp - within 30 seconds)
  const getCommentAttachments = (commentCreatedAt: Date | string, commentAuthorId: string) => {
    const commentTime = typeof commentCreatedAt === 'string' 
      ? new Date(commentCreatedAt).getTime() 
      : new Date(commentCreatedAt).getTime();
    
    return attachments.filter(att => {
      const attTime = typeof att.uploadedAt === 'string'
        ? new Date(att.uploadedAt).getTime()
        : new Date(att.uploadedAt).getTime();
      // Match attachments uploaded within 30 seconds of comment by the same user
      const timeDiff = Math.abs(attTime - commentTime);
      const sameUser = att.uploadedBy?.id === commentAuthorId;
      return timeDiff < 30000 && sameUser; // 30 seconds window
    });
  };

  // If alwaysExpanded is true, always show content
  const shouldShowContent = alwaysExpanded || isExpanded;

  return (
    <div style={{ marginTop: alwaysExpanded ? 0 : 8 }}>
      {/* Toggle button - only show if not alwaysExpanded */}
      {!alwaysExpanded && (
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
          {comments.length === 0
            ? 'Add comment'
            : `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}
        </button>
      )}

      {/* Comments section */}
      {shouldShowContent && (
        <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f7fdfc', borderRadius: 6 }}>
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
          {/* Existing comments */}
          {comments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {comments.map((comment) => {
                const isAuthor = comment.author?.id === currentUserId;
                const isEditing = editingCommentId === comment.id;
                
                return (
                  <div
                    key={comment.id}
                    style={{
                      marginBottom: 12,
                      paddingBottom: 12,
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 12, color: '#4a5568' }}>
                        <strong>
                          {comment.author?.name || comment.author?.email || 'Unknown'}
                        </strong>
                        {' · '}
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                      {isAuthor && !isEditing && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditBody(comment.body);
                              setTimeout(() => {
                                editTextareaRef.current?.focus();
                              }, 0);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#4299e1',
                              cursor: 'pointer',
                              fontSize: 11,
                              padding: '2px 4px',
                              textDecoration: 'underline',
                            }}
                          >
                            Edit
                          </button>
                          {deleteConfirmId === comment.id ? (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  const formData = new FormData();
                                  formData.append('commentId', comment.id);
                                  formData.append('currentUserId', currentUserId);
                                  formData.append('jobId', jobId);
                                  const result = await deleteTaskComment(null, formData);
                                  if (result.success) {
                                    setDeleteConfirmId(null);
                                    router.refresh();
                                  } else {
                                    alert(result.error || 'Failed to delete comment');
                                  }
                                }}
                                style={{
                                  background: '#e53e3e',
                                  border: 'none',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontSize: 11,
                                  padding: '2px 6px',
                                  borderRadius: 3,
                                }}
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#718096',
                                  cursor: 'pointer',
                                  fontSize: 11,
                                  padding: '2px 4px',
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(comment.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#e53e3e',
                                cursor: 'pointer',
                                fontSize: 11,
                                padding: '2px 4px',
                                textDecoration: 'underline',
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <form
                        action={async (formData: FormData) => {
                          formData.append('commentId', comment.id);
                          formData.append('currentUserId', currentUserId);
                          formData.append('jobId', jobId);
                          const result = await editTaskComment(null, formData);
                          if (result.success) {
                            setEditingCommentId(null);
                            setEditBody('');
                            router.refresh();
                          } else {
                            alert(result.error || 'Failed to edit comment');
                          }
                        }}
                        style={{ marginTop: 8 }}
                      >
                        <textarea
                          ref={editTextareaRef}
                          name="body"
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          required
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 4,
                            border: '1px solid #cbd5e0',
                            fontSize: 13,
                            backgroundColor: '#ffffff',
                            color: '#2d3748',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditBody('');
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 4,
                              border: '1px solid #cbd5e0',
                              background: '#f7fdfc',
                              color: '#4a5568',
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            style={{
                              padding: '6px 12px',
                              borderRadius: 4,
                              border: 'none',
                              background: '#14B8A6',
                              color: 'white',
                              fontSize: 12,
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ fontSize: 13, color: '#2d3748', lineHeight: 1.6 }}>
                        {comment.body}
                      </div>
                    )}
                  {/* Show attachments for this comment */}
                  {getCommentAttachments(comment.createdAt, comment.author?.id || '').length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {getCommentAttachments(comment.createdAt, comment.author?.id || '').map((att) => (
                        <a
                          key={att.id}
                          href={getFileUrl(att.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            color: '#14B8A6',
                            textDecoration: 'none',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor: '#f0fdfa',
                            border: '1px solid #ccfbf1',
                          }}
                        >
                          <span>📎</span>
                          <span>{att.filename}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add comment form */}
          <form action={formAction} encType="multipart/form-data">
            <input type="hidden" name="taskId" value={taskId} />
            <input type="hidden" name="jobId" value={jobId} />
            <input type="hidden" name="authorId" value={currentUserId} />
            <input
              ref={fileInputRef}
              type="file"
              name="files"
              multiple
              accept=".pdf,.docx,.png,.pptx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {fileError && (
              <div
                style={{
                  backgroundColor: '#fed7d7',
                  color: '#742a2a',
                  padding: '8px 12px',
                  borderRadius: 4,
                  marginBottom: 8,
                  fontSize: 12,
                }}
              >
                {fileError}
              </div>
            )}
            {selectedFiles.length > 0 && (
              <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderRadius: 4,
                      backgroundColor: '#e5f8fa',
                      fontSize: 11,
                      color: '#2d3748',
                    }}
                  >
                    <span>📎</span>
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = selectedFiles.filter((_, i) => i !== index);
                        setSelectedFiles(newFiles);
                        if (fileInputRef.current) {
                          const dt = new DataTransfer();
                          newFiles.forEach(f => dt.items.add(f));
                          fileInputRef.current.files = dt.files;
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e53e3e',
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: 0,
                        marginLeft: 4,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <textarea
                ref={textareaRef}
                name="body"
                placeholder="Add a comment... (type @ to mention someone)"
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  paddingRight: '40px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  fontSize: 13,
                  backgroundColor: '#f7fdfc',
                  color: '#2d3748',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <button
                type="button"
                onClick={handlePaperclipClick}
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 16,
                  color: '#718096',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Attach file"
              >
                📎
              </button>
              {allUsers.length > 0 && (
                <MentionAutocomplete
                  textareaRef={textareaRef}
                  users={allUsers}
                  onSelect={() => {}}
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {!alwaysExpanded && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e0',
                    background: '#f7fdfc',
                    color: '#4a5568',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: 'none',
                  background: '#14B8A6',
                  color: 'white',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Post Comment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

