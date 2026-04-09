// lib/activity.ts
// Lightweight activity logging. Fire-and-forget — never throws or blocks the caller.

import { prisma } from '@/lib/prisma';
import { ActivityType } from '@prisma/client';

export async function logActivity(
  userId: string,
  type: ActivityType,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        type,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (error) {
    // Never let logging break the main flow
    console.error('[activity] Failed to log activity:', type, error);
  }
}
