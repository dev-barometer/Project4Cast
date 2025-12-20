// app/admin/actions.ts
// Server actions for admin dashboard

'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

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
    const archiveStr = formData.get('archive') as string;

    if (!jobId) {
      return { success: false, error: 'Job ID is required' };
    }

    const updateData: {
      estimate?: number | null;
      billedAmount?: number | null;
      paidAmount?: number | null;
      isArchived?: boolean;
    } = {};

    if (estimateStr !== null && estimateStr !== '') {
      const estimate = parseFloat(estimateStr);
      if (isNaN(estimate) || estimate < 0) {
        return { success: false, error: 'Invalid estimate value' };
      }
      updateData.estimate = estimate;
    } else if (formData.has('estimate')) {
      updateData.estimate = null;
    }

    if (billedAmountStr !== null && billedAmountStr !== '') {
      const billedAmount = parseFloat(billedAmountStr);
      if (isNaN(billedAmount) || billedAmount < 0) {
        return { success: false, error: 'Invalid billed amount value' };
      }
      updateData.billedAmount = billedAmount;
    } else if (formData.has('billedAmount')) {
      updateData.billedAmount = null;
    }

    if (paidAmountStr !== null && paidAmountStr !== '') {
      const paidAmount = parseFloat(paidAmountStr);
      if (isNaN(paidAmount) || paidAmount < 0) {
        return { success: false, error: 'Invalid paid amount value' };
      }
      updateData.paidAmount = paidAmount;
      // When paid is set, also archive the job
      if (paidAmount > 0) {
        updateData.isArchived = true;
      }
    } else if (formData.has('paidAmount')) {
      updateData.paidAmount = null;
      // When paid is cleared, unarchive if archive flag is false
      if (archiveStr === 'false') {
        updateData.isArchived = false;
      }
    }

    // Handle explicit archive flag
    if (archiveStr === 'true') {
      updateData.isArchived = true;
    } else if (archiveStr === 'false') {
      updateData.isArchived = false;
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

// ========== USER MANAGEMENT ACTIONS ==========

export async function deleteUser(prevState: any, formData: FormData) {
  try {
    const adminId = await requireAdminOrOwner();
    
    const userId = formData.get('userId') as string;
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Prevent self-deletion with fun message
    if (userId === adminId) {
      return { success: false, error: "Tsk tsk tsk, you can't delete yourself silly. Contact the Admin if you really mean it." };
    }

    // Prevent deleting owner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === 'OWNER') {
      return { success: false, error: 'Cannot delete owner account' };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete user' };
  }
}

export async function toggleUserPause(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const userId = formData.get('userId') as string;
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Prevent pausing owner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isPaused: true },
    });

    if (user?.role === 'OWNER') {
      return { success: false, error: 'Cannot pause owner account' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isPaused: !user?.isPaused },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle user pause status' };
  }
}

export async function changeUserPassword(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const userId = formData.get('userId') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!userId || !newPassword) {
      return { success: false, error: 'User ID and new password are required' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to change password' };
  }
}

export async function sendPasswordResetLink(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const userId = formData.get('userId') as string;
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, password: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.password) {
      return { success: false, error: 'User does not have a password set (OAuth user)' };
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Invalidate existing tokens
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: userId,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: userId,
        expiresAt,
      },
    });

    // Send email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail({
      email: user.email,
      resetUrl,
      userName: user.name || null,
    });

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send password reset link' };
  }
}

export async function assignAdminRole(prevState: any, formData: FormData) {
  try {
    const adminId = await requireAdminOrOwner();
    
    const userId = formData.get('userId') as string;
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Prevent self-assignment unless owner
    const currentUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (userId === adminId && currentUser?.role !== 'OWNER') {
      return { success: false, error: 'Cannot change your own role' };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (targetUser?.role === 'OWNER') {
      return { success: false, error: 'Cannot modify owner role' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to assign admin role' };
  }
}

export async function removeAdminRole(prevState: any, formData: FormData) {
  try {
    const adminId = await requireAdminOrOwner();
    
    // Only owner can remove admin
    const currentUser = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (currentUser?.role !== 'OWNER') {
      return { success: false, error: 'Only owner can remove admin privileges' };
    }

    const userId = formData.get('userId') as string;
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (userId === adminId) {
      return { success: false, error: 'Cannot remove your own admin privileges' };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (targetUser?.role === 'OWNER') {
      return { success: false, error: 'Cannot modify owner role' };
    }

    if (targetUser?.role !== 'ADMIN') {
      return { success: false, error: 'User is not an admin' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: 'USER' },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove admin role' };
  }
}

export async function assignUserToTeams(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const userId = formData.get('userId') as string;
    const teamIds = formData.getAll('teamIds') as string[];

    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Remove existing team memberships
    await prisma.userTeam.deleteMany({
      where: { userId },
    });

    // Add new team memberships
    if (teamIds.length > 0) {
      await prisma.userTeam.createMany({
        data: teamIds.map(teamId => ({
          userId,
          teamId,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to assign teams' };
  }
}

// ========== TEAM MANAGEMENT ACTIONS ==========

export async function createTeam(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;

    if (!name || name.trim() === '') {
      return { success: false, error: 'Team name is required' };
    }

    await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'A team with this name already exists' };
    }
    return { success: false, error: error.message || 'Failed to create team' };
  }
}

// ========== ARCHIVE/DELETE ACTIONS ==========

export async function archiveJob(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const jobId = formData.get('jobId') as string;
    if (!jobId) {
      return { success: false, error: 'Job ID is required' };
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { isArchived: true },
    });

    revalidatePath('/admin');
    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to archive job' };
  }
}

export async function unarchiveJob(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const jobId = formData.get('jobId') as string;
    if (!jobId) {
      return { success: false, error: 'Job ID is required' };
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { isArchived: false },
    });

    revalidatePath('/admin');
    revalidatePath(`/jobs/${jobId}`);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to unarchive job' };
  }
}

export async function deleteJob(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const jobId = formData.get('jobId') as string;
    if (!jobId) {
      return { success: false, error: 'Job ID is required' };
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete job' };
  }
}

export async function archiveBrand(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const brandId = formData.get('brandId') as string;
    if (!brandId) {
      return { success: false, error: 'Brand ID is required' };
    }

    await prisma.brand.update({
      where: { id: brandId },
      data: { isArchived: true },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to archive brand' };
  }
}

export async function unarchiveBrand(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const brandId = formData.get('brandId') as string;
    if (!brandId) {
      return { success: false, error: 'Brand ID is required' };
    }

    await prisma.brand.update({
      where: { id: brandId },
      data: { isArchived: false },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to unarchive brand' };
  }
}

export async function deleteBrand(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const brandId = formData.get('brandId') as string;
    if (!brandId) {
      return { success: false, error: 'Brand ID is required' };
    }

    // Check if brand has jobs
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { _count: { select: { jobs: true } } },
    });

    if (brand && brand._count.jobs > 0) {
      return { success: false, error: 'Cannot delete brand with existing jobs' };
    }

    await prisma.brand.delete({
      where: { id: brandId },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete brand' };
  }
}

export async function archiveClient(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const clientId = formData.get('clientId') as string;
    if (!clientId) {
      return { success: false, error: 'Client ID is required' };
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { isArchived: true },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to archive client' };
  }
}

export async function unarchiveClient(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const clientId = formData.get('clientId') as string;
    if (!clientId) {
      return { success: false, error: 'Client ID is required' };
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { isArchived: false },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to unarchive client' };
  }
}

export async function deleteClient(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const clientId = formData.get('clientId') as string;
    if (!clientId) {
      return { success: false, error: 'Client ID is required' };
    }

    // Check if client has brands
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { _count: { select: { brands: true } } },
    });

    if (client && client._count.brands > 0) {
      return { success: false, error: 'Cannot delete client with existing brands' };
    }

    await prisma.client.delete({
      where: { id: clientId },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete client' };
  }
}
