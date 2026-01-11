'use client';

// Sortable task table component
// Handles sorting logic and renders sortable headers

import { useState, useMemo } from 'react';
import EditableTaskRow from './EditableTaskRow';

type SortField = 'title' | 'dueDate' | 'job' | 'clientBrand' | 'assignees';
type SortDirection = 'asc' | 'desc';

type Task = {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: Date | null;
  jobId: string | null;
  job?: {
    id: string;
    jobNumber: string;
    title: string;
    brand?: {
      name: string;
      client?: {
        name: string;
      } | null;
    } | null;
  } | null;
  assignees: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
  comments?: Array<{
    id: string;
    body: string;
    createdAt: Date | string;
    author: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
  attachments?: Array<{
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
  hasUnreadComments?: boolean;
};

type User = {
  id: string;
  email: string;
  name: string | null;
};

type SortableTaskTableProps = {
  tasks: Task[];
  allUsers: User[];
  currentUserId: string;
  showJobColumn?: boolean;
  showClientBrandColumn?: boolean;
  filterCurrentUserFromAssignees?: boolean;
  highlightOverdue?: boolean; // If true, highlight overdue tasks with red background
};

export default function SortableTaskTable({
  tasks,
  allUsers,
  currentUserId,
  showJobColumn = true,
  showClientBrandColumn = true,
  filterCurrentUserFromAssignees = false,
  highlightOverdue = false,
}: SortableTaskTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = useMemo(() => {
    if (!sortField) {
      // Default: completed tasks at bottom, then by priority
      return [...tasks].sort((a, b) => {
        const aDone = a.status === 'DONE';
        const bDone = b.status === 'DONE';
        if (aDone !== bDone) {
          return aDone ? 1 : -1; // Not done first
        }
        // Both same status, sort by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
      });
    }

    // Separate completed and not completed tasks
    const notDone = tasks.filter(t => t.status !== 'DONE');
    const done = tasks.filter(t => t.status === 'DONE');

    // Sort each group
    const sortGroup = (group: Task[]) => {
      return [...group].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case 'title':
            comparison = (a.title || '').localeCompare(b.title || '');
            break;

          case 'dueDate':
            if (!a.dueDate && !b.dueDate) comparison = 0;
            else if (!a.dueDate) comparison = 1; // No date goes to end
            else if (!b.dueDate) comparison = -1;
            else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            break;

          case 'job':
            // Sort by job number (handles both alphabetical and numerical parts)
            const aJobNum = a.job?.jobNumber || '';
            const bJobNum = b.job?.jobNumber || '';
            // Extract numeric and non-numeric parts for proper sorting
            const aMatch = aJobNum.match(/^([^0-9]*)(\d*)$/);
            const bMatch = bJobNum.match(/^([^0-9]*)(\d*)$/);
            const aPrefix = aMatch ? aMatch[1] : aJobNum;
            const bPrefix = bMatch ? bMatch[1] : bJobNum;
            const aNum = aMatch && aMatch[2] ? parseInt(aMatch[2], 10) : -1;
            const bNum = bMatch && bMatch[2] ? parseInt(bMatch[2], 10) : -1;
            
            if (aPrefix !== bPrefix) {
              comparison = aPrefix.localeCompare(bPrefix);
            } else {
              comparison = aNum - bNum;
            }
            // Standalone tasks (no job) go to end
            if (!a.job && b.job) comparison = 1;
            if (a.job && !b.job) comparison = -1;
            break;

          case 'clientBrand':
            const aClient = a.job?.brand?.client?.name || '';
            const bClient = b.job?.brand?.client?.name || '';
            const aBrand = a.job?.brand?.name || '';
            const bBrand = b.job?.brand?.name || '';
            
            // First sort by client, then by brand
            if (aClient !== bClient) {
              comparison = aClient.localeCompare(bClient);
            } else {
              comparison = aBrand.localeCompare(bBrand);
            }
            // Tasks without client/brand go to end
            if (!a.job?.brand && b.job?.brand) comparison = 1;
            if (a.job?.brand && !b.job?.brand) comparison = -1;
            break;

          case 'assignees':
            // Sort by first assignee's name/email
            const aAssignee = a.assignees[0]?.user?.name || a.assignees[0]?.user?.email || '';
            const bAssignee = b.assignees[0]?.user?.name || b.assignees[0]?.user?.email || '';
            comparison = aAssignee.localeCompare(bAssignee);
            // Tasks without assignees go to end
            if (a.assignees.length === 0 && b.assignees.length > 0) comparison = 1;
            if (a.assignees.length > 0 && b.assignees.length === 0) comparison = -1;
            break;

        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    };

    const sortedNotDone = sortGroup(notDone);
    const sortedDone = sortGroup(done);

    // Always return not done first, then done
    return [...sortedNotDone, ...sortedDone];
  }, [tasks, sortField, sortDirection]);

  const SortableHeader = ({ 
    field, 
    children, 
    style 
  }: { 
    field: SortField; 
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => {
    const isActive = sortField === field;
    return (
      <th
        style={{
          ...style,
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative',
          paddingRight: 24,
        }}
        onClick={() => handleSort(field)}
        title={`Click to sort by ${children}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {children}
          {isActive && (
            <span style={{ fontSize: 12, color: '#14B8A6' }}>
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  if (tasks.length === 0) {
    return (
      <div style={{ backgroundColor: '#f7fdfc', padding: 48, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
        <p style={{ color: '#718096', fontSize: 16 }}>No tasks found.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f7fdfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: 14,
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f7fdfc' }}>
            <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13, width: 40 }}>
              {/* Checkbox column - no header */}
            </th>
            <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13, width: 40 }}>
              {/* Comments arrow column - no header */}
            </th>
            <SortableHeader
              field="title"
              style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}
            >
              Task
            </SortableHeader>
            {showJobColumn && (
              <SortableHeader
                field="job"
                style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}
              >
                Job
              </SortableHeader>
            )}
            {showClientBrandColumn && (
              <SortableHeader
                field="clientBrand"
                style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}
              >
                Client / Brand
              </SortableHeader>
            )}
            <SortableHeader
              field="dueDate"
              style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}
            >
              Due Date
            </SortableHeader>
            <SortableHeader
              field="assignees"
              style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}
            >
              {filterCurrentUserFromAssignees ? 'Other Assignees' : 'Assignees'}
            </SortableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => {
            // Compute row style if needed
            let rowStyle: React.CSSProperties | undefined = undefined;
            if (highlightOverdue) {
              const isDone = task.status === 'DONE';
              const isOverdue = !isDone && task.dueDate && new Date(task.dueDate) < new Date();
              if (isOverdue) {
                rowStyle = { backgroundColor: '#fff5f5' };
              }
            }
            
            return (
              <EditableTaskRow
                key={task.id}
                task={task}
                allUsers={allUsers}
                currentUserId={currentUserId}
                showJobColumn={showJobColumn}
                showClientBrandColumn={showClientBrandColumn}
                filterCurrentUserFromAssignees={filterCurrentUserFromAssignees}
                rowStyle={rowStyle}
                hasUnreadComments={task.hasUnreadComments || false}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

