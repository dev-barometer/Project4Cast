// Security utilities for email verification checks

import { prisma } from '@/lib/prisma';

/**
 * Check if a user's email is verified
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    return !!user?.emailVerified;
  } catch (error) {
    console.error('Error checking email verification:', error);
    return false;
  }
}

/**
 * Require email verification - throws error if not verified
 */
export async function requireEmailVerification(userId: string): Promise<void> {
  const verified = await isEmailVerified(userId);
  if (!verified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }
}








