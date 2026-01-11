'use client';

// Editable task row component for use on All Tasks and My Tasks pages
// Handles tasks with or without jobId (standalone tasks)

import { useState, useRef, useEffect } from 'react';
import { updateTask, addAssignee, removeAssignee } from '@/app/tasks/actions';

import Link from 'next/link';

type Task = {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: Date | null;
  jobId: string | null;
  job?: {
    id: string;
    jobNumber: string;
    title: string;
    brand?: {
      name: string;
      client?: {
        name: string;
      } | null;
    } | null;
  } | null;
  assignees: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
  comments?: Array<{
    id: string;
    body: string;
    createdAt: Date | string;
    author: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
  attachments?: Array<{
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
};

type User = {
  id: string;
  email: string;
  name: string | null;
};

type EditableTaskRowProps = {
  task: Task;
  allUsers: User[];
  currentUserId: string;
  showJobColumn?: boolean; // Whether to show the job column
  showClientBrandColumn?: boolean; // Whether to show client/brand column
  filterCurrentUserFromAssignees?: boolean; // If true, only show other assignees (for My Tasks page)
  showAssigneesColumn?: boolean; // Whether to show the assignees column
  rowStyle?: React.CSSProperties; // Optional custom row styling (e.g., for overdue highlighting)
  hasUnreadComments?: boolean; // Whether there are unread comment notifications
};

export default function EditableTaskRow({ 
  task, 
  allUsers, 
  currentUserId,
  showJobColumn = true,
  showClientBrandColumn = true,
  filterCurrentUserFromAssignees = false,
  showAssigneesColumn = true,
  rowStyle,
  hasUnreadComments = false,
}: EditableTaskRowProps) {
  // Get list of user IDs already assigned to this task
  const assignedUserIds = task.assignees.map((a) => a.userId);
  
  // Filter out users who are already assigned
  const availableUsers = allUsers.filter((user) => !assignedUserIds.includes(user.id));
  const isDone = task.status === 'DONE';
  const jobId = task.jobId || ''; // Empty string if no jobId (for form submission)
  
  // Filter assignees if needed (for My Tasks page - show only other assignees)
  const displayAssignees = filterCurrentUserFromAssignees
    ? task.assignees.filter((a) => a.userId !== currentUserId)
    : task.assignees;

  // Comments state - auto-expand if there are unread comments
  const comments = task.comments || [];
  const [showComments, setShowComments] = useState(hasUnreadComments || false);
  
  // Update when hasUnreadComments changes
  useEffect(() => {
    if (hasUnreadComments) {
      setShowComments(true);
    }
  }, [hasUnreadComments]);

  return (
    <>
    <tr style={{ borderBottom: '1px solid #f0f4f8', ...rowStyle }}>
      {/* Done checkbox - before title */}
      <td style={{ padding: '8px 12px', width: 40, textAlign: 'center' }}>
        <form action={updateTask} style={{ display: 'inline', margin: 0 }}>
          <input type="hidden" name="taskId" value={task.id} />
          {jobId && <input type="hidden" name="jobId" value={jobId} />}
          <input
            type="hidden"
            name="status"
            id={`status-${task.id}`}
            value={isDone ? 'DONE' : 'TODO'}
          />
          <input
            type="checkbox"
            checked={isDone}
            onChange={(e) => {
              // Update the hidden input with the new status
              const hiddenInput = document.getElementById(`status-${task.id}`) as HTMLInputElement;
              if (hiddenInput) {
                hiddenInput.value = e.target.checked ? 'DONE' : 'TODO';
              }
              // Submit immediately when changed
              e.currentTarget.form?.requestSubmit();
            }}
            style={{
              width: 18,
              height: 18,
              cursor: 'pointer',
              accentColor: '#14B8A6',
            }}
            title={isDone ? 'Mark as not done' : 'Mark as done'}
          />
        </form>
      </td>

      {/* Comments arrow button - between checkbox and title */}
      <td style={{ padding: '8px 12px', width: 40, textAlign: 'center' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(!showComments);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: comments.length > 0 ? '#14B8A6' : '#cbd5e0',
          }}
          title={
            showComments 
              ? 'Hide comments' 
              : comments.length === 0 
                ? 'No comments' 
                : `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`
          }
        >
          {/* Arrow icon */}
          {comments.length > 0 ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: showComments ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="#14B8A6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: showComments ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="#cbd5e0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          )}
        </button>
      </td>

      {/* Title - editable input */}
      <td style={{ padding: '8px 12px', color: '#2d3748' }}>
        <form action={updateTask} style={{ display: 'inline' }}>
          <input type="hidden" name="taskId" value={task.id} />
          {jobId && <input type="hidden" name="jobId" value={jobId} />}
          <input
            type="text"
            name="title"
            defaultValue={task.title}
            onBlur={(e) => {
              // Submit when user clicks away (blur event)
              if (e.target.value !== task.title) {
                e.currentTarget.form?.requestSubmit();
              }
            }}
            onKeyDown={(e) => {
              // Submit on Enter key
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            style={{
              border: 'none',
              background: 'transparent',
              color: isDone ? '#a0aec0' : '#2d3748',
              fontSize: 14,
              padding: '4px 8px',
              borderRadius: 4,
              width: '100%',
              cursor: 'text',
              textDecoration: isDone ? 'line-through' : 'none',
            }}
          />
        </form>
      </td>

      {/* Job Link - only show if showJobColumn is true */}
      {showJobColumn && (
        <td style={{ padding: '8px 12px', color: '#4a5568' }}>
          {task.job && task.jobId ? (
            <>
              <Link
                href={`/jobs/${task.jobId}`}
                style={{ color: '#14B8A6', textDecoration: 'none' }}
              >
                {task.job.jobNumber}
              </Link>
              <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 2 }}>
                {task.job.title}
              </div>
            </>
          ) : (
            <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>Standalone</span>
          )}
        </td>
      )}

      {/* Client / Brand - only show if showClientBrandColumn is true */}
      {showClientBrandColumn && (
        <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
          {task.job?.brand?.client?.name && task.job?.brand?.name ? (
            <>
              <div>{task.job.brand.client.name}</div>
              <div style={{ fontSize: 12, color: '#a0aec0' }}>{task.job.brand.name}</div>
            </>
          ) : (
            '—'
          )}
        </td>
      )}

      {/* Due Date - editable */}
      <td style={{ padding: '8px 12px', color: '#4a5568' }}>
        <form action={updateTask} style={{ display: 'inline' }}>
          <input type="hidden" name="taskId" value={task.id} />
          {jobId && <input type="hidden" name="jobId" value={jobId} />}
          <input
            type="date"
            name="dueDate"
            defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
            onBlur={(e) => {
              // Submit when user clicks away
              e.currentTarget.form?.requestSubmit();
            }}
            style={{
              border: '1px solid #cbd5e0',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 13,
              color: '#4a5568',
              backgroundColor: '#f7fdfc',
              cursor: 'text',
              width: '100%',
            }}
          />
        </form>
      </td>

      {/* Assignees - editable with add/remove - only show if showAssigneesColumn is true */}
      {showAssigneesColumn && (
      <td style={{ padding: '8px 12px', color: '#4a5568' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          {/* Show current assignees with remove buttons */}
          {displayAssignees.map((assignee) => (
            <span
              key={assignee.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#cbfdee',
                color: '#2d3748',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              {assignee.user?.name || assignee.user?.email || 'User'}
              <form action={removeAssignee} style={{ display: 'inline', margin: 0 }}>
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="userId" value={assignee.userId} />
                {jobId && <input type="hidden" name="jobId" value={jobId} />}
                <button
                  type="submit"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#718096',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: 4,
                    fontSize: 14,
                    lineHeight: 1,
                  }}
                  title="Remove assignee"
                >
                  ×
                </button>
              </form>
            </span>
          ))}
          
          {/* Add new assignee button - circular with + */}
          {availableUsers.length > 0 && (
            <AssigneeDropdown
              taskId={task.id}
              jobId={jobId}
              availableUsers={availableUsers}
              addAssignee={addAssignee}
            />
          )}
          
          {displayAssignees.length === 0 && availableUsers.length === 0 && (
            <span style={{ color: '#a0aec0', fontSize: 12 }}>—</span>
          )}
        </div>
      </td>
      )}
    </tr>
    {/* Comments row - expandable */}
    {showComments && (
      <tr>
        <td colSpan={
          1 + // checkbox
          1 + // comments arrow
          1 + // title
          (showJobColumn ? 1 : 0) + // job
          (showClientBrandColumn ? 1 : 0) + // client/brand
          1 + // due date
          (showAssigneesColumn ? 1 : 0) // assignees
        } style={{ padding: 0, backgroundColor: '#f7fdfc' }}>
          <div style={{ padding: '16px 12px', borderTop: '1px solid #e2e8f0' }}>
            {comments.length === 0 ? (
              <p style={{ color: '#a0aec0', fontSize: 13, fontStyle: 'italic', margin: 0 }}>No comments yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {comments.map((comment) => (
                  <div key={comment.id} style={{ paddingBottom: 12, borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, fontSize: 13, color: '#2d3748' }}>
                        {comment.author?.name || comment.author?.email || 'Unknown'}
                      </span>
                      <span style={{ fontSize: 12, color: '#a0aec0' }}>
                        {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#4a5568', whiteSpace: 'pre-wrap' }}>
                      {comment.body}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {jobId && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#718096' }}>
                <Link href={`/jobs/${jobId}`} style={{ color: '#14B8A6', textDecoration: 'none' }}>
                  View in job → Add comment
                </Link>
              </div>
            )}
          </div>
        </td>
      </tr>
    )}
    </>
  );
}

// Assignee Dropdown Component
function AssigneeDropdown({ 
  taskId, 
  jobId, 
  availableUsers, 
  addAssignee 
}: { 
  taskId: string; 
  jobId: string | null; 
  availableUsers: User[]; 
  addAssignee: (formData: FormData) => Promise<any>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Calculate position when opening
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectUser = (userId: string) => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    if (jobId) {
      formData.append('jobId', jobId);
    }
    formData.append('userId', userId);
    addAssignee(formData);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: '1px solid #cbd5e0',
          backgroundColor: '#f7fdfc',
          color: '#4a5568',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
        title="Add assignee"
      >
        +
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            backgroundColor: '#f7fdfc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            minWidth: 200,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {availableUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectUser(user.id)}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#2d3748',
                cursor: 'pointer',
                fontSize: 13,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f7fdfc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {user.name || user.email}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

