'use server';

import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

// Verify email with token
export async function verifyEmail(token: string) {
  'use server';

  try {
    // Find verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return { success: false, error: 'Invalid verification link' };
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      return { success: false, error: 'This verification link has expired' };
    }

    // Check if email is already verified
    if (verificationToken.user.emailVerified) {
      return { success: true, message: 'Email is already verified' };
    }

    // Mark email as verified and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return { success: true, message: 'Email verified successfully!' };
  } catch (error: any) {
    console.error('Error verifying email:', error);
    return { success: false, error: 'Something went wrong. Please try again later.' };
  }
}

// Resend verification email
export async function resendVerificationEmail(userId: string) {
  'use server';

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email is already verified' };
    }

    // Generate new verification token
    const token = randomBytes(32).toString('hex');

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Delete any existing verification tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // Create new verification token
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    try {
      await sendVerificationEmail({
        email: user.email,
        verificationUrl,
        userName: user.name || null,
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return { success: false, error: 'Failed to send email. Please try again later.' };
    }

    return { success: true, message: 'Verification email sent!' };
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    // Provide more specific error message in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Something went wrong. Please try again later.'
      : 'Something went wrong. Please try again later.';
    
    // Check for common errors
    if (error.message?.includes('emailVerificationToken') || error.message?.includes('does not exist')) {
      return { success: false, error: 'Database error: The verification system may need to be set up. Please contact support.' };
    }
    if (error.message?.includes('Unique constraint')) {
      return { success: false, error: 'A verification email was already sent. Please check your inbox.' };
    }
    
    return { success: false, error: errorMessage };
  }
}

