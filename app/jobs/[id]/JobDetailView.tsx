'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormState } from 'react-dom';
import TaskRow from './TaskRow';
import TaskForm from './TaskForm';
import JobDetailsSection from './components/JobDetailsSection';
import TaskDetailPanel from './components/TaskDetailPanel';
import EditableJobTitle from './EditableJobTitle';
import { addTask } from './actions';

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
};

export default function JobDetailView({
  job,
  allUsers,
  currentUserId,
  isAdmin,
}: JobDetailViewProps) {
  // User can edit if they're admin/owner OR if they're a collaborator (not VIEWER)
  const canEdit = isAdmin || job.collaborators.some(c => c.userId === currentUserId && c.role !== 'VIEWER');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Use useFormState for better error handling
  const [state, formAction] = useFormState(addTask, { success: false, error: null });
  
  // Hide form and refresh page when task is successfully created
  useEffect(() => {
    if (state?.success) {
      setShowTaskForm(false);
      // Refresh the page to show the new task
      window.location.reload();
    }
  }, [state?.success]);

  // Get selected task
  const selectedTask = selectedTaskId
    ? job.tasks.find(t => t.id === selectedTaskId) || null
    : null;

  // Auto-open right panel when a task is selected
  useEffect(() => {
    if (selectedTaskId) {
      setIsRightPanelOpen(true);
    }
  }, [selectedTaskId]);

  // Handle task selection - toggle selection if clicking same task
  const handleTaskSelect = (taskId: string) => {
    if (selectedTaskId === taskId) {
      // Deselecting - keep panel open to show job details
      setSelectedTaskId(null);
    } else {
      // Selecting new task - will auto-open panel via useEffect
      setSelectedTaskId(taskId);
    }
  };

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
        backgroundColor: '#f7fdfc',
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
          <EditableJobTitle
            jobId={job.id}
            initialJobNumber={job.jobNumber}
            initialTitle={job.title}
            canEdit={canEdit}
          />
          {job.brand && (
            <span
              style={{
                fontSize: 14,
                color: '#718096',
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
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
        }}
      >
        {/* Left: Task Table Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 40px',
            transition: 'margin-right 0.3s ease-in-out',
            marginRight: isRightPanelOpen ? '400px' : '0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#2d3748',
                  margin: 0,
                  
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
                    background: '#f7fdfc',
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
            {/* Toggle Right Panel Button - All the way to the right */}
            <button
              type="button"
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: isRightPanelOpen ? '#cbfdee' : '#f7fdfc',
                color: '#2d3748',
                fontSize: 16,
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.2s',
              }}
              title={isRightPanelOpen ? 'Hide job details' : 'Show job details'}
            >
              {isRightPanelOpen ? '▶' : '◀'}
            </button>
          </div>
          {canEdit && showTaskForm && (
            <div style={{ marginBottom: 24 }}>
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
              <form 
                ref={formRef}
                action={formAction}
              >
                <TaskForm
                  jobId={job.id}
                  allUsers={allUsers}
                  currentUserId={currentUserId}
                  forceExpanded
                  onSubmitted={() => {
                    setShowTaskForm(false);
                  }}
                />
              </form>
            </div>
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
                    onSelect={() => handleTaskSelect(task.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: Job Details (Top) + Task Details (Bottom) - Accordion from Right */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '400px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#f7fdfc',
            borderLeft: '1px solid #e2e8f0',
            transform: isRightPanelOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            zIndex: 10,
            boxShadow: isRightPanelOpen ? '-2px 0 8px rgba(0, 0, 0, 0.1)' : 'none',
          }}
        >
          {/* Top: Job Details (Collapsible) */}
          <div
            style={{
              borderBottom: '1px solid #e2e8f0',
              position: 'relative',
              zIndex: 1,
            }}
            onClick={(e) => e.stopPropagation()}
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
              showToggleInTopRight={true}
            />
          </div>

          {/* Bottom: Task Details Panel */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <TaskDetailPanel
              task={selectedTask}
              jobId={job.id}
              currentUserId={currentUserId}
              canEdit={canEdit}
              allUsers={allUsers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
