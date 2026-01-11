'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if mobile and handle sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Always show on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  useEffect(() => {
    if (activeJobId && groupBy !== 'none') {
      const newExpanded = new Set(expandedGroups);
      Object.entries(groupedJobs).forEach(([key, groupJobs]) => {
        if (groupJobs.some((j) => j.id === activeJobId)) {
          newExpanded.add(key);
        }
      });
      setExpandedGroups(newExpanded);
    }
  }, [activeJobId, groupBy, groupedJobs, expandedGroups]);

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

  // Calculate header height for positioning
  const [headerHeight, setHeaderHeight] = useState(60);
  
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.getElementById('main-header');
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  return (
    <React.Fragment>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: headerHeight + 12,
            left: 12,
            zIndex: 1000,
            width: 40,
            height: 40,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="#2d3748" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
      
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: headerHeight,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
          }}
        />
      )}

      <div
        style={{
          width: isMobile ? '280px' : '320px',
          backgroundColor: '#e5f8fa',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? `calc(100vh - ${headerHeight}px)` : '100%',
          overflow: 'hidden',
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile ? (sidebarOpen ? 0 : '-280px') : 0,
          top: isMobile ? headerHeight : 0,
          bottom: 0,
          zIndex: 999,
          transition: 'left 0.3s ease-in-out',
          boxShadow: isMobile && sidebarOpen ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
        }}
      >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#e5f8fa',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#5a6579', margin: 0, fontFamily: 'Inter, sans-serif' }}>Jobs</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: 20,
                  color: '#5a6579',
                }}
              >
                ×
              </button>
            )}
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
                  backgroundColor: '#f7fdfc',
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
                    color: groupBy === 'none' ? '#14B8A6' : '#5a6579',
                    fontSize: 14,
                    
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
                    color: groupBy === 'brand' ? '#14B8A6' : '#5a6579',
                    fontSize: 14,
                    
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
                    color: groupBy === 'client' ? '#14B8A6' : '#5a6579',
                    fontSize: 14,
                    
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
                        backgroundColor: isActive ? '#cbfdee' : '#f7fdfc',
                        borderRadius: 12,
                        transition: 'all 0.2s',
                        opacity: isInactive ? 0.6 : 1,
                      }}
                    >
                        <Link
                          href={`/jobs/${job.id}`}
                          onClick={() => {
                            // Close sidebar on mobile when job is selected
                            if (isMobile) {
                              setSidebarOpen(false);
                            }
                          }}
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
                              
                              fontSize: 14,
                            }}
                          >
                            <span style={{ fontWeight: 600, color: isActive ? '#14B8A6' : '#2d3748' }}>
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
                  backgroundColor: hasActiveJob ? '#cbfdee' : 'transparent',
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
                          backgroundColor: isActive ? '#cbfdee' : '#f7fdfc',
                          borderRadius: 12,
                          transition: 'all 0.2s',
                          opacity: isInactive ? 0.6 : 1,
                        }}
                      >
                        <Link
                          href={`/jobs/${job.id}`}
                          onClick={() => {
                            // Close sidebar on mobile when job is selected
                            if (isMobile) {
                              setSidebarOpen(false);
                            }
                          }}
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
            backgroundColor: '#e5f8fa',
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
    </React.Fragment>
  );
}
