'use client';

import { useState, useEffect, useRef } from 'react';
import { addTaskComment, uploadTaskAttachment } from '../actions';
import { useFormState } from 'react-dom';

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
};

export default function TaskDetailPanel({
  task,
  jobId,
  currentUserId,
  canEdit,
}: TaskDetailPanelProps) {
  const [state, formAction] = useFormState(addTaskComment, { success: false, error: null });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new comment is added
  useEffect(() => {
    if (state?.success && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
    }
  }, [state?.success]);
  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
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
          backgroundColor: '#f7fafc',
          padding: '40px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a0aec0',
          fontSize: 14,
          fontFamily: 'Inter, sans-serif',
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

  // Get attachments for a comment (match by timestamp - within 5 seconds)
  // TODO: Add commentId to Attachment model for proper linking
  const getCommentAttachments = (commentCreatedAt: Date | string) => {
    const commentTime = typeof commentCreatedAt === 'string' 
      ? new Date(commentCreatedAt).getTime() 
      : commentCreatedAt.getTime();
    
    return task.attachments.filter(att => {
      const attTime = typeof att.uploadedAt === 'string'
        ? new Date(att.uploadedAt).getTime()
        : att.uploadedAt.getTime();
      // Match attachments uploaded within 5 seconds of comment
      return Math.abs(attTime - commentTime) < 5000;
    });
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
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
              fontFamily: 'Inter, sans-serif',
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
                const commentAttachments = getCommentAttachments(comment.createdAt);
                return (
                  <div
                    key={comment.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f7fafc',
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
                          <div
                            key={att.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 10px',
                              backgroundColor: '#ffffff',
                              borderRadius: 6,
                              border: '1px solid #e2e8f0',
                              fontSize: 12,
                              color: '#4a5568',
                            }}
                          >
                            <span>📎</span>
                            <span>{att.filename}</span>
                          </div>
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
            backgroundColor: '#ffffff',
          }}
        >
          {state?.error && (
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
              <strong>Error:</strong> {state.error}
            </div>
          )}

          {/* Hidden attachment upload form */}
          <form action={uploadTaskAttachment} style={{ display: 'none' }}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="jobId" value={jobId} />
            <input type="hidden" name="uploadedById" value={currentUserId} />
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              accept=".pdf,.docx,.png,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.currentTarget.files && e.currentTarget.files.length > 0) {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
          </form>

          <form action={formAction}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="jobId" value={jobId} />
            <input type="hidden" name="authorId" value={currentUserId} />

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

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                name="body"
                placeholder="Add comment here..."
                required
                rows={3}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 14,
                  backgroundColor: '#e7eef3',
                  color: '#2d3748',
                  fontFamily: 'Inter, sans-serif',
                  resize: 'none',
                }}
              />

              {/* Submit Button (+) */}
              <button
                type="submit"
                style={{
                  background: '#4299e1',
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
