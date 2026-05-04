import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cleanup endpoint to delete read notifications older than 30 days
// This runs as a cron job to keep the database clean
export async function GET(request: Request) {
  // Verify the request is from a cron job or has a secret token
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete read notifications older than 30 days
    const readResult = await prisma.notification.deleteMany({
      where: {
        read: true,
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    // Delete unread notifications older than 90 days (stale, no longer actionable)
    const unreadResult = await prisma.notification.deleteMany({
      where: {
        read: false,
        createdAt: { lt: ninetyDaysAgo },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification cleanup successful',
      deletedRead: readResult.count,
      deletedStaleUnread: unreadResult.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Cleanup read notifications error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cleanup failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
