// app/jobs/[id]/page.tsx

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import JobSidebar from '../components/JobSidebar';
import JobDetailView from './JobDetailView';
import { addTask } from './actions';

type JobPageProps = {
  params: { id: string };
};

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

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

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
      description: string | null;
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
  let allJobs: Array<{
    id: string;
    jobNumber: string;
    title: string;
    status: string;
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
  }> = [];
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
        },
      }),
      prisma.user.findMany({
        orderBy: { email: 'asc' },
      }),
      // Fetch all jobs for sidebar
      isAdmin
        ? prisma.job.findMany({
            orderBy: { jobNumber: 'asc' },
            include: {
              brand: {
                include: {
                  client: true,
                },
              },
              tasks: {
                select: {
                  id: true,
                  status: true,
                  dueDate: true,
                },
              },
            },
          })
        : prisma.job.findMany({
            where: {
              collaborators: {
                some: {
                  userId: currentUserId,
                },
              },
            },
            orderBy: { jobNumber: 'asc' },
            include: {
              brand: {
                include: {
                  client: true,
                },
              },
              tasks: {
                select: {
                  id: true,
                  status: true,
                  dueDate: true,
                },
              },
            },
          }),
    ]);
    job = result[0] as JobWithRelations | null;
    allUsers = result[1];
    allJobs = result[2] as typeof allJobs;
  } catch (error: any) {
    console.error('Database error:', error);
    dbError = error.message || 'Failed to connect to database';
    job = null;
    allUsers = [];
    allJobs = [];
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
              You don&apos;t have access to this job. You must be assigned as a collaborator to view it.
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
    <>
      <JobSidebar jobs={allJobs} isAdmin={isAdmin} currentJobId={job.id} />
      <JobDetailView
        job={job}
        allUsers={allUsers}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
    </>
  );
}

