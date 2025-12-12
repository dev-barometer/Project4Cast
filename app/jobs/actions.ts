'use server';

// Server actions for job management

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Server action to mark a job as inactive
export async function markJobInactive(formData: FormData) {
  const jobId = formData.get('jobId')?.toString();
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!jobId || !currentUserId) {
    return { success: false, error: 'Authentication required' };
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    // Check if user is a collaborator
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { collaborators: true },
    });

    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    const isCollaborator = job.collaborators.some(c => c.userId === currentUserId);
    if (!isCollaborator) {
      return { success: false, error: 'Unauthorized to mark job as inactive' };
    }
  }

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'ARCHIVED' },
    });
    revalidatePath('/');
    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error marking job as inactive:', error);
    return { success: false, error: error.message || 'Failed to mark job as inactive' };
  }
}
