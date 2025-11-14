'use server';

// Server Actions for creating new jobs

import { prisma } from '@/lib/prisma';

// Server action to create a new job
// When used with useFormState, the signature is (prevState, formData)
export async function createJob(prevState: any, formData: FormData) {
  const jobNumber = formData.get('jobNumber')?.toString().trim();
  const title = formData.get('title')?.toString().trim();
  const brandId = formData.get('brandId')?.toString();
  const status = formData.get('status')?.toString() || 'PLANNING';
  const brief = formData.get('brief')?.toString().trim();

  // Validate required fields
  if (!jobNumber || !title || !brandId) {
    return { error: 'Job number, title, and brand are required' };
  }

  // Validate status
  if (!['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'DELIVERED', 'ARCHIVED'].includes(status)) {
    return { error: 'Invalid status' };
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
        status: status as 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'DELIVERED' | 'ARCHIVED',
        brief: brief || null,
      },
    });

    // Return success with job ID - client will handle redirect
    return { success: true, jobId: job.id, error: null };
  } catch (error: any) {
    console.error('Error creating job:', error);
    return { error: error.message || 'Failed to create job' };
  }
}

