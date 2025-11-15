// app/jobs/[id]/page.tsx

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import TaskRow from './TaskRow';
import CollaboratorManager from './CollaboratorManager';
import AttachmentManager from './AttachmentManager';

type JobPageProps = {
  params: { id: string };
};

// server action to add a new task
async function addTask(formData: FormData) {
  'use server';

  const title = formData.get('title')?.toString().trim();
  const jobId = formData.get('jobId')?.toString();

  if (!title || !jobId) return;

  await prisma.task.create({
    data: {
      title,
      jobId,
      status: 'TODO',    // TaskStatus enum
      priority: 'MEDIUM' // TaskPriority enum
    },
  });

  revalidatePath(`/jobs/${jobId}`);
}


export default async function JobDetailPage({ params }: JobPageProps) {
  // Fetch job and all users in parallel
  type JobWithRelations = {
    id: string;
    jobNumber: string;
    title: string;
    status: string;
    brief: string | null;
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
    job = result[0];
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

            {/* Add task form */}
            <form
              action={addTask}
              style={{ marginTop: 12, marginBottom: 24, display: 'flex', gap: 8 }}
            >
              <input type="hidden" name="jobId" value={job.id} />
              <input
                name="title"
                placeholder="New task title"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e0',
                  fontSize: 14,
                  backgroundColor: '#ffffff',
                  color: '#2d3748',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#4299e1',
                  color: 'white',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Add Task
              </button>
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
                      currentUserId={allUsers[0]?.id || ''}
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

          {/* Brief placeholder */}
          <section style={{ marginBottom: 24, backgroundColor: '#ffffff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', marginBottom: 12 }}>Brief</h3>
            <p style={{ fontSize: 14, marginTop: 8, color: '#4a5568', lineHeight: 1.6 }}>
              {job.brief || <em style={{ color: '#a0aec0' }}>No brief added yet.</em>}
            </p>
          </section>

          {/* Job Attachments */}
          <section style={{ marginBottom: 24, backgroundColor: '#ffffff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', marginBottom: 12 }}>Attachments</h3>
            <AttachmentManager
              jobId={job.id}
              attachments={job.attachments}
              currentUserId={allUsers[0]?.id || ''}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

