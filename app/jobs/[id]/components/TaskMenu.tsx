'use client';

import { useState, useRef, useEffect } from 'react';
import { ThreeDotMenu } from '@/app/components/ThreeDotMenu';
import { moveTask, deleteTask } from '../actions';

type TaskMenuProps = {
  taskId: string;
  jobId: string;
  allJobs: Array<{
    id: string;
    jobNumber: string;
    title: string;
  }>;
  canEdit: boolean;
};

export default function TaskMenu({ taskId, jobId, allJobs, canEdit }: TaskMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMoveDialog(false);
      }
    };

    if (isOpen || showMoveDialog) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, showMoveDialog]);

  const handleMove = async () => {
    if (!selectedJobId) {
      alert('Please select a job');
      return;
    }

    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('newJobId', selectedJobId);
    formData.append('currentJobId', jobId);

    const result = await moveTask(formData);
    if (result.success) {
      setIsOpen(false);
      setShowMoveDialog(false);
      window.location.reload();
    } else {
      alert(result.error || 'Failed to move task');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('jobId', jobId);

    const result = await deleteTask(formData);
    if (result.success) {
      setIsOpen(false);
      window.location.reload();
    } else {
      alert(result.error || 'Failed to delete task');
    }
  };

  // Filter out the current job from the list
  const availableJobs = allJobs.filter(job => job.id !== jobId);

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 2px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
          title="Task options"
        >
          <ThreeDotMenu />
        </button>

        {isOpen && !showMoveDialog && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              backgroundColor: '#f7fdfc',
              borderRadius: 8,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: 200,
              zIndex: 1000,
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMoveDialog(true);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                color: '#2d3748',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Move task...
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                color: '#e53e3e',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Delete task
            </button>
          </div>
        )}

        {showMoveDialog && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              backgroundColor: '#f7fdfc',
              borderRadius: 8,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: 250,
              zIndex: 1000,
              padding: '16px',
            }}
          >
            <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: '#2d3748' }}>
              Move task to:
            </div>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                backgroundColor: '#fff',
                fontSize: 14,
                color: '#2d3748',
                marginBottom: 12,
              }}
            >
              <option value="">Select a job...</option>
              {availableJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.jobNumber} - {job.title}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMoveDialog(false);
                  setSelectedJobId('');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#5a6579',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMove();
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#14B8A6',
                  color: '#fff',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Move
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}



