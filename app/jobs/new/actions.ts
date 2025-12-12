'use server';

// Server Actions for creating new jobs

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireEmailVerification } from '@/lib/security';

// Server action to create a new job
// When used with useFormState, the signature is (prevState, formData)
export async function createJob(prevState: any, formData: FormData) {
  const jobNumber = formData.get('jobNumber')?.toString().trim();
  const title = formData.get('title')?.toString().trim();
  const brandId = formData.get('brandId')?.toString();
  // All new jobs default to PLANNING (active status)
  const status = 'PLANNING';

  // Validate required fields
  if (!jobNumber || !title || !brandId) {
    return { error: 'Job number, title, and brand are required' };
  }

  // Validate job number format: XXX-000 (3 uppercase letters, hyphen, 3 numbers)
  const jobNumberPattern = /^[A-Z]{3}-[0-9]{3}$/;
  if (!jobNumberPattern.test(jobNumber)) {
    return { error: 'Job number must be in format XXX-000 (3 uppercase letters, hyphen, 3 numbers)' };
  }

  // Status is always PLANNING for new jobs (no validation needed)

  // Require email verification to create jobs
  const session = await auth();
  if (session?.user?.id) {
    try {
      await requireEmailVerification(session.user.id);
    } catch (error: any) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        return { error: 'Please verify your email address before creating jobs' };
      }
      throw error;
    }
  }

  // Check if job number already exists
  const existingJob = await prisma.job.findUnique({
    where: { jobNumber },
  });

  if (existingJob) {
    return { error: 'Job number already exists' };
  }

  // Create the job
  try {
    const job = await prisma.job.create({
      data: {
        jobNumber,
        title,
        brandId,
        status: 'PLANNING',
        brief: null,
      },
    });

    // Return success with job ID - client will handle redirect
    return { success: true, jobId: job.id, error: null };
  } catch (error: any) {
    console.error('Error creating job:', error);
    return { error: error.message || 'Failed to create job' };
  }
}

