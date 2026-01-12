// Diagnostic endpoint to check the most recent comment and see if mentions were processed
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { parseMentions } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the most recent comment
    const recentComment = await prisma.comment.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
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
            jobId: true,
          },
        },
      },
    });

    if (!recentComment) {
      return NextResponse.json({
        success: true,
        message: 'No comments found',
      });
    }

    // Parse mentions from the comment body
    const mentions = parseMentions(recentComment.body);

    // Check if there are any COMMENT_MENTION notifications for this comment
    const notifications = await prisma.notification.findMany({
      where: {
        commentId: recentComment.id,
        type: 'COMMENT_MENTION',
      },
    });

    // Get all notifications created in the last 5 minutes
    const recentNotifications = await prisma.notification.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
        type: 'COMMENT_MENTION',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      recentComment: {
        id: recentComment.id,
        body: recentComment.body,
        createdAt: recentComment.createdAt,
        author: {
          id: recentComment.author.id,
          name: recentComment.author.name,
          email: recentComment.author.email,
        },
        task: recentComment.task ? {
          id: recentComment.task.id,
          title: recentComment.task.title,
          jobId: recentComment.task.jobId,
        } : null,
      },
      parsedMentions: mentions,
      notificationsForThisComment: notifications.map(n => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        createdAt: n.createdAt,
      })),
      recentCommentMentions: recentNotifications.map(n => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
        actor: n.actor ? {
          name: n.actor.name,
          email: n.actor.email,
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
