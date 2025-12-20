// app/page.tsx - Home page (Jobs view)

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import JobSidebar from './jobs/components/JobSidebar';

export default async function HomePage() {
  // Get authenticated user
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    redirect('/login');
  }

  // Get user to check if they're an admin
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
  type JobWithRelations = {
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
  };

  let jobs: JobWithRelations[] = [];
  let dbError: string | null = null;

  try {
    // If admin, show all jobs. Otherwise, only show jobs where user is a collaborator
    if (isAdmin) {
      jobs = await prisma.job.findMany({
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
      });
    } else {
      // Only show jobs where the user is a collaborator
      jobs = await prisma.job.findMany({
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
      });
    }
  } catch (error: any) {
    console.error('Database error:', error);
    dbError = error.message || 'Failed to connect to database';
    jobs = [];
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <JobSidebar jobs={jobs} isAdmin={isAdmin} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7fdfc',
          padding: 40,
        }}
      >
        {dbError ? (
          <div
            style={{
              backgroundColor: '#fed7d7',
              color: '#742a2a',
              padding: '20px 24px',
              borderRadius: 8,
              fontSize: 14,
              maxWidth: 600,
            }}
          >
            <strong>Database Connection Error:</strong> {dbError}
            <div style={{ marginTop: 8, fontSize: 13 }}>
              Please check your DATABASE_URL in the .env file and ensure your database is running.
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#718096' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No jobs found</h2>
            <p style={{ fontSize: 14 }}>
              {isAdmin
                ? 'Create your first job to get started.'
                : 'You are not assigned to any jobs yet.'}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#718096' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Select a job</h2>
            <p style={{ fontSize: 14 }}>Choose a job from the sidebar to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
