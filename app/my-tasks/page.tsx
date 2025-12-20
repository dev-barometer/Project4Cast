// app/my-tasks/page.tsx
// My Tasks page - shows only tasks assigned to the logged-in user

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import StandaloneTaskForm from '@/app/components/StandaloneTaskForm';
import SortableTaskTable from '@/app/components/SortableTaskTable';

export default async function MyTasksPage() {
  // Get authenticated user
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    // This shouldn't happen due to middleware, but handle it anyway
    redirect('/login');
  }

  // Fetch tasks assigned to the current user and all users/jobs for the form
  const [tasks, allUsers, allJobs] = await Promise.all([
    prisma.task.findMany({
      where: {
        assignees: {
          some: {
            userId: currentUserId,
          },
        },
      },
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
        { dueDate: 'asc' },   // Then by due date (earliest first)
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

  // Separate tasks into done and not done
  const doneTasks = tasks.filter((t) => t.status === 'DONE');
  const notDoneTasks = tasks.filter((t) => t.status !== 'DONE');

  // Count by priority
  const urgentCount = notDoneTasks.filter((t) => t.priority === 'URGENT').length;
  const highCount = notDoneTasks.filter((t) => t.priority === 'HIGH').length;
  const mediumCount = notDoneTasks.filter((t) => t.priority === 'MEDIUM').length;
  const lowCount = notDoneTasks.filter((t) => t.priority === 'LOW').length;

  // Count overdue tasks
  const now = new Date();
  const overdueTasks = notDoneTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now);

  return (
    <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 0 }}>
          My Tasks
        </h1>
        <StandaloneTaskForm
          allUsers={allUsers}
          allJobs={allJobs}
          currentUserId={currentUserId}
        />
      </div>

      {/* Summary Stats */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ backgroundColor: '#f7fdfc', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#2d3748' }}>{notDoneTasks.length}</div>
            <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>Not Done</div>
          </div>
          <div style={{ backgroundColor: '#f7fdfc', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#2d3748' }}>{doneTasks.length}</div>
            <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>Done</div>
          </div>
          {overdueTasks.length > 0 && (
            <div style={{ backgroundColor: '#fed7d7', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#742a2a' }}>{overdueTasks.length}</div>
              <div style={{ fontSize: 13, color: '#742a2a', marginTop: 4 }}>Overdue</div>
            </div>
          )}
          {urgentCount > 0 && (
            <div style={{ backgroundColor: '#fed7d7', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#742a2a' }}>{urgentCount}</div>
              <div style={{ fontSize: 13, color: '#742a2a', marginTop: 4 }}>Urgent</div>
            </div>
          )}
        </div>
      )}

      {/* Tasks table */}
      {tasks.length === 0 ? (
        <div style={{ backgroundColor: '#f7fdfc', padding: 48, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 8 }}>No tasks assigned to you yet.</p>
          <p style={{ color: '#a0aec0', fontSize: 14 }}>
            Create a task above or wait to be assigned to tasks on jobs.
          </p>
        </div>
      ) : (
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
          filterCurrentUserFromAssignees={true}
          highlightOverdue={true}
        />
      )}

      {/* Summary */}
      {tasks.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f7fdfc', borderRadius: 8, fontSize: 14, color: '#4a5568' }}>
          <strong>Total tasks:</strong> {tasks.length} ·{' '}
          <strong>Done:</strong> {doneTasks.length} ·{' '}
          <strong>Not done:</strong> {notDoneTasks.length}
          {overdueTasks.length > 0 && (
            <> · <strong style={{ color: '#e53e3e' }}>Overdue:</strong> <span style={{ color: '#e53e3e' }}>{overdueTasks.length}</span></>
          )}
          {urgentCount > 0 && (
            <> · <strong style={{ color: '#742a2a' }}>Urgent:</strong> <span style={{ color: '#742a2a' }}>{urgentCount}</span></>
          )}
        </div>
      )}
    </main>
  );
}

