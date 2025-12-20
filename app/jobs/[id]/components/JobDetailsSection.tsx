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
}: JobDetailsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Toggle Button in Top Right (replaces × close button) */}
      {showToggleInTopRight && (
        <button
          type="button"
          onClick={toggleExpanded}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: isExpanded ? '#E6FFFA' : '#f7fafc',
            color: '#2d3748',
            fontSize: 16,
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            zIndex: 20,
            transition: 'all 0.2s',
          }}
          title={isExpanded ? 'Collapse job details' : 'Expand job details'}
        >
          {isExpanded ? '◀' : '▶'}
        </button>
      )}

      {/* Header with toggle */}
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

