'use server';

import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Request password reset - sends email with reset link
export async function requestPasswordReset(prevState: any, formData: FormData) {
  'use server';

  const email = formData.get('email')?.toString().trim().toLowerCase();

  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user || !user.password) {
      // User doesn't exist or doesn't have a password (OAuth user)
      // Still return success to prevent email enumeration
      return { success: true, message: 'If an account exists, a password reset link has been sent.' };
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Invalidate any existing reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(), // Mark as used
      },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Send reset email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail({
        email: user.email,
        resetUrl,
        userName: user.name || null,
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return { success: false, error: 'Failed to send email. Please try again later.' };
    }

    return { success: true, message: 'If an account exists, a password reset link has been sent.' };
  } catch (error: any) {
    console.error('Error requesting password reset:', error);
    return { success: false, error: 'Something went wrong. Please try again later.' };
  }
}

// Reset password with token
export async function resetPassword(prevState: any, formData: FormData) {
  'use server';

  const token = formData.get('token')?.toString();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();

  if (!token || !password || !confirmPassword) {
    return { success: false, error: 'All fields are required' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long' };
  }

  try {
    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return { success: false, error: 'Invalid or expired reset link' };
    }

    // Check if token is already used
    if (resetToken.usedAt) {
      return { success: false, error: 'This reset link has already been used' };
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return { success: false, error: 'This reset link has expired' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { success: true, message: 'Password has been reset successfully. You can now sign in.' };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return { success: false, error: 'Something went wrong. Please try again later.' };
  }
}

// Verify reset token (for checking if token is valid before showing reset form)
export async function verifyResetToken(token: string) {
  'use server';

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return { valid: false, error: 'Invalid reset link' };
    }

    if (resetToken.usedAt) {
      return { valid: false, error: 'This reset link has already been used' };
    }

    if (resetToken.expiresAt < new Date()) {
      return { valid: false, error: 'This reset link has expired' };
    }

    return { valid: true };
  } catch (error: any) {
    console.error('Error verifying reset token:', error);
    return { valid: false, error: 'Something went wrong' };
  }
}

