'use client';

// Editable task row component for use on All Tasks and My Tasks pages
// Handles tasks with or without jobId (standalone tasks)

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
  rowStyle?: React.CSSProperties; // Optional custom row styling (e.g., for overdue highlighting)
};

export default function EditableTaskRow({ 
  task, 
  allUsers, 
  currentUserId,
  showJobColumn = true,
  showClientBrandColumn = true,
  filterCurrentUserFromAssignees = false,
  rowStyle,
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

  return (
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
                style={{ color: '#4299e1', textDecoration: 'none' }}
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

      {/* Priority - editable dropdown */}
      <td style={{ padding: '8px 12px', color: '#4a5568' }}>
        <form action={updateTask} style={{ display: 'inline' }}>
          <input type="hidden" name="taskId" value={task.id} />
          {jobId && <input type="hidden" name="jobId" value={jobId} />}
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
              backgroundColor: '#ffffff',
              cursor: 'text',
              width: '100%',
            }}
          />
        </form>
      </td>

      {/* Assignees - editable with add/remove */}
      <td style={{ padding: '8px 12px', color: '#4a5568' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Show current assignees with remove buttons */}
          {displayAssignees.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {displayAssignees.map((assignee) => (
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
            </div>
          )}
          
          {/* Add new assignee dropdown */}
          {availableUsers.length > 0 && (
            <form action={addAssignee} style={{ display: 'inline' }}>
              <input type="hidden" name="taskId" value={task.id} />
              {jobId && <input type="hidden" name="jobId" value={jobId} />}
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
          
          {displayAssignees.length === 0 && availableUsers.length === 0 && (
            <span style={{ color: '#a0aec0', fontSize: 12 }}>—</span>
          )}
        </div>
      </td>
    </tr>
  );
}

