'use client';

// Enhanced task creation form component
// Allows setting title, due date, and assignees when creating a task

import { useState } from 'react';

type User = {
  id: string;
  email: string;
  name: string | null;
};

type TaskFormProps = {
  jobId: string;
  allUsers: User[];
  currentUserId: string;
  forceExpanded?: boolean;
  onSubmitted?: () => void;
};

export default function TaskForm({ jobId, allUsers, currentUserId, forceExpanded = false, onSubmitted }: TaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(forceExpanded);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div>
      {isExpanded ? (
        <div style={{ marginBottom: 24, marginTop: 16 }}>
          <div
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
                  name="title"
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
                  name="dueDate"
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
                            border: `1px solid ${isSelected ? '#06B6D4' : '#cbd5e0'}`,
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

              {/* Hidden fields */}
              <input type="hidden" name="jobId" value={jobId} />
              {selectedAssignees.map((id) => (
                <input key={id} type="hidden" name="assigneeIds" value={id} />
              ))}
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {!forceExpanded && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      setTitle('');
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
                )}
                <button
                  type="submit"
                  disabled={!title.trim()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: title.trim() ? '#06B6D4' : '#a0aec0',
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
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#06B6D4',
            fontSize: 20,
            cursor: 'pointer',
            fontWeight: 500,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 4,
          }}
          title="Add task"
        >
          +
        </button>
      )}
    </div>
  );
}

