'use client';

import { useState } from 'react';
import TaskRow from './TaskRow';
import TaskForm from './TaskForm';
import JobDetailsSection from './components/JobDetailsSection';
import TaskDetailPanel from './components/TaskDetailPanel';

type JobDetailViewProps = {
  job: {
    id: string;
    jobNumber: string;
    title: string;
    status: string;
    brief: string | null;
    resourcesUrl: string | null;
    brand: {
      name: string;
      client: {
        name: string;
      } | null;
    } | null;
    tasks: Array<{
      id: string;
      title: string;
      description: string | null;
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
        createdAt: Date;
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
        uploadedAt: Date;
        uploadedBy: {
          id: string;
          name: string | null;
          email: string;
        } | null;
      }>;
    }>;
    collaborators: Array<{
      id: string;
      userId: string;
      role: 'OWNER' | 'COLLABORATOR' | 'VIEWER';
      user: {
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
      uploadedAt: Date;
      uploadedBy: {
        id: string;
        name: string | null;
        email: string;
      } | null;
    }>;
  };
  allUsers: Array<{
    id: string;
    email: string;
    name: string | null;
  }>;
  currentUserId: string;
  isAdmin: boolean;
  addTask: (formData: FormData) => Promise<void>;
};

export default function JobDetailView({
  job,
  allUsers,
  currentUserId,
  isAdmin,
  addTask,
}: JobDetailViewProps) {
  const canEdit = isAdmin || job.collaborators.some(c => c.userId === currentUserId && c.role !== 'VIEWER');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(true);

  // Get selected task
  const selectedTask = selectedTaskId
    ? job.tasks.find(t => t.id === selectedTaskId) || null
    : null;

  // Combine all attachments (job + task attachments) for Job Details section
  const allAttachments = [
    ...job.attachments,
    ...job.tasks.flatMap(task => task.attachments),
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Top Section: Job Title Area (Full Width) */}
      <div
        style={{
          padding: '32px 40px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#2d3748',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {job.jobNumber}
          </span>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#2d3748',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.3,
            }}
          >
            {job.title}
          </span>
          {job.brand && (
            <span
              style={{
                fontSize: 14,
                color: '#718096',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.3,
              }}
            >
              {job.brand.name}
              {job.brand.client && ` • ${job.brand.client.name}`}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Section: Left (Task Table) + Right (Job Details + Task Details) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: 0,
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Left: Task Table Area */}
        <div
          style={{
            overflowY: 'auto',
            padding: '32px 40px',
            borderRight: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#2d3748',
                margin: 0,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Tasks
            </h2>
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowTaskForm((prev) => !prev)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f7fafc',
                  color: '#2d3748',
                  fontSize: 18,
                  lineHeight: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                title={showTaskForm ? 'Hide task form' : 'Add task'}
              >
                +
              </button>
            )}
          </div>
          {canEdit && showTaskForm && (
            <form action={addTask} style={{ marginBottom: 24 }}>
              <TaskForm
                jobId={job.id}
                allUsers={allUsers}
                currentUserId={currentUserId}
                forceExpanded
                onSubmitted={() => setShowTaskForm(false)}
              />
            </form>
          )}
          {job.tasks.length === 0 ? (
            <p style={{ color: '#a0aec0', fontSize: 14, fontStyle: 'italic' }}>
              No tasks yet. {canEdit && 'Add one above.'}
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th
                    style={{
                      padding: '12px 16px',
                      width: 40,
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#718096',
                      textTransform: 'uppercase',
                    }}
                  ></th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#718096',
                      textTransform: 'uppercase',
                    }}
                  >
                    Title
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#718096',
                      textTransform: 'uppercase',
                    }}
                  >
                    Due Date
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#718096',
                      textTransform: 'uppercase',
                    }}
                  >
                    Assignees
                  </th>
                </tr>
              </thead>
              <tbody>
                {job.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    jobId={job.id}
                    allUsers={allUsers}
                    currentUserId={currentUserId}
                    isSelected={selectedTaskId === task.id}
                    onSelect={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: Job Details (Top) + Task Details (Bottom) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {/* Top: Job Details (Collapsible) */}
          <div
            style={{
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <JobDetailsSection
              jobId={job.id}
              brief={job.brief}
              resourcesUrl={job.resourcesUrl}
              collaborators={job.collaborators}
              allAttachments={allAttachments}
              allUsers={allUsers}
              currentUserId={currentUserId}
              canEdit={canEdit}
            />
          </div>

          {/* Bottom: Task Details Panel */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <TaskDetailPanel
              task={selectedTask}
              jobId={job.id}
              currentUserId={currentUserId}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
