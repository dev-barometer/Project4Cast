import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notifyCommentMention } from '@/lib/notifications';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find a task with a job (preferably one the user has access to)
    const task = await prisma.task.findFirst({
      where: {
        job: {
          isNot: null,
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            jobNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!task || !task.job) {
      return NextResponse.json({
        success: false,
        message: 'No tasks with jobs found. Please create a task in a job first.',
      });
    }

    // Create a test comment mentioning the current user
    const mentionText = `@${currentUser.name || currentUser.email}`;
    const commentBody = `${mentionText} - This is a test comment to show you the email notification layout. Here are some details about the task and job.`;

    const comment = await prisma.comment.create({
      data: {
        body: commentBody,
        authorId: userId,
        taskId: task.id,
        jobId: task.job.id,
      },
    });

    // Get the author info
    const author = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const taskUrl = `${baseUrl}/jobs/${task.job.id}`;

    // Trigger the notification (this will send the email)
    // Note: We bypass the normal check that prevents self-mentions for testing
    try {
      // Import the email function directly to bypass the self-mention check
      const { sendCommentMentionEmail } = await import('@/lib/email');
      
      // Get job number
      const jobNumber = task.job.jobNumber;
      
      // Send email directly (bypassing the self-mention check)
      await sendCommentMentionEmail({
        email: currentUser.email,
        taskTitle: task.title,
        jobTitle: task.job.title,
        jobNumber: jobNumber || null,
        commenterName: author?.name || null,
        commenterEmail: author?.email || 'System',
        commentId: comment.id,
        taskId: task.id,
        jobId: task.job.id,
        taskUrl,
      });
      
      // Also create the in-app notification
      const { createNotification } = await import('@/app/notifications/actions');
      await createNotification({
        userId: userId,
        type: 'COMMENT_MENTION',
        title: `${author?.name || 'You'} mentioned you`,
        message: `in a comment on task "${task.title}" in job "${task.job.title}"`,
        taskId: task.id,
        jobId: task.job.id,
        commentId: comment.id,
        actorId: userId,
      });

      return NextResponse.json({
        success: true,
        message: `Test comment created and email notification sent to ${currentUser.email}`,
        details: {
          commentId: comment.id,
          commentBody: comment.body,
          taskTitle: task.title,
          jobTitle: task.job.title,
          jobNumber: task.job.jobNumber,
          taskUrl,
        },
      });
    } catch (notifError: any) {
      return NextResponse.json({
        success: false,
        error: 'Failed to send notification',
        details: {
          message: notifError.message,
          stack: notifError.stack,
        },
        commentCreated: {
          id: comment.id,
          body: comment.body,
        },
      }, { status: 500 });
    }
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
