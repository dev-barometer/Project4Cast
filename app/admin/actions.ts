// app/admin/actions.ts
// Server actions for admin dashboard

'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { resendVerificationEmail } from '@/app/verify-email/actions';
import { deleteFile } from '@/lib/file-upload';

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
    const purchaseOrderStr = formData.get('purchaseOrder') as string;
    if (!jobId) {
      return { success: false, error: 'Job ID is required' };
    }

    const updateData: {
      estimate?: number | null;
      billedAmount?: number | null;
      paidAmount?: number | null;
      purchaseOrder?: string | null;
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
    } else if (formData.has('paidAmount')) {
      updateData.paidAmount = null;
    }

    if (purchaseOrderStr !== null) {
      updateData.purchaseOrder = purchaseOrderStr === '' ? null : purchaseOrderStr;
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

    // Delete related records first to avoid foreign key constraint violations
    // Note: This should be handled by CASCADE, but we do it explicitly to be safe
    await prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
    
    await prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // Delete all related records that might not cascade automatically
    // Delete in order to avoid foreign key violations
    
    // Delete user activities
    await prisma.userActivity.deleteMany({
      where: { userId },
    });
    
    // Delete notification preferences
    await prisma.userNotificationPreferences.deleteMany({
      where: { userId },
    });
    
    // Delete team memberships
    await prisma.userTeam.deleteMany({
      where: { userId },
    });
    
    // Delete notifications (both as recipient and actor)
    await prisma.notification.deleteMany({
      where: { userId },
    });
    await prisma.notification.deleteMany({
      where: { actorId: userId },
    });
    
    // Delete comments
    await prisma.comment.deleteMany({
      where: { authorId: userId },
    });
    
    // Delete attachments
    await prisma.attachment.deleteMany({
      where: { uploadedById: userId },
    });
    
    // Delete task assignees
    await prisma.taskAssignee.deleteMany({
      where: { userId },
    });
    
    // Delete job collaborators
    await prisma.jobCollaborator.deleteMany({
      where: { userId },
    });
    
    // Delete invitations sent by this user
    await prisma.invitation.deleteMany({
      where: { invitedById: userId },
    });

    // Delete the user (other relations should now be handled)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Revalidate all paths that might show users
    revalidatePath('/admin');
    revalidatePath('/admin/collaborators');
    revalidatePath('/profile');
    revalidatePath('/jobs');
    revalidatePath('/tasks');
    revalidatePath('/my-tasks');
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting user:', error);
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

    // Delete all related records first (in correct order to respect foreign key constraints)
    // 1. Delete notifications related to this job
    await prisma.notification.deleteMany({
      where: { jobId },
    });

    // 2. Delete comments related to this job
    await prisma.comment.deleteMany({
      where: { jobId },
    });

    // 3. Delete attachments related to this job
    const attachments = await prisma.attachment.findMany({
      where: { jobId },
      select: { url: true },
    });
    
    // Delete attachment files from storage
    for (const attachment of attachments) {
      try {
        await deleteFile(attachment.url);
      } catch (fileError) {
        // Continue even if file deletion fails (file might not exist)
        console.error('Error deleting attachment file:', attachment.url, fileError);
      }
    }
    
    await prisma.attachment.deleteMany({
      where: { jobId },
    });

    // 4. Delete task assignees (for tasks in this job)
    const tasks = await prisma.task.findMany({
      where: { jobId },
      select: { id: true },
    });
    
    const taskIds = tasks.map(t => t.id);
    if (taskIds.length > 0) {
      // Delete task assignees
      await prisma.taskAssignee.deleteMany({
        where: { taskId: { in: taskIds } },
      });

      // Delete task comments
      await prisma.comment.deleteMany({
        where: { taskId: { in: taskIds } },
      });

      // Delete task attachments
      const taskAttachments = await prisma.attachment.findMany({
        where: { taskId: { in: taskIds } },
        select: { url: true },
      });
      
      for (const attachment of taskAttachments) {
        try {
          await deleteFile(attachment.url);
        } catch (fileError) {
          console.error('Error deleting task attachment file:', attachment.url, fileError);
        }
      }
      
      await prisma.attachment.deleteMany({
        where: { taskId: { in: taskIds } },
      });

      // Delete task notifications
      await prisma.notification.deleteMany({
        where: { taskId: { in: taskIds } },
      });

      // Delete tasks
      await prisma.task.deleteMany({
        where: { jobId },
      });
    }

    // 5. Delete invitations related to this job
    await prisma.invitation.deleteMany({
      where: { jobId },
    });

    // 6. Delete job collaborators
    await prisma.jobCollaborator.deleteMany({
      where: { jobId },
    });

    // 7. Finally, delete the job itself
    await prisma.job.delete({
      where: { id: jobId },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting job:', error);
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

// Manually verify a user's email (admin action)
export async function verifyUserEmail(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const userId = formData.get('userId') as string;
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email is already verified' };
    }

    // Manually verify the email
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    // Delete any pending verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    revalidatePath('/admin');
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to verify email' };
  }
}

// Resend verification email for a user (admin action)
export async function resendUserVerificationEmail(prevState: any, formData: FormData) {
  try {
    await requireAdminOrOwner();
    
    const userId = formData.get('userId') as string;
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Use the existing resendVerificationEmail function
    const result = await resendVerificationEmail(userId);
    
    if (result.success) {
      revalidatePath('/admin');
    }
    
    return result;
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to resend verification email' };
  }
}



