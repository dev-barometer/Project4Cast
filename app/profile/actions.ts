'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { notifyJobAssignment } from '@/lib/notifications';

// Update user profile
export async function updateProfile(prevState: any, formData: FormData) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const name = formData.get('name')?.toString().trim();
  const phone = formData.get('phone')?.toString().trim() || null;
  const website = formData.get('website')?.toString().trim() || null;
  const pronouns = formData.get('pronouns')?.toString().trim() || null;
  const timezone = formData.get('timezone')?.toString().trim() || null;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        phone,
        website,
        pronouns,
        timezone,
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'UPDATED_PROFILE',
      },
    });

    revalidatePath('/profile');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message || 'Failed to update profile' };
  }
}

// Change password
export async function changePassword(prevState: any, formData: FormData) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const currentPassword = formData.get('currentPassword')?.toString();
  const newPassword = formData.get('newPassword')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: 'All password fields are required' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'New passwords do not match' };
  }

  try {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { success: false, error: 'Password change not available for this account' };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'CHANGED_PASSWORD',
      },
    });

    revalidatePath('/profile');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error changing password:', error);
    return { success: false, error: error.message || 'Failed to change password' };
  }
}

// Update teams
export async function updateTeams(prevState: any, formData: FormData) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const teamIds = formData.getAll('teamIds').map(id => id.toString());

  try {
    // Remove all current team memberships
    await prisma.userTeam.deleteMany({
      where: { userId: session.user.id },
    });

    // Add new team memberships
    if (teamIds.length > 0) {
      await prisma.userTeam.createMany({
        data: teamIds.map(teamId => ({
          userId: session.user.id,
          teamId,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath('/profile');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating teams:', error);
    return { success: false, error: error.message || 'Failed to update teams' };
  }
}

// Update notification preferences
export async function updateNotificationPreferences(prevState: any, formData: FormData) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const preferences = {
    jobAssignedInApp: formData.get('jobAssignedInApp') === 'true',
    jobAssignedEmail: formData.get('jobAssignedEmail') === 'true',
    commentMentionInApp: formData.get('commentMentionInApp') === 'true',
    commentMentionEmail: formData.get('commentMentionEmail') === 'true',
    jobChangeInApp: formData.get('jobChangeInApp') === 'true',
    jobChangeEmail: formData.get('jobChangeEmail') === 'true',
    taskCompleteInApp: formData.get('taskCompleteInApp') === 'true',
    taskCompleteEmail: formData.get('taskCompleteEmail') === 'true',
    taskOverdueInApp: formData.get('taskOverdueInApp') === 'true',
    taskOverdueEmail: formData.get('taskOverdueEmail') === 'true',
    frequency: formData.get('frequency')?.toString() || 'immediate',
  };

  try {
    await prisma.userNotificationPreferences.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...preferences,
      },
      update: preferences,
    });

    revalidatePath('/profile');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: error.message || 'Failed to update notification preferences' };
  }
}

// Delete account
export async function deleteAccount(prevState: any, formData: FormData) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const confirmText = formData.get('confirmText')?.toString();

  if (confirmText !== 'DELETE') {
    return { success: false, error: 'Please type DELETE to confirm' };
  }

  try {
    // Get user info before deletion
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });

    // Get all admins and owners
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'OWNER'] } },
    });

    // Log activity before deletion
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        type: 'DELETED_ACCOUNT',
        details: JSON.stringify({ email: user?.email, name: user?.name }),
      },
    });

    // Notify admins
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'JOB_ASSIGNED', // Reusing this type for admin notifications
          title: 'User Account Deleted',
          message: `${user?.name || user?.email || 'A user'} has deleted their account`,
          actorId: session.user.id,
        },
      });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return { success: false, error: error.message || 'Failed to delete account' };
  }
}

// Assign admin privileges (owner or admin can do this)
export async function assignAdmin(prevState: any, formData: FormData) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const targetUserId = formData.get('userId')?.toString();

  if (!targetUserId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!currentUser || (currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN')) {
      return { success: false, error: 'Only owners and admins can assign admin privileges' };
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    // Prevent assigning owner role (only migration can do that)
    if (targetUser.role === 'OWNER') {
      return { success: false, error: 'Cannot change owner role' };
    }

    // Prevent self-assignment if not owner
    if (targetUserId === session.user.id && currentUser.role !== 'OWNER') {
      return { success: false, error: 'You cannot assign admin privileges to yourself' };
    }

    // Update user to admin
    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: 'ADMIN' },
    });

    revalidatePath('/profile');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error assigning admin:', error);
    return { success: false, error: error.message || 'Failed to assign admin privileges' };
  }
}

// Remove admin privileges (only owner can do this)
export async function removeAdmin(prevState: any, formData: FormData) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const targetUserId = formData.get('userId')?.toString();

  if (!targetUserId) {
    return { success: false, error: 'User ID is required' };
  }

  try {
    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Only owner can remove admin privileges
    if (!currentUser || currentUser.role !== 'OWNER') {
      return { success: false, error: 'Only the owner can remove admin privileges' };
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    // Prevent removing owner role
    if (targetUser.role === 'OWNER') {
      return { success: false, error: 'Cannot remove owner role' };
    }

    // Prevent removing admin from self
    if (targetUserId === session.user.id) {
      return { success: false, error: 'You cannot remove admin privileges from yourself' };
    }

    // Only remove if user is currently admin
    if (targetUser.role !== 'ADMIN') {
      return { success: false, error: 'User is not an admin' };
    }

    // Update user to regular user
    await prisma.user.update({
      where: { id: targetUserId },
      data: { role: 'USER' },
    });

    revalidatePath('/profile');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error removing admin:', error);
    return { success: false, error: error.message || 'Failed to remove admin privileges' };
  }
}
