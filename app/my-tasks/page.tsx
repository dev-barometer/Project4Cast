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
  const [tasks, allUsers, allJobs, unreadCommentNotifications] = await Promise.all([
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
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        attachments: {
          include: {
            uploadedBy: true,
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
    // Fetch unread comment notifications for this user
    prisma.notification.findMany({
      where: {
        userId: currentUserId,
        read: false,
        type: 'COMMENT_MENTION',
      },
      select: {
        taskId: true,
      },
    }),
  ]);

  // Create a Set of task IDs with unread comments
  const tasksWithUnreadComments = new Set(
    unreadCommentNotifications
      .filter(n => n.taskId)
      .map(n => n.taskId!)
  );

  // Filter out completed tasks - only show tasks that are not done
  const activeTasks = tasks.filter((t) => t.status !== 'DONE');
  
  // Separate tasks into done and not done for stats
  const doneTasks = tasks.filter((t) => t.status === 'DONE');
  const notDoneTasks = tasks.filter((t) => t.status !== 'DONE');

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

      {/* Tasks table - only show active (not done) tasks */}
      {activeTasks.length === 0 ? (
        <div style={{ backgroundColor: '#f7fdfc', padding: 48, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
          <p style={{ color: '#718096', fontSize: 16, marginBottom: 8 }}>No active tasks assigned to you.</p>
          <p style={{ color: '#a0aec0', fontSize: 14 }}>
            Create a task above or wait to be assigned to tasks on jobs.
          </p>
        </div>
      ) : (
        <SortableTaskTable
          tasks={activeTasks.map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            jobId: task.jobId,
            job: task.job,
            assignees: task.assignees,
            comments: task.comments,
            attachments: task.attachments,
            hasUnreadComments: tasksWithUnreadComments.has(task.id),
          }))}
          allUsers={allUsers}
          currentUserId={currentUserId}
          showJobColumn={true}
          showClientBrandColumn={false}
          filterCurrentUserFromAssignees={false}
          showAssigneesColumn={false}
          highlightOverdue={true}
        />
      )}

      {/* Summary Stats - moved to bottom */}
      {tasks.length > 0 && (
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
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
        </div>
      )}
    </main>
  );
}

