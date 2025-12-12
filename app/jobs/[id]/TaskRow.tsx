'use client';

// This is a Client Component (note the 'use client' directive)
// Client Components can use event handlers like onChange, onBlur, etc.

import { updateTask, addAssignee, removeAssignee } from './actions';

type Task = {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
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
      onClick={onSelect}
      style={{
        borderBottom: '1px solid #f0f4f8',
        cursor: onSelect ? 'pointer' : 'default',
        backgroundColor: isSelected ? '#ebf8ff' : 'transparent',
        transition: 'background-color 0.2s',
      }}
    >
      {/* Done checkbox - before title */}
      <td style={{ padding: '12px 16px', width: 40, textAlign: 'center' }}>
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
      <td style={{ padding: '12px 16px', color: '#2d3748' }}>
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

      {/* Priority - editable dropdown */}
      <td style={{ padding: '12px 16px', color: '#4a5568' }}>
        <form action={updateTask} style={{ display: 'inline' }}>
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="jobId" value={jobId} />
          <select
            name="priority"
            defaultValue={task.priority}
            onChange={(e) => {
              // Submit immediately when changed
              e.currentTarget.form?.requestSubmit();
            }}
            style={{
              border: '1px solid #cbd5e0',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: 14,
              color: '#4a5568',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </form>
      </td>

      {/* Due Date - editable */}
      <td style={{ padding: '12px 16px', color: '#4a5568' }}>
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
      <td style={{ padding: '12px 16px', color: '#4a5568' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Show current assignees with remove buttons */}
          {task.assignees.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
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
            </div>
          )}
          
          {/* Add new assignee dropdown */}
          {availableUsers.length > 0 && (
            <form action={addAssignee} style={{ display: 'inline' }}>
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="jobId" value={jobId} />
              <select
                name="userId"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                style={{
                  border: '1px solid #cbd5e0',
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: 12,
                  color: '#4a5568',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <option value="">+ Add assignee</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </form>
          )}
          
          {task.assignees.length === 0 && availableUsers.length === 0 && (
            <span style={{ color: '#a0aec0', fontSize: 12 }}>—</span>
          )}
        </div>
      </td>
    </tr>
  );
}

