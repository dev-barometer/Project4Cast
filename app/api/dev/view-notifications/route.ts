// Simple endpoint to view notifications for debugging
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || userId;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all notifications for this user
    const notifications = await prisma.notification.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            jobNumber: true,
          },
        },
      },
    });

    // Count by type
    const counts = await prisma.notification.groupBy({
      by: ['type'],
      where: { userId: targetUserId },
      _count: true,
    });

    // Count unread
    const unreadCount = await prisma.notification.count({
      where: {
        userId: targetUserId,
        read: false,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      summary: {
        total: notifications.length,
        unread: unreadCount,
        byType: counts.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
        actor: n.actor ? {
          name: n.actor.name,
          email: n.actor.email,
        } : null,
        task: n.task ? {
          id: n.task.id,
          title: n.task.title,
        } : null,
        job: n.job ? {
          id: n.job.id,
          title: n.job.title,
          jobNumber: n.job.jobNumber,
        } : null,
        commentId: n.commentId,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: {
        message: error.message,
        stack: error.stack,
      },
    }, { status: 500 });
  }
}
