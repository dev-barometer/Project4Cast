// app/jobs/[id]/page.tsx

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import TaskRow from './TaskRow';
import CollaboratorManager from './CollaboratorManager';
import AttachmentManager from './AttachmentManager';
import TaskForm from './TaskForm';
import EditableJobBrief from './EditableJobBrief';
import EditableResources from './EditableResources';
import { notifyTaskAssignment } from '@/lib/notifications';
import { sendTaskAssignmentEmail } from '@/lib/email';

type JobPageProps = {
  params: { id: string };
};

// server action to add a new task
async function addTask(formData: FormData) {
  'use server';

  const title = formData.get('title')?.toString().trim();
  const jobId = formData.get('jobId')?.toString();
  const priority = formData.get('priority')?.toString() || 'MEDIUM';
  const dueDate = formData.get('dueDate')?.toString();
  const assigneeIds = formData.getAll('assigneeIds').map(id => id.toString()).filter(Boolean);

  if (!title) return;

  // Validate priority
  const validPriority = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority) 
    ? priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    : 'MEDIUM';

  // Create task with optional jobId and assignees if provided
  const task = await prisma.task.create({
    data: {
      title,
      jobId: jobId || null, // null if no jobId (though this shouldn't happen on job page)
      status: 'TODO',
      priority: validPriority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignees: assigneeIds.length > 0 ? {
        create: assigneeIds.map(userId => ({ userId })),
      } : undefined,
    },
  });

  // If task has assignees and is associated with a job, automatically add assignees as collaborators
  if (jobId && assigneeIds.length > 0) {
    // Get existing collaborators for this job
    const existingCollaborators = await prisma.jobCollaborator.findMany({
      where: {
        jobId,
        userId: { in: assigneeIds },
      },
      select: { userId: true },
    });

    const existingUserIds = existingCollaborators.map(c => c.userId);
    const newCollaboratorIds = assigneeIds.filter(id => !existingUserIds.includes(id));

    // Add new collaborators
    if (newCollaboratorIds.length > 0) {
      await prisma.jobCollaborator.createMany({
        data: newCollaboratorIds.map(userId => ({
          jobId,
          userId,
          role: 'COLLABORATOR',
        })),
      });
    }
  }

  // Send notifications to assignees
  if (assigneeIds.length > 0) {
    try {
      const session = await auth();
      const actorId = session?.user?.id;
      const actor = actorId ? await prisma.user.findUnique({ where: { id: actorId } }) : null;

      // Get task and job details
      const createdTask = await prisma.task.findUnique({
        where: { id: task.id },
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
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const taskUrl = jobId ? `${baseUrl}/jobs/${jobId}` : `${baseUrl}/tasks`;

      // Notify each assignee
      for (const assigneeId of assigneeIds) {
        const assignedUser = await prisma.user.findUnique({
          where: { id: assigneeId },
        });

        if (assignedUser && createdTask) {
          // Create in-app notification
          await notifyTaskAssignment({
            userId: assigneeId,
            taskId: task.id,
            taskTitle: createdTask.title,
            jobId: createdTask.jobId,
            jobTitle: createdTask.job?.title || null,
            actorId: actorId || null,
          });

          // Send email notification
          try {
            await sendTaskAssignmentEmail({
              email: assignedUser.email,
              taskTitle: createdTask.title,
              jobTitle: createdTask.job?.title || null,
              assignerName: actor?.name || null,
              assignerEmail: actor?.email || 'System',
              taskUrl,
            });
          } catch (emailError) {
            console.error('Error sending task assignment email:', emailError);
          }
        }
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
    }
  }

  // Revalidate job page if jobId exists, otherwise revalidate task pages
  if (jobId) {
    revalidatePath(`/jobs/${jobId}`);
  } else {
    revalidatePath('/tasks');
    revalidatePath('/my-tasks');
  }
}


export default async function JobDetailPage({ params }: JobPageProps) {
  // Get authenticated user
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    // This shouldn't happen due to middleware, but handle it anyway
    return (
      <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: '#fed7d7',
            color: '#742a2a',
            padding: '20px 24px',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          You must be logged in to view this page.
        </div>
      </main>
    );
  }

  // Get user to check if they're an admin
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN';

  // Fetch job and all users in parallel
  type JobWithRelations = {
    id: string;
    jobNumber: string;
    title: string;
    status: string;
    brief: string | null;
    resourcesUrl: string | null;
    brand: {
      name: string;
      client: {
        name: string;
      } | null;
    } | null;
    tasks: Array<{
      id: string;
      title: string;
      status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      dueDate: Date | null;
      assignees: Array<{
        id: string;
        userId: string;
        user: {
          id: string;
          name: string | null;
          email: string;
        } | null;
      }>;
      comments: Array<{
        id: string;
        body: string;
        createdAt: Date;
        author: {
          id: string;
          name: string | null;
          email: string;
        } | null;
      }>;
      attachments: Array<{
        id: string;
        filename: string;
        url: string;
        mimeType: string;
        uploadedAt: Date;
        uploadedBy: {
          id: string;
          name: string | null;
          email: string;
        } | null;
      }>;
    }>;
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
    attachments: Array<{
      id: string;
      filename: string;
      url: string;
      mimeType: string;
      uploadedAt: Date;
      uploadedBy: {
        id: string;
        name: string | null;
        email: string;
      } | null;
    }>;
  };

  type User = {
    id: string;
    email: string;
    name: string | null;
  };

  let job: JobWithRelations | null = null;
  let allUsers: User[] = [];
  let dbError: string | null = null;

  try {
    const result = await Promise.all([
      prisma.job.findUnique({
        where: { id: params.id },
        include: {
          brand: {
            include: {
              client: true,
            },
          },
          tasks: {
            include: {
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
                orderBy: {
                  uploadedAt: 'desc',
                },
              },
            },
          },
          collaborators: {
            include: {
              user: true,
            },
          },
          attachments: {
            include: {
              uploadedBy: true,
            },
            orderBy: {
              uploadedAt: 'desc',
            },
          },
       //   orderBy: { createdAt: 'asc' }, // if this errors, remove it (no createdAt on Task)
        },
      }),
      prisma.user.findMany({
        orderBy: { email: 'asc' },
      }),
    ]);
    job = result[0] as JobWithRelations | null;
    allUsers = result[1];
  } catch (error: any) {
    console.error('Database error:', error);
    dbError = error.message || 'Failed to connect to database';
    job = null;
    allUsers = [];
  }

  // Show database error if connection failed
  if (dbError) {
    return (
      <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: '#fed7d7',
            color: '#742a2a',
            padding: '20px 24px',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          <strong>Database Connection Error:</strong> {dbError}
          <div style={{ marginTop: 12, fontSize: 13 }}>
            Please check your DATABASE_URL in the .env file and ensure your database is running.
          </div>
          <div style={{ marginTop: 12 }}>
            <Link href="/jobs" style={{ color: '#742a2a', textDecoration: 'underline' }}>
              ← Back to Jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!job) {
    notFound();
  }

  // Check if user has access to this job (admin or collaborator)
  if (!isAdmin) {
    const isCollaborator = job.collaborators.some(
      (collab) => collab.userId === currentUserId
    );
    
    if (!isCollaborator) {
      return (
        <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
          <div
            style={{
              backgroundColor: '#fed7d7',
              color: '#742a2a',
              padding: '20px 24px',
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            <strong>Access Denied</strong>
            <p style={{ marginTop: 8, marginBottom: 0 }}>
              You don't have access to this job. You must be assigned as a collaborator to view it.
            </p>
            <div style={{ marginTop: 12 }}>
              <Link href="/jobs" style={{ color: '#742a2a', textDecoration: 'underline' }}>
                ← Back to Jobs
              </Link>
            </div>
          </div>
        </main>
      );
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <p style={{ marginBottom: 20, fontSize: 14, color: '#718096' }}>
        <Link href="/jobs" style={{ color: '#4299e1', textDecoration: 'none' }}>← Jobs</Link>
      </p>

      {/* Job header */}
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          {job.jobNumber} — {job.title}
        </h1>
        <p style={{ marginTop: 8, color: '#718096', fontSize: 15 }}>
          Status: <strong style={{ color: '#4a5568' }}>{job.status}</strong>
        </p>
        <p style={{ marginTop: 4, fontSize: 14, color: '#a0aec0' }}>
          {job.brand?.client?.name && job.brand?.name
            ? `${job.brand.client.name} · ${job.brand.name}`
            : null}
        </p>
      </header>

      {/* Layout: left = job / tasks, right = meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
        {/* LEFT COLUMN */}
        <div>
          {/* Tasks section */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>Tasks</h2>

            {/* Enhanced task creation form */}
            <form action={addTask}>
              <input type="hidden" name="jobId" value={job.id} />
              <TaskForm
                jobId={job.id}
                allUsers={allUsers}
                currentUserId={currentUserId}
              />
            </form>

            {job.tasks.length === 0 ? (
              <p style={{ color: '#718096', padding: 24 }}>No tasks yet.</p>
            ) : (
              <table
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  fontSize: 14,
                  backgroundColor: '#ffffff',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f7fafc' }}>
                    <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13, width: 40 }}>
                      {/* Checkbox column - no header */}
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                      Title
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
                  {job.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      jobId={job.id}
                      allUsers={allUsers}
                      currentUserId={currentUserId}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Job info section */}
          <section style={{ marginBottom: 24, backgroundColor: '#ffffff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', marginBottom: 12 }}>Job Info</h3>
            <dl style={{ fontSize: 14, marginTop: 8 }}>
              <div style={{ marginBottom: 8 }}>
                <dt style={{ fontWeight: 600, color: '#4a5568', marginBottom: 2 }}>Job #</dt>
                <dd style={{ color: '#2d3748' }}>{job.jobNumber}</dd>
              </div>
              <div style={{ marginBottom: 8 }}>
                <dt style={{ fontWeight: 600, color: '#4a5568', marginBottom: 2 }}>Client</dt>
                <dd style={{ color: '#2d3748' }}>{job.brand?.client?.name ?? '—'}</dd>
              </div>
              <div style={{ marginBottom: 8 }}>
                <dt style={{ fontWeight: 600, color: '#4a5568', marginBottom: 2 }}>Brand</dt>
                <dd style={{ color: '#2d3748' }}>{job.brand?.name ?? '—'}</dd>
              </div>
            </dl>
          </section>

          {/* Collaborators - editable */}
          <section style={{ marginBottom: 24, backgroundColor: '#ffffff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', marginBottom: 12 }}>Collaborators</h3>
            <CollaboratorManager
              collaborators={job.collaborators}
              allUsers={allUsers}
              jobId={job.id}
            />
          </section>

          {/* Brief - editable */}
          <section style={{ marginBottom: 24, backgroundColor: '#ffffff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <EditableJobBrief
              jobId={job.id}
              initialBrief={job.brief}
              canEdit={isAdmin || job.collaborators.some(c => c.userId === currentUserId)}
            />
          </section>

          {/* Files - editable */}
          <section style={{ marginBottom: 24, backgroundColor: '#ffffff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <EditableResources
              jobId={job.id}
              initialResourcesUrl={job.resourcesUrl}
              canEdit={isAdmin || job.collaborators.some(c => c.userId === currentUserId)}
            />
          </section>

          {/* Job Attachments */}
          <section style={{ marginBottom: 24, backgroundColor: '#ffffff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', marginBottom: 12 }}>Attachments</h3>
            <AttachmentManager
              jobId={job.id}
              attachments={job.attachments}
              currentUserId={currentUserId}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

