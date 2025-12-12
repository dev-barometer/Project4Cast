'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThreeDotMenuHorizontal } from '@/app/components/ThreeDotMenu';
import Image from 'next/image';
import JobMenu from './JobMenu';

type Job = {
  id: string;
  jobNumber: string;
  title: string;
  status: string; // JobStatus - ARCHIVED means inactive
  brand: {
    name: string;
    client: {
      name: string;
    } | null;
  } | null;
  tasks: Array<{
    id: string;
    status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
    dueDate: Date | string | null;
  }>;
};

type JobSidebarProps = {
  jobs: Job[];
  isAdmin: boolean;
  currentJobId?: string;
};

type GroupByOption = 'none' | 'brand' | 'client';

// Calculate task status indicator for a job
function getTaskStatusIndicator(job: Job): 'new' | 'overdue' | 'none' {
  const now = new Date();
  const activeTasks = job.tasks.filter((t) => t.status !== 'DONE');
  
  if (activeTasks.length === 0) {
    return 'none';
  }

  // Check for overdue tasks
  const hasOverdue = activeTasks.some((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < now;
  });

  if (hasOverdue) {
    return 'overdue';
  }

  // If there are active tasks but none overdue, consider them "new"
  return 'new';
}

export default function JobSidebar({ jobs, isAdmin, currentJobId }: JobSidebarProps) {
  const pathname = usePathname();
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showInactive, setShowInactive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Use prop if provided, otherwise extract from pathname
  const activeJobId = currentJobId || pathname?.split('/jobs/')[1]?.split('/')[0];

  // Filter jobs based on active/inactive
  const filteredJobs = useMemo(() => {
    if (showInactive) {
      return jobs;
    }
    return jobs.filter((job) => job.status !== 'ARCHIVED');
  }, [jobs, showInactive]);

  // Group jobs based on selected option
  const groupedJobs = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Jobs': filteredJobs };
    }

    const groups: Record<string, Job[]> = {};

    if (groupBy === 'brand') {
      filteredJobs.forEach((job) => {
        const key = job.brand?.name || 'Unassigned';
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(job);
      });
    } else if (groupBy === 'client') {
      filteredJobs.forEach((job) => {
        const key = job.brand?.client?.name || 'Unassigned';
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(job);
      });
    }

    // Sort groups alphabetically
    const sortedGroups: Record<string, Job[]> = {};
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  }, [filteredJobs, groupBy]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Auto-expand groups that contain the current job
  useMemo(() => {
    if (activeJobId && groupBy !== 'none') {
      const newExpanded = new Set(expandedGroups);
      Object.entries(groupedJobs).forEach(([key, groupJobs]) => {
        if (groupJobs.some((j) => j.id === activeJobId)) {
          newExpanded.add(key);
        }
      });
      setExpandedGroups(newExpanded);
    }
  }, [activeJobId, groupBy, groupedJobs]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div
      style={{
        width: 320,
        backgroundColor: '#e7eef3',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#e7eef3',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#5a6579', margin: 0, fontFamily: 'Inter, sans-serif' }}>Jobs</h2>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 2px',
              }}
            >
              <ThreeDotMenuHorizontal />
            </button>
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  backgroundColor: '#ffffff',
                  borderRadius: 8,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  minWidth: 180,
                  zIndex: 1000,
                }}
              >
                <button
                  onClick={() => {
                    setGroupBy('none');
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    color: groupBy === 'none' ? '#4299e1' : '#5a6579',
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    fontWeight: groupBy === 'none' ? 600 : 400,
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setGroupBy('brand');
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    color: groupBy === 'brand' ? '#4299e1' : '#5a6579',
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    fontWeight: groupBy === 'brand' ? 600 : 400,
                  }}
                >
                  Brand
                </button>
                <button
                  onClick={() => {
                    setGroupBy('client');
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    color: groupBy === 'client' ? '#4299e1' : '#5a6579',
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    fontWeight: groupBy === 'client' ? 600 : 400,
                  }}
                >
                  Client
                </button>
                {isAdmin && (
                  <>
                    <div style={{ marginTop: 4, marginBottom: 4 }} />
                    <Link
                      href="/jobs/new"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        color: '#5a6579',
                        fontSize: 14,
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      New Job
                    </Link>
                  </>
                )}
                <div style={{ marginTop: 4, marginBottom: 4 }} />
                <button
                  onClick={() => {
                    setShowInactive(!showInactive);
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    color: '#5a6579',
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={() => setShowInactive(!showInactive)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Show inactive</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {Object.entries(groupedJobs).map(([groupKey, groupJobs]) => {
          // If grouping is 'none', just show jobs directly
          if (groupBy === 'none') {
            return (
              <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groupJobs.map((job) => {
                  const isActive = job.id === activeJobId;
                  const taskStatus = getTaskStatusIndicator(job);
                  const isInactive = job.status === 'ARCHIVED';

                  return (
                    <div
                      key={job.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: isActive ? '#ebf8ff' : '#ffffff',
                        borderRadius: 12,
                        transition: 'all 0.2s',
                        opacity: isInactive ? 0.6 : 1,
                      }}
                    >
                      <Link
                        href={`/jobs/${job.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: 0,
                          textDecoration: 'none',
                          gap: 8,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontFamily: 'Inter, sans-serif',
                              fontSize: 14,
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#2d3748' }}>
                              {job.jobNumber}
                            </span>{' '}
                            <span style={{ fontWeight: 400, color: '#5a6579' }}>
                              {job.title}
                            </span>
                          </div>
                        </div>
                        {/* Status dot */}
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor:
                              taskStatus === 'new'
                                ? '#48bb78'
                                : taskStatus === 'overdue'
                                ? '#f56565'
                                : 'transparent',
                            border:
                              taskStatus === 'none'
                                ? '2px solid #cbd5e0'
                                : 'none',
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        />
                      </Link>
                      <JobMenu
                        jobId={job.id}
                        jobNumber={job.jobNumber}
                        jobStatus={job.status}
                        onMoveTo={() => {
                          // TODO: Implement move to brand/client
                          console.log('Move job', job.id);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          }

          // If grouping, show collapsible folders
          const isExpanded = expandedGroups.has(groupKey);
          const hasActiveJob = groupJobs.some((j) => j.id === activeJobId);

          return (
            <div key={groupKey} style={{ marginBottom: 8 }}>
              {/* Folder Header */}
              <button
                onClick={() => toggleGroup(groupKey)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  textAlign: 'left',
                  backgroundColor: hasActiveJob ? '#ebf8ff' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: hasActiveJob ? '#2d3748' : '#4a5568',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    fontSize: 10,
                  }}
                >
                  ▶
                </span>
                <span style={{ flex: 1 }}>
                  {groupKey} ({groupJobs.length})
                </span>
              </button>

              {/* Folder Contents */}
              {isExpanded && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 8 }}>
                  {groupJobs.map((job) => {
                    const isActive = job.id === activeJobId;
                    const taskStatus = getTaskStatusIndicator(job);
                    const isInactive = job.status === 'ARCHIVED';

                    return (
                      <div
                        key={job.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: isActive ? '#ebf8ff' : '#ffffff',
                          borderRadius: 12,
                          transition: 'all 0.2s',
                          opacity: isInactive ? 0.6 : 1,
                        }}
                      >
                        <Link
                          href={`/jobs/${job.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            flex: 1,
                            minWidth: 0,
                            textDecoration: 'none',
                            gap: 8,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: 14,
                              }}
                            >
                              <span style={{ fontWeight: 600, color: '#2d3748' }}>
                                {job.jobNumber}
                              </span>{' '}
                              <span style={{ fontWeight: 400, color: '#5a6579' }}>
                                {job.title}
                              </span>
                            </div>
                          </div>
                          {/* Status dot */}
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor:
                                taskStatus === 'new'
                                  ? '#48bb78'
                                  : taskStatus === 'overdue'
                                  ? '#f56565'
                                  : 'transparent',
                              border:
                                taskStatus === 'none'
                                  ? '2px solid #cbd5e0'
                                  : 'none',
                              flexShrink: 0,
                              marginLeft: 8,
                            }}
                          />
                        </Link>
                        <JobMenu
                          jobId={job.id}
                          jobNumber={job.jobNumber}
                          jobStatus={job.status}
                          onMoveTo={() => {
                            // TODO: Implement move to brand/client
                            console.log('Move job', job.id);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#e7eef3',
          }}
        >
          <Link
            href="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
              color: '#5a6579',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Image
              src="/gear.svg"
              alt="Admin"
              width={18}
              height={18}
              style={{ opacity: 0.7 }}
            />
            <span>Admin</span>
          </Link>
        </div>
      )}
    </div>
  );
}
