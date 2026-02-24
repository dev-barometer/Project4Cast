'use client';

import { useState, useEffect } from 'react';
import SortableTaskTable from '@/app/components/SortableTaskTable';
import TasksCalendar from './TasksCalendar';

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

type MyTasksViewToggleProps = {
  tasks: Task[];
  allUsers: any[];
  currentUserId: string;
  tasksWithUnreadComments: Set<string>;
};

export default function MyTasksViewToggle({ tasks, allUsers, currentUserId, tasksWithUnreadComments }: MyTasksViewToggleProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Load view mode from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('my-tasks-view-mode');
    if (savedView === 'calendar' || savedView === 'list') {
      setViewMode(savedView);
    }
  }, []);

  // Save view mode to localStorage
  const handleViewChange = (mode: 'list' | 'calendar') => {
    setViewMode(mode);
    localStorage.setItem('my-tasks-view-mode', mode);
  };

  if (tasks.length === 0) {
    return (
      <div style={{ backgroundColor: '#f7fdfc', padding: 48, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
        <p style={{ color: '#718096', fontSize: 16, marginBottom: 8 }}>No active tasks assigned to you.</p>
        <p style={{ color: '#a0aec0', fontSize: 14 }}>
          Create a task above or wait to be assigned to tasks on jobs.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Toggle Buttons */}
      <div style={{ display: 'flex', gap: 4, border: '1px solid #e2e8f0', borderRadius: 8, padding: 2, marginBottom: 24, width: 'fit-content' }}>
        <button
          onClick={() => handleViewChange('list')}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: 'none',
            background: viewMode === 'list' ? '#14B8A6' : 'transparent',
            color: viewMode === 'list' ? '#ffffff' : '#4a5568',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: viewMode === 'list' ? 600 : 400,
            transition: 'all 0.2s',
          }}
        >
          List
        </button>
        <button
          onClick={() => handleViewChange('calendar')}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: 'none',
            background: viewMode === 'calendar' ? '#14B8A6' : 'transparent',
            color: viewMode === 'calendar' ? '#ffffff' : '#4a5568',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: viewMode === 'calendar' ? 600 : 400,
            transition: 'all 0.2s',
          }}
        >
          Calendar
        </button>
      </div>

      {/* View Content */}
      {viewMode === 'calendar' ? (
        <TasksCalendar tasks={tasks} />
      ) : (
        <SortableTaskTable
          tasks={tasks}
          allUsers={allUsers}
          currentUserId={currentUserId}
          showJobColumn={true}
          showClientBrandColumn={false}
          filterCurrentUserFromAssignees={false}
          showAssigneesColumn={false}
          highlightOverdue={true}
        />
      )}
    </>
  );
}
