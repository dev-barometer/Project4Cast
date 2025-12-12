'use client';

import EditableJobBrief from './EditableJobBrief';
import EditableResources from './EditableResources';
import TaskRow from './TaskRow';
import CollaboratorManager from './CollaboratorManager';
import AttachmentManager from './AttachmentManager';
import TaskForm from './TaskForm';

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

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        padding: 40,
      }}
    >
      {/* Job Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#2d3748', margin: 0, fontFamily: 'Inter, sans-serif' }}>
            {job.jobNumber} {job.title}
          </h1>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#718096',
              backgroundColor: '#edf2f7',
              padding: '4px 8px',
              borderRadius: 4,
              textTransform: 'uppercase',
            }}
          >
            {job.status}
          </span>
        </div>
        {job.brand && (
          <div style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>
            {job.brand.name}
            {job.brand.client && ` • ${job.brand.client.name}`}
          </div>
        )}
      </div>

      {/* Brief */}
      <div style={{ marginBottom: 32 }}>
        <EditableJobBrief jobId={job.id} initialBrief={job.brief} canEdit={canEdit} />
      </div>

      {/* Resources/Files */}
      <div style={{ marginBottom: 32 }}>
        <EditableResources jobId={job.id} initialResourcesUrl={job.resourcesUrl} canEdit={canEdit} />
      </div>

      {/* Collaborators */}
      <div style={{ marginBottom: 32 }}>
        <CollaboratorManager
          jobId={job.id}
          collaborators={job.collaborators}
          allUsers={allUsers}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      </div>

      {/* Attachments */}
      <div style={{ marginBottom: 32 }}>
        <AttachmentManager
          jobId={job.id}
          attachments={job.attachments}
          currentUserId={currentUserId}
          canEdit={canEdit}
        />
      </div>

      {/* Tasks */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
          Tasks
        </h2>
        {canEdit && (
          <div style={{ marginBottom: 24 }}>
            <TaskForm jobId={job.id} allUsers={allUsers} addTask={addTask} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {job.tasks.length === 0 ? (
            <p style={{ color: '#a0aec0', fontSize: 14, fontStyle: 'italic' }}>No tasks yet. {canEdit && 'Add one above.'}</p>
          ) : (
            job.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                allUsers={allUsers}
                currentUserId={currentUserId}
                canEdit={canEdit}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
