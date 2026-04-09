'use client';

import { useState, useEffect } from 'react';
import { updateTask } from './actions';
import TaskComments from './TaskComments';
import TaskMenu from './components/TaskMenu';

type Task = {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: Date | null;
  assignees: Array<{
    id: string;
    userId: string;
    user: { id: string; name: string | null; email: string } | null;
  }>;
  comments: Array<{
    id: string;
    body: string;
    createdAt: Date | string;
    author: { id: string; name: string | null; email: string } | null;
  }>;
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    uploadedAt: Date | string;
    uploadedBy: { id: string; name: string | null; email: string } | null;
  }>;
};

type MobileTaskCardProps = {
  task: Task;
  jobId: string;
  allUsers: Array<{ id: string; email: string; name: string | null }>;
  currentUserId: string;
  hasUnreadComments?: boolean;
  allJobs?: Array<{ id: string; jobNumber: string; title: string }>;
  canEdit?: boolean;
};

const PRIORITY_COLOR: Record<string, string> = {
  URGENT: '#f56565',
  HIGH: '#ed8936',
  MEDIUM: '#ecc94b',
  LOW: '#68d391',
};

function formatDueDate(date: Date | null): { text: string; overdue: boolean } | null {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const overdue = d < now;
  const text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { text, overdue };
}

function getInitials(user: { name: string | null; email: string } | null): string {
  if (!user) return '?';
  const src = user.name || user.email;
  return src
    .split(/[\s@]/)
    .filter(Boolean)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function MobileTaskCard({
  task,
  jobId,
  allUsers,
  currentUserId,
  hasUnreadComments = false,
  allJobs = [],
  canEdit = false,
}: MobileTaskCardProps) {
  const isDone = task.status === 'DONE';
  const [showComments, setShowComments] = useState(hasUnreadComments);
  const dueInfo = formatDueDate(task.dueDate);
  const commentCount = task.comments.length;

  useEffect(() => {
    if (hasUnreadComments) setShowComments(true);
  }, [hasUnreadComments]);

  const showMeta = dueInfo || task.assignees.length > 0;

  return (
    <div style={{ marginBottom: 6 }}>
      {/* Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: showComments ? '12px 12px 0 0' : 12,
          border: '1px solid var(--border-light)',
          borderBottom: showComments ? 'none' : '1px solid var(--border-light)',
          boxShadow: hasUnreadComments ? '0 0 0 2px var(--theme-100)' : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: '10px 6px 10px 12px',
            gap: 10,
            minHeight: 52,
          }}
        >
          {/* Circular checkbox */}
          <form action={updateTask} style={{ display: 'contents' }}>
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="jobId" value={jobId} />
            <input
              type="hidden"
              name="status"
              value={isDone ? 'TODO' : 'DONE'}
            />
            <button
              type="submit"
              style={{
                flexShrink: 0,
                width: 24,
                height: 24,
                marginTop: 3,
                borderRadius: '50%',
                border: isDone ? 'none' : '2px solid var(--border-medium)',
                backgroundColor: isDone ? 'var(--theme-500)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
              title={isDone ? 'Mark as not done' : 'Mark as done'}
            >
              {isDone && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M2 6.5L5 9.5L11 3.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* Priority bar */}
          <div
            style={{
              flexShrink: 0,
              width: 3,
              alignSelf: 'stretch',
              minHeight: 20,
              borderRadius: 2,
              backgroundColor: isDone
                ? 'var(--border-light)'
                : (PRIORITY_COLOR[task.priority] ?? 'var(--border-light)'),
              opacity: isDone ? 0.3 : 1,
              marginTop: 3,
              marginBottom: 3,
            }}
          />

          {/* Content: title + metadata */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <form action={updateTask}>
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="jobId" value={jobId} />
              <input
                type="text"
                name="title"
                defaultValue={task.title}
                readOnly={!canEdit}
                onBlur={(e) => {
                  if (canEdit && e.target.value !== task.title) {
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                onKeyDown={(e) => {
                  if (canEdit && e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontSize: 16,
                  width: '100%',
                  textDecoration: isDone ? 'line-through' : 'none',
                  padding: 0,
                  lineHeight: 1.4,
                  fontWeight: 500,
                  cursor: canEdit ? 'text' : 'default',
                }}
              />
            </form>

            {showMeta && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginTop: 5,
                  alignItems: 'center',
                }}
              >
                {dueInfo && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 11,
                      color:
                        dueInfo.overdue && !isDone
                          ? 'var(--error)'
                          : 'var(--text-muted)',
                      fontWeight: dueInfo.overdue && !isDone ? 600 : 400,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <rect
                        x="1"
                        y="2"
                        width="10"
                        height="9"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M4 1v2M8 1v2"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                      <path d="M1 5h10" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    {dueInfo.text}
                    {dueInfo.overdue && !isDone && ' · overdue'}
                  </span>
                )}
                {task.assignees.map((a) => (
                  <span
                    key={a.id}
                    title={a.user?.name || a.user?.email || 'Unknown'}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#0f766e',
                      backgroundColor: 'var(--theme-100)',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(a.user)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions: comment toggle + menu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              flexShrink: 0,
              marginTop: -2,
            }}
          >
            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              style={{
                position: 'relative',
                background: showComments ? 'var(--theme-50)' : 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: commentCount > 0 ? 'var(--theme-500)' : '#cbd5e0',
                minWidth: 36,
                minHeight: 36,
              }}
              title={
                commentCount === 0
                  ? 'Add comment'
                  : `${commentCount} comment${commentCount !== 1 ? 's' : ''}`
              }
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v6A1.5 1.5 0 0112.5 11H9l-3 3v-3H3.5A1.5 1.5 0 012 9.5v-6z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  fill={commentCount > 0 ? 'var(--theme-100)' : 'none'}
                />
              </svg>
              {commentCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 3,
                    right: 3,
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#0f766e',
                    lineHeight: 1,
                  }}
                >
                  {commentCount}
                </span>
              )}
            </button>

            <TaskMenu
              taskId={task.id}
              jobId={jobId}
              allJobs={allJobs}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>

      {/* Expanded comment thread */}
      {showComments && (
        <div
          style={{
            backgroundColor: 'var(--theme-50)',
            border: '1px solid var(--border-light)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            padding: '12px 14px 14px',
          }}
        >
          <TaskComments
            taskId={task.id}
            jobId={jobId}
            comments={task.comments}
            currentUserId={currentUserId}
            allUsers={allUsers}
            alwaysExpanded={true}
            attachments={task.attachments}
          />
        </div>
      )}
    </div>
  );
}
