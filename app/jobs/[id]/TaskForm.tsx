'use client';

// Enhanced task creation form component
// Allows setting title, priority, due date, and assignees when creating a task

import { useState, useRef } from 'react';

type User = {
  id: string;
  email: string;
  name: string | null;
};

type TaskFormProps = {
  jobId: string;
  allUsers: User[];
  currentUserId: string;
};

export default function TaskForm({ jobId, allUsers, currentUserId }: TaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    // Build form data
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('jobId', jobId);
    formData.append('priority', priority);
    if (dueDate) {
      formData.append('dueDate', dueDate);
    }
    selectedAssignees.forEach(userId => {
      formData.append('assigneeIds', userId);
    });

    // Find the parent form
    const form = formRef.current?.closest('form') as HTMLFormElement;
    if (form) {
      // Remove any existing hidden inputs from previous submissions
      const existingInputs = form.querySelectorAll('input[name="title"], input[name="priority"], input[name="dueDate"], input[name="assigneeIds"]');
      existingInputs.forEach(input => input.remove());

      // Set all form values as hidden inputs
      const titleInput = document.createElement('input');
      titleInput.type = 'hidden';
      titleInput.name = 'title';
      titleInput.value = title.trim();
      form.appendChild(titleInput);

      const priorityInput = document.createElement('input');
      priorityInput.type = 'hidden';
      priorityInput.name = 'priority';
      priorityInput.value = priority;
      form.appendChild(priorityInput);

      if (dueDate) {
        const dueDateInput = document.createElement('input');
        dueDateInput.type = 'hidden';
        dueDateInput.name = 'dueDate';
        dueDateInput.value = dueDate;
        form.appendChild(dueDateInput);
      }

      selectedAssignees.forEach(userId => {
        const assigneeInput = document.createElement('input');
        assigneeInput.type = 'hidden';
        assigneeInput.name = 'assigneeIds';
        assigneeInput.value = userId;
        form.appendChild(assigneeInput);
      });

      // Submit the form
      form.requestSubmit();

      // Reset form after submission
      setTitle('');
      setPriority('MEDIUM');
      setDueDate('');
      setSelectedAssignees([]);
      setIsExpanded(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          style={{
            padding: '10px 16px',
            borderRadius: 6,
            border: '1px solid #cbd5e0',
            background: '#ffffff',
            color: '#4299e1',
            fontSize: 14,
            cursor: 'pointer',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>+</span>
          <span>Add Task</span>
        </button>
      ) : (
        <div
          ref={formRef}
          style={{
            backgroundColor: '#f7fafc',
            padding: 20,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Title */}
            <div>
              <label
                htmlFor="task-title"
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#4a5568',
                  marginBottom: 6,
                }}
              >
                Task Title *
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter task title"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e0',
                  fontSize: 14,
                  backgroundColor: '#ffffff',
                  color: '#2d3748',
                }}
                autoFocus
              />
            </div>

            {/* Priority and Due Date Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Priority */}
              <div>
                <label
                  htmlFor="task-priority"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#4a5568',
                    marginBottom: 6,
                  }}
                >
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e0',
                    fontSize: 14,
                    backgroundColor: '#ffffff',
                    color: '#4a5568',
                    cursor: 'pointer',
                  }}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="task-due-date"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#4a5568',
                    marginBottom: 6,
                  }}
                >
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e0',
                    fontSize: 14,
                    backgroundColor: '#ffffff',
                    color: '#4a5568',
                    cursor: 'text',
                  }}
                />
              </div>
            </div>

            {/* Assignees */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#4a5568',
                  marginBottom: 6,
                }}
              >
                Assignees
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: 6,
                  border: '1px solid #cbd5e0',
                  minHeight: 44,
                }}
              >
                {allUsers.length === 0 ? (
                  <span style={{ color: '#a0aec0', fontSize: 13 }}>No users available</span>
                ) : (
                  allUsers.map((user) => {
                    const isSelected = selectedAssignees.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleAssignee(user.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 4,
                          border: `1px solid ${isSelected ? '#4299e1' : '#cbd5e0'}`,
                          background: isSelected ? '#e6f2ff' : '#ffffff',
                          color: isSelected ? '#2d3748' : '#4a5568',
                          fontSize: 13,
                          cursor: 'pointer',
                          fontWeight: isSelected ? 500 : 'normal',
                        }}
                      >
                        {user.name || user.email}
                      </button>
                    );
                  })
                )}
              </div>
              {selectedAssignees.length > 0 && (
                <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                  {selectedAssignees.length} {selectedAssignees.length === 1 ? 'person' : 'people'} selected
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setPriority('MEDIUM');
                  setDueDate('');
                  setSelectedAssignees([]);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e0',
                  background: '#ffffff',
                  color: '#4a5568',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!title.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: title.trim() ? '#4299e1' : '#a0aec0',
                  color: 'white',
                  fontSize: 14,
                  cursor: title.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 500,
                }}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

