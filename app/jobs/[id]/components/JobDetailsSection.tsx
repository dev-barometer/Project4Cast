'use client';

import { useState } from 'react';
import EditableJobBrief from '../EditableJobBrief';
import EditableResources from '../EditableResources';
import CollaboratorManager from '../CollaboratorManager';
import AttachmentManager from '../AttachmentManager';

type JobDetailsSectionProps = {
  jobId: string;
  brief: string | null;
  resourcesUrl: string | null;
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
  allAttachments: Array<{
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
  allUsers: Array<{
    id: string;
    email: string;
    name: string | null;
  }>;
  currentUserId: string;
  canEdit: boolean;
};

export default function JobDetailsSection({
  jobId,
  brief,
  resourcesUrl,
  collaborators,
  allAttachments,
  allUsers,
  currentUserId,
  canEdit,
}: JobDetailsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}
    >
      {/* Header with toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: '#f7fafc',
          borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#2d3748',
            margin: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Job Details
        </h3>
        <span
          style={{
            fontSize: 14,
            color: '#718096',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}
        >
          ▶
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '24px 20px' }}>
          {/* Brief */}
          <div style={{ marginBottom: 32 }}>
            <EditableJobBrief jobId={jobId} initialBrief={brief} canEdit={canEdit} />
          </div>

          {/* Resources/Files */}
          <div style={{ marginBottom: 32 }}>
            <EditableResources jobId={jobId} initialResourcesUrl={resourcesUrl} canEdit={canEdit} />
          </div>

          {/* Collaborators */}
          <div style={{ marginBottom: 32 }}>
            <CollaboratorManager
              jobId={jobId}
              collaborators={collaborators}
              allUsers={allUsers}
            />
          </div>

          {/* All Attachments (job + task attachments) */}
          <div>
            <AttachmentManager
              jobId={jobId}
              attachments={allAttachments}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

