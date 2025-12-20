'use client';

// This is a Client Component (note the 'use client' directive)
// Client Components can use event handlers like onChange, onBlur, etc.

import { useState, useRef, useEffect } from 'react';
import { updateTask, addAssignee, removeAssignee } from './actions';

type Task = {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  dueDate: Date | null;
  assignees: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
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
};

type User = {
  id: string;
  email: string;
  name: string | null;
};

type TaskRowProps = {
  task: Task;
  jobId: string;
  allUsers: User[];
  currentUserId: string;
  isSelected?: boolean;
  onSelect?: () => void;
};

export default function TaskRow({
  task,
  jobId,
  allUsers,
  currentUserId,
  isSelected = false,
  onSelect,
}: TaskRowProps) {
  // Get list of user IDs already assigned to this task
  const assignedUserIds = task.assignees.map((a) => a.userId);
  
  // Filter out users who are already assigned
  const availableUsers = allUsers.filter((user) => !assignedUserIds.includes(user.id));
  const isDone = task.status === 'DONE';

  return (
    <tr
      onClick={(e) => {
        // Only select if clicking on the row itself, not on form elements
        if ((e.target as HTMLElement).tagName !== 'INPUT' && 
            (e.target as HTMLElement).tagName !== 'SELECT' && 
            (e.target as HTMLElement).tagName !== 'BUTTON' &&
            (e.target as HTMLElement).tagName !== 'TEXTAREA' &&
            !(e.target as HTMLElement).closest('form')) {
          onSelect?.();
        }
      }}
      style={{
        borderBottom: '1px solid #f0f4f8',
        cursor: onSelect ? 'pointer' : 'default',
        backgroundColor: isSelected ? '#ebf8ff' : 'transparent',
        transition: 'background-color 0.2s',
      }}
    >
      {/* Done checkbox - before title */}
      <td style={{ padding: '8px 12px', width: 40, textAlign: 'center' }}>
        <form action={updateTask} style={{ display: 'inline', margin: 0 }}>
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="jobId" value={jobId} />
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
              accentColor: '#4299e1',
            }}
            title={isDone ? 'Mark as not done' : 'Mark as done'}
          />
        </form>
      </td>

      {/* Title - editable input */}
      <td style={{ padding: '8px 12px', color: '#2d3748' }}>
        <form action={updateTask} style={{ display: 'inline' }}>
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="jobId" value={jobId} />
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

      {/* Due Date - editable */}
      <td style={{ padding: '8px 12px', color: '#4a5568' }}>
        <form action={updateTask} style={{ display: 'inline' }}>
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="jobId" value={jobId} />
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
              backgroundColor: '#ffffff',
              cursor: 'text',
              width: '100%',
            }}
          />
        </form>
      </td>

      {/* Assignees - editable with add/remove */}
      <td style={{ padding: '8px 12px', color: '#4a5568' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          {/* Show current assignees with remove buttons */}
          {task.assignees.map((assignee) => (
            <span
              key={assignee.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#e6f2ff',
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
                <input type="hidden" name="jobId" value={jobId} />
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
          
          {task.assignees.length === 0 && availableUsers.length === 0 && (
            <span style={{ color: '#a0aec0', fontSize: 12 }}>—</span>
          )}
        </div>
      </td>
    </tr>
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
  jobId: string; 
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
    formData.append('jobId', jobId);
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
          backgroundColor: '#ffffff',
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
            backgroundColor: '#ffffff',
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
                e.currentTarget.style.backgroundColor = '#f7fafc';
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

