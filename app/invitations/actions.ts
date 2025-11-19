'use server';

import { prisma } from '@/lib/prisma';
import { sendInvitationEmail } from '@/lib/email';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';

// Generate a secure random token for invitations
function generateInvitationToken(): string {
  return randomBytes(32).toString('hex');
}

// Server action to create and send an invitation
export async function createInvitation(prevState: any, formData: FormData) {
  'use server';

  // Check if user is authenticated and is an admin
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in to send invitations' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Only administrators can send invitations' };
  }

  const email = formData.get('email')?.toString().trim().toLowerCase();
  const role = formData.get('role')?.toString() || 'USER';

  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address' };
  }

  // Validate role
  if (!['ADMIN', 'USER'].includes(role)) {
    return { success: false, error: 'Invalid role' };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'A user with this email already exists' };
    }

    // Check if there's a pending invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return { success: false, error: 'A pending invitation already exists for this email' };
    }

    // Create invitation
    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role: role as 'ADMIN' | 'USER',
        invitedById: user.id,
        expiresAt,
      },
    });

    // Send invitation email
    try {
      await sendInvitationEmail({
        email,
        invitationToken: token,
        inviterName: user.name,
        inviterEmail: user.email,
      });
    } catch (emailError: any) {
      // If email fails, delete the invitation and return error
      await prisma.invitation.delete({
        where: { id: invitation.id },
      });
      console.error('Error sending invitation email:', emailError);
      return {
        success: false,
        error: `Failed to send invitation email: ${emailError.message || 'Unknown error'}. Please check your email configuration.`,
      };
    }

    revalidatePath('/invitations');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    return { success: false, error: error.message || 'Failed to create invitation' };
  }
}

// Server action to cancel an invitation
export async function cancelInvitation(formData: FormData) {
  'use server';

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

  const invitationId = formData.get('invitationId')?.toString();

  if (!invitationId) {
    return;
  }

  try {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' },
    });

    revalidatePath('/invitations');
  } catch (error: any) {
    console.error('Error cancelling invitation:', error);
  }
}

// Server action to resend an invitation
export async function resendInvitation(formData: FormData) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Only administrators can resend invitations' };
  }

  const invitationId = formData.get('invitationId')?.toString();

  if (!invitationId) {
    return { success: false, error: 'Invitation ID is required' };
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return { success: false, error: 'Invitation not found' };
    }

    if (invitation.status !== 'PENDING') {
      return { success: false, error: 'Can only resend pending invitations' };
    }

    if (invitation.expiresAt < new Date()) {
      return { success: false, error: 'Invitation has expired' };
    }

    // Send invitation email
    try {
      await sendInvitationEmail({
        email: invitation.email,
        invitationToken: invitation.token,
        inviterName: user.name,
        inviterEmail: user.email,
      });
    } catch (emailError: any) {
      console.error('Error resending invitation email:', emailError);
      return {
        success: false,
        error: `Failed to send email: ${emailError.message || 'Unknown error'}`,
      };
    }

    revalidatePath('/invitations');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error resending invitation:', error);
    return { success: false, error: error.message || 'Failed to resend invitation' };
  }
}

