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
  showToggleInTopRight?: boolean;
  alwaysExpanded?: boolean; // When true, always show content (no vertical collapse)
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
  showToggleInTopRight = false,
  alwaysExpanded = false,
}: JobDetailsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(alwaysExpanded); // Expanded if alwaysExpanded is true

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (!alwaysExpanded) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#f7fdfc',
        borderRadius: alwaysExpanded ? 0 : 8,
        border: alwaysExpanded ? 'none' : '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative',
        height: alwaysExpanded ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header - only show if not always expanded */}
      {!alwaysExpanded && (
        <button
          onClick={toggleExpanded}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            paddingRight: showToggleInTopRight ? '60px' : '20px', // Make room for top-right toggle
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#f7fdfc',
            borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#2d3748',
              margin: 0,
              
            }}
          >
            Job Details
          </h3>
          {!showToggleInTopRight && (
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
          )}
        </button>
      )}

      {/* Content - always show if alwaysExpanded, otherwise conditional */}
      {(alwaysExpanded || isExpanded) && (
        <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
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

