// app/tasks/page.tsx
// Global Tasks page - shows all tasks across all jobs

import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function TasksPage() {
  // Fetch all tasks with their job, brand, client, and assignee information
  const tasks = await prisma.task.findMany({
    include: {
      job: {
        include: {
          brand: {
            include: {
              client: true,
            },
          },
        },
      },
      assignees: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [
      { priority: 'desc' }, // Urgent first
      { status: 'asc' },    // Then by status
    ],
  });

  return (
    <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          All Tasks
        </h1>
        <p style={{ color: '#718096', fontSize: 15 }}>
          View and manage all tasks across all jobs.
        </p>
        <p style={{ marginTop: 16, fontSize: 14, color: '#718096' }}>
          <Link href="/jobs" style={{ color: '#4299e1', textDecoration: 'none' }}>← Jobs</Link> ·{' '}
          <Link href="/" style={{ color: '#4299e1', textDecoration: 'none' }}>Home</Link>
        </p>
      </div>

      {/* Tasks table */}
      {tasks.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', padding: 48, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <p style={{ color: '#718096', fontSize: 16 }}>No tasks found.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f7fafc' }}>
                <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13, width: 40 }}>
                  {/* Checkbox column - no header */}
                </th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                  Task
                </th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                  Job
                </th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                  Client / Brand
                </th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                  Priority
                </th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                  Due Date
                </th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                  Assignees
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const isDone = task.status === 'DONE';
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    {/* Done checkbox */}
                    <td style={{ padding: '12px 16px', textAlign: 'center', width: 40 }}>
                      <input
                        type="checkbox"
                        checked={isDone}
                        disabled
                        style={{
                          width: 18,
                          height: 18,
                          cursor: 'default',
                          accentColor: '#4299e1',
                        }}
                      />
                    </td>

                    {/* Task Title */}
                    <td style={{ padding: '12px 16px', color: isDone ? '#a0aec0' : '#2d3748', fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none' }}>
                      {task.title}
                    </td>

                  {/* Job Link */}
                  <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                    <Link
                      href={`/jobs/${task.jobId}`}
                      style={{ color: '#4299e1', textDecoration: 'none' }}
                    >
                      {task.job.jobNumber}
                    </Link>
                    <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 2 }}>
                      {task.job.title}
                    </div>
                  </td>

                  {/* Client / Brand */}
                  <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                    {task.job.brand?.client?.name && task.job.brand?.name ? (
                      <>
                        <div>{task.job.brand.client.name}</div>
                        <div style={{ fontSize: 12, color: '#a0aec0' }}>{task.job.brand.name}</div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '12px 16px', color: '#4a5568' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        backgroundColor:
                          task.priority === 'URGENT'
                            ? '#fed7d7'
                            : task.priority === 'HIGH'
                            ? '#feebc8'
                            : task.priority === 'MEDIUM'
                            ? '#e6f2ff'
                            : '#f0f4f8',
                        color:
                          task.priority === 'URGENT'
                            ? '#742a2a'
                            : task.priority === 'HIGH'
                            ? '#7c2d12'
                            : task.priority === 'MEDIUM'
                            ? '#2c5282'
                            : '#4a5568',
                      }}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>

                  {/* Assignees */}
                  <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                    {task.assignees.length === 0 ? (
                      <span style={{ color: '#a0aec0' }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {task.assignees.map((assignee) => (
                          <span
                            key={assignee.id}
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#e6f2ff',
                              color: '#2d3748',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 11,
                            }}
                          >
                            {assignee.user?.name || assignee.user?.email || 'User'}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {tasks.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f7fafc', borderRadius: 8, fontSize: 14, color: '#4a5568' }}>
          <strong>Total tasks:</strong> {tasks.length} ·{' '}
          <strong>Done:</strong> {tasks.filter((t) => t.status === 'DONE').length} ·{' '}
          <strong>Not done:</strong> {tasks.filter((t) => t.status !== 'DONE').length}
        </div>
      )}
    </main>
  );
}

