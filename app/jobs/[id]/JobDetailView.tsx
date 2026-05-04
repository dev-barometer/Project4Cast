'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import TaskRow from './TaskRow';
import MobileTaskCard from './MobileTaskCard';
import TaskForm from './TaskForm';
import JobDetailsSection from './components/JobDetailsSection';
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
  tasksWithUnreadComments?: Set<string>; // Task IDs with unread comment notifications
  allJobs?: Array<{
    id: string;
    jobNumber: string;
    title: string;
  }>;
};

export default function JobDetailView({
  job,
  allUsers,
  currentUserId,
  isAdmin,
  tasksWithUnreadComments = new Set(),
  allJobs = [],
}: JobDetailViewProps) {
  // User can edit if they're admin/owner OR if they're a collaborator (not VIEWER)
  const canEdit = isAdmin || job.collaborators.some(c => c.userId === currentUserId && c.role !== 'VIEWER');
  const router = useRouter();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [handledSuccess, setHandledSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use useFormState for better error handling
  const [state, formAction] = useFormState(addTask, { success: false, error: null });

  // Hide form and refresh data when task is successfully created.
  // Guard with handledSuccess so re-renders don't re-fire the refresh —
  // useFormState holds success=true until the next submission.
  useEffect(() => {
    if (state?.success && !handledSuccess) {
      setHandledSuccess(true);
      setShowTaskForm(false);
      router.refresh();
    }
    if (!state?.success) {
      setHandledSuccess(false);
    }
  }, [state?.success]);


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
        backgroundColor: 'var(--bg-page)',
      }}
    >
      {/* Top Section: Job Title Area */}
      <div
        style={{
          padding: isMobile ? '12px 16px 12px 64px' : '16px 24px',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginLeft: 'auto' }}>
            {job.brand?.client && (
              <span
                style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  lineHeight: 1.3,
                }}
              >
                {job.brand.client.name}
              </span>
            )}
            {job.brand && !job.brand.client && (
              <span
                style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  lineHeight: 1.3,
                }}
              >
                {job.brand.name}
              </span>
            )}
          </div>
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
            padding: isMobile ? '16px' : '20px 24px',
            paddingTop: isMobile ? '64px' : undefined,
            transition: isMobile ? 'none' : 'margin-right 0.3s ease-in-out',
            marginRight: isMobile ? '0' : (isRightPanelOpen ? '400px' : '0'),
            width: isMobile ? '100%' : 'auto',
            WebkitOverflowScrolling: 'touch',
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
                  color: 'var(--text-primary)',
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
                    width: isMobile ? 40 : 32,
                    height: isMobile ? 40 : 32,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontSize: isMobile ? 20 : 18,
                    lineHeight: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    minWidth: isMobile ? 40 : 32,
                    minHeight: isMobile ? 40 : 32,
                  }}
                  title={showTaskForm ? 'Hide task form' : 'Add task'}
                >
                  +
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              style={{
                width: isMobile ? 40 : 32,
                height: isMobile ? 40 : 32,
                borderRadius: 'var(--radius-md)',
                background: isRightPanelOpen ? 'var(--theme-100)' : 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                fontSize: isMobile ? 18 : 16,
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.2s',
                minWidth: isMobile ? 40 : 32,
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
                onSubmit={(e) => {
                  // Prevent duplicate submissions
                  const form = e.currentTarget;
                  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                  if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Creating...';
                  }
                  // Add idempotency key to prevent duplicate task creation
                  const idempotencyInput = document.createElement('input');
                  idempotencyInput.type = 'hidden';
                  idempotencyInput.name = 'idempotencyKey';
                  idempotencyInput.value = `${Date.now()}-${Math.random()}`;
                  form.appendChild(idempotencyInput);
                }}
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
            <p style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>
              No tasks yet. {canEdit && 'Add one above.'}
            </p>
          ) : isMobile ? (
            /* Mobile: card list */
            <div style={{ paddingTop: 4 }}>
              {job.tasks.map((task) => (
                <MobileTaskCard
                  key={task.id}
                  task={task}
                  jobId={job.id}
                  allUsers={allUsers}
                  currentUserId={currentUserId}
                  hasUnreadComments={tasksWithUnreadComments.has(task.id)}
                  allJobs={allJobs}
                  canEdit={canEdit}
                />
              ))}
            </div>
          ) : (
            /* Desktop: table */
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-light)' }}>
                    <th
                      style={{
                        padding: '12px 16px',
                        width: 40,
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {/* Menu column */}
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        width: 40,
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {/* Checkbox column */}
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        width: 40,
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {/* Arrow column */}
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Title
                    </th>
                    {!isMobile && (
                      <>
                        <th
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--text-muted)',
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
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Assignees
                        </th>
                      </>
                    )}
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
                      hasUnreadComments={tasksWithUnreadComments.has(task.id)}
                      allJobs={allJobs}
                      canEdit={canEdit}
                      isMobile={isMobile}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Job Details Panel - Accordion from Right */}
        {isMobile && isRightPanelOpen && (
          <div
            onClick={() => setIsRightPanelOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 997,
            }}
          />
        )}
        <div
          style={{
            position: isMobile ? 'fixed' : 'absolute',
            right: 0,
            top: isMobile ? 0 : 0,
            bottom: 0,
            width: isMobile ? '100%' : '400px',
            maxWidth: isMobile ? '100%' : '400px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-card)',
            borderLeft: '1px solid var(--border-light)',
            transform: isRightPanelOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            zIndex: isMobile ? 998 : 10,
            boxShadow: isRightPanelOpen && !isMobile ? 'var(--shadow-lg)' : 'none',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isMobile && (
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Job Details</h3>
                <button
                  onClick={() => setIsRightPanelOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 28,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '8px',
                    lineHeight: 1,
                    minWidth: 44,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            )}
            <JobDetailsSection
              jobId={job.id}
              brief={job.brief}
              resourcesUrl={job.resourcesUrl}
              collaborators={job.collaborators}
              allAttachments={allAttachments}
              allUsers={allUsers}
              currentUserId={currentUserId}
              canEdit={canEdit}
              showToggleInTopRight={false}
              alwaysExpanded={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
