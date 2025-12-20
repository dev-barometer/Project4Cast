// app/admin/actions.ts
// Server actions for admin dashboard

'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function requireAdminOrOwner() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
    throw new Error('Forbidden: Admin or Owner access required');
  }

  return userId;
}

export async function updateJobFinancials(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();

    const jobId = formData.get('jobId') as string;
    const estimateStr = formData.get('estimate') as string;
    const billedAmountStr = formData.get('billedAmount') as string;
    const paidAmountStr = formData.get('paidAmount') as string;

    if (!jobId) {
      return { success: false, error: 'Job ID is required' };
    }

    const updateData: {
      estimate?: number | null;
      billedAmount?: number | null;
      paidAmount?: number | null;
    } = {};

    if (estimateStr !== null && estimateStr !== '') {
      const estimate = parseFloat(estimateStr);
      if (isNaN(estimate) || estimate < 0) {
        return { success: false, error: 'Invalid estimate value' };
      }
      updateData.estimate = estimate;
    } else {
      updateData.estimate = null;
    }

    if (billedAmountStr !== null && billedAmountStr !== '') {
      const billedAmount = parseFloat(billedAmountStr);
      if (isNaN(billedAmount) || billedAmount < 0) {
        return { success: false, error: 'Invalid billed amount value' };
      }
      updateData.billedAmount = billedAmount;
    } else {
      updateData.billedAmount = null;
    }

    if (paidAmountStr !== null && paidAmountStr !== '') {
      const paidAmount = parseFloat(paidAmountStr);
      if (isNaN(paidAmount) || paidAmount < 0) {
        return { success: false, error: 'Invalid paid amount value' };
      }
      updateData.paidAmount = paidAmount;
    } else {
      updateData.paidAmount = null;
    }

    await prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });

    revalidatePath('/admin');
    revalidatePath(`/jobs/${jobId}`);

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update financials' };
  }
}
