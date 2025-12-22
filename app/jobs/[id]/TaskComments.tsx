'use client';

// Client Component for displaying and adding task comments

import { addTaskComment } from './actions';
import { useState, useRef, useEffect } from 'react';
import { useFormState } from 'react-dom';
import MentionAutocomplete from '@/app/components/MentionAutocomplete';

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

type TaskCommentsProps = {
  taskId: string;
  jobId: string;
  comments: Comment[];
  currentUserId: string;
  allUsers?: User[];
};

export default function TaskComments({
  taskId,
  jobId,
  comments,
  currentUserId,
  allUsers = [],
}: TaskCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [state, formAction] = useFormState(addTaskComment, { success: false, error: null });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Clear form when comment is successfully added
  useEffect(() => {
    if (state?.success && textareaRef.current) {
      textareaRef.current.value = '';
      // Reset the form state after clearing (this will be reset on next render anyway)
    }
  }, [state?.success]);

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
        {comments.length === 0
          ? 'Add comment'
          : `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}
      </button>

      {/* Comments section */}
      {isExpanded && (
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
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 4 }}>
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
                  <div style={{ fontSize: 13, color: '#2d3748', lineHeight: 1.6 }}>
                    {comment.body}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add comment form */}
          <form action={formAction}>
            <input type="hidden" name="taskId" value={taskId} />
            <input type="hidden" name="jobId" value={jobId} />
            <input type="hidden" name="authorId" value={currentUserId} />
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
                  borderRadius: 4,
                  border: '1px solid #cbd5e0',
                  fontSize: 13,
                  backgroundColor: '#f7fdfc',
                  color: '#2d3748',
                  fontFamily: 'inherit',
                  resize: 'vertical',
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
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
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

