'use client';

// Standalone task creation form component
// Can create tasks with or without a job association

import { useState, useRef, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { createStandaloneTask } from '@/app/tasks/actions';

type User = {
  id: string;
  email: string;
  name: string | null;
};

type Job = {
  id: string;
  jobNumber: string;
  title: string;
};

type StandaloneTaskFormProps = {
  allUsers: User[];
  allJobs?: Job[]; // Optional - if provided, user can select a job
  currentUserId: string;
};

export default function StandaloneTaskForm({ allUsers, allJobs, currentUserId }: StandaloneTaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(createStandaloneTask, { success: false, error: null });

  // Reset form on successful submission
  useEffect(() => {
    if (state?.success && isExpanded) {
      setTitle('');
      setDueDate('');
      setSelectedJobId('');
      setIsExpanded(false);
    }
  }, [state?.success, isExpanded]);

  return (
    <div style={{ display: 'inline-block' }}>
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid #cbd5e0',
            background: '#ffffff',
            color: '#4299e1',
            fontSize: 18,
            cursor: 'pointer',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
          }}
          title="Add Task"
        >
          +
        </button>
      ) : (
        <form action={formAction} ref={formRef}>
          <div
            style={{
              backgroundColor: '#f7fafc',
              padding: 20,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Error message */}
            {state?.error && (
              <div
                style={{
                  backgroundColor: '#fed7d7',
                  color: '#742a2a',
                  padding: '12px 16px',
                  borderRadius: 6,
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                <strong>Error:</strong> {state.error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label
                  htmlFor="standalone-task-title"
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
                  id="standalone-task-title"
                  type="text"
                  name="title"
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

              {/* Job Selection (optional) */}
              {allJobs && allJobs.length > 0 && (
                <div>
                  <label
                    htmlFor="standalone-task-job"
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#4a5568',
                      marginBottom: 6,
                    }}
                  >
                    Associate with Job (optional)
                  </label>
                  <select
                    id="standalone-task-job"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
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
                    <option value="">No job (standalone task)</option>
                    {allJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.jobNumber} - {job.title}
                      </option>
                    ))}
                  </select>
                  {/* Hidden input for jobId - only if selected */}
                  {selectedJobId && (
                    <input type="hidden" name="jobId" value={selectedJobId} />
                  )}
                </div>
              )}

              {/* Due Date */}
              <div>
                <label
                  htmlFor="standalone-task-due-date"
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
                  id="standalone-task-due-date"
                  type="date"
                  name="dueDate"
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

              {/* Hidden input: Automatically assign to current user (not shown in UI) */}
              <input type="hidden" name="assigneeIds" value={currentUserId} />

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setTitle('');
                    setDueDate('');
                    setSelectedJobId('');
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
                  type="submit"
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
        </form>
      )}
    </div>
  );
}

