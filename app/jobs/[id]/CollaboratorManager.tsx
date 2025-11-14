'use client';

// Client Component for managing job collaborators
// Similar to TaskRow, but for job-level collaborators

import { addCollaborator, removeCollaborator, updateCollaboratorRole } from './actions';

type Collaborator = {
  id: string;
  userId: string;
  role: 'OWNER' | 'COLLABORATOR' | 'VIEWER';
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

type User = {
  id: string;
  email: string;
  name: string | null;
};

type CollaboratorManagerProps = {
  collaborators: Collaborator[];
  allUsers: User[];
  jobId: string;
};

export default function CollaboratorManager({
  collaborators,
  allUsers,
  jobId,
}: CollaboratorManagerProps) {
  // Get list of user IDs already assigned as collaborators
  const assignedUserIds = collaborators.map((c) => c.userId);

  // Filter out users who are already collaborators
  const availableUsers = allUsers.filter((user) => !assignedUserIds.includes(user.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Show current collaborators */}
      {collaborators.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '8px 12px',
                backgroundColor: '#f7fafc',
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <div style={{ flex: 1, color: '#2d3748' }}>
                {collaborator.user?.name || collaborator.user?.email || 'User'}
              </div>

              {/* Role dropdown */}
              <form action={updateCollaboratorRole} style={{ display: 'inline', margin: 0 }}>
                <input type="hidden" name="jobId" value={jobId} />
                <input type="hidden" name="userId" value={collaborator.userId} />
                <select
                  name="role"
                  defaultValue={collaborator.role}
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
                    marginRight: 8,
                  }}
                >
                  <option value="OWNER">OWNER</option>
                  <option value="COLLABORATOR">COLLABORATOR</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </form>

              {/* Remove button */}
              <form action={removeCollaborator} style={{ display: 'inline', margin: 0 }}>
                <input type="hidden" name="jobId" value={jobId} />
                <input type="hidden" name="userId" value={collaborator.userId} />
                <button
                  type="submit"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e53e3e',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    fontSize: 12,
                    borderRadius: 4,
                  }}
                  title="Remove collaborator"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Add new collaborator */}
      {availableUsers.length > 0 && (
        <form action={addCollaborator} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="hidden" name="jobId" value={jobId} />
          <input type="hidden" name="role" value="COLLABORATOR" />
          <select
            name="userId"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                e.currentTarget.form?.requestSubmit();
              }
            }}
            style={{
              flex: 1,
              border: '1px solid #cbd5e0',
              borderRadius: 4,
              padding: '6px 10px',
              fontSize: 13,
              color: '#4a5568',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <option value="">+ Add collaborator</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </form>
      )}

      {collaborators.length === 0 && availableUsers.length === 0 && (
        <p style={{ fontSize: 14, color: '#718096' }}>No collaborators yet.</p>
      )}
    </div>
  );
}

