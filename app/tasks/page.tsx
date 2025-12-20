// app/tasks/page.tsx
// Global Tasks page - shows all tasks (with or without jobs)

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/auth';
import StandaloneTaskForm from '@/app/components/StandaloneTaskForm';
import SortableTaskTable from '@/app/components/SortableTaskTable';

export default async function TasksPage() {
  // Get authenticated user
  const session = await auth();
  const currentUserId = session?.user?.id || '';

  // Fetch all tasks with their job, brand, client, and assignee information
  const [tasks, allUsers, allJobs] = await Promise.all([
    prisma.task.findMany({
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
    }),
    prisma.user.findMany({
      orderBy: { email: 'asc' },
    }),
    prisma.job.findMany({
      select: {
        id: true,
        jobNumber: true,
        title: true,
      },
      orderBy: { jobNumber: 'asc' },
    }),
  ]);

  return (
    <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          All Tasks
        </h1>
        <p style={{ color: '#718096', fontSize: 15 }}>
          View and manage all tasks. Tasks can be associated with jobs or standalone.
        </p>
        <p style={{ marginTop: 16, fontSize: 14, color: '#718096' }}>
          <Link href="/jobs" style={{ color: '#14B8A6', textDecoration: 'none' }}>← Jobs</Link> ·{' '}
          <Link href="/my-tasks" style={{ color: '#14B8A6', textDecoration: 'none' }}>My Tasks</Link> ·{' '}
          <Link href="/" style={{ color: '#14B8A6', textDecoration: 'none' }}>Home</Link>
        </p>
      </div>

      {/* Task Creation Form */}
      <StandaloneTaskForm
        allUsers={allUsers}
        allJobs={allJobs}
        currentUserId={currentUserId}
      />

      {/* Tasks table */}
      <SortableTaskTable
        tasks={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          jobId: task.jobId,
          job: task.job,
          assignees: task.assignees,
        }))}
        allUsers={allUsers}
        currentUserId={currentUserId}
        showJobColumn={true}
        showClientBrandColumn={true}
        filterCurrentUserFromAssignees={false}
      />

      {/* Summary */}
      {tasks.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f7fdfc', borderRadius: 8, fontSize: 14, color: '#4a5568' }}>
          <strong>Total tasks:</strong> {tasks.length} ·{' '}
          <strong>Done:</strong> {tasks.filter((t) => t.status === 'DONE').length} ·{' '}
          <strong>Not done:</strong> {tasks.filter((t) => t.status !== 'DONE').length}
        </div>
      )}
    </main>
  );
}

