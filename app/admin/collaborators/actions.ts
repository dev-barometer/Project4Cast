'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Server action to remove a user from all jobs (admin only)
// This will also remove all their task assignments
export async function removeUserFromAllJobs(formData: FormData) {
  'use server';

  // Check if user is authenticated and is an admin
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return;
  }

  const userId = formData.get('userId')?.toString();

  if (!userId) {
    return;
  }

  // Prevent removing yourself
  if (userId === session.user.id) {
    return;
  }

  try {
    // Get all jobs where this user is a collaborator
    const userCollaborations = await prisma.jobCollaborator.findMany({
      where: { userId },
      select: { jobId: true },
    });

    const jobIds = userCollaborations.map((c) => c.jobId);

    // Remove user from all jobs and all task assignments in a transaction
    await prisma.$transaction([
      // Remove all task assignments for this user (across all jobs)
      prisma.taskAssignee.deleteMany({
        where: {
          userId,
        },
      }),
      // Remove user from all job collaborations
      prisma.jobCollaborator.deleteMany({
        where: {
          userId,
        },
      }),
    ]);

    // Revalidate all affected pages
    revalidatePath('/admin/collaborators');
    revalidatePath('/jobs');
    revalidatePath('/tasks');
    revalidatePath('/my-tasks');
    
    // Revalidate each job page
    for (const jobId of jobIds) {
      revalidatePath(`/jobs/${jobId}`);
    }
  } catch (error: any) {
    console.error('Error removing user from all jobs:', error);
  }
}

