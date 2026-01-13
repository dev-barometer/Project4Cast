import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendCommentMentionEmail } from '@/lib/email';

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

    // Get the most recent comment with a mention
    const recentComment = await prisma.comment.findFirst({
      where: {
        body: {
          contains: '@',
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                jobNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!recentComment) {
      return NextResponse.json({
        success: false,
        message: 'No comments with mentions found. Please create a comment with a mention first.',
      });
    }

    const task = recentComment.task;
    const job = task?.job;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const taskUrl = job?.id ? `${baseUrl}/jobs/${job.id}` : task?.id ? `${baseUrl}/tasks` : baseUrl;

    // Send test email to yourself
    try {
      await sendCommentMentionEmail({
        email: currentUser.email,
        taskTitle: task?.title || null,
        jobTitle: job?.title || null,
        jobNumber: job?.jobNumber || null,
        commenterName: recentComment.author.name,
        commenterEmail: recentComment.author.email,
        commentId: recentComment.id,
        taskId: task?.id || null,
        jobId: job?.id || null,
        taskUrl,
      });

      return NextResponse.json({
        success: true,
        message: `Test email sent to ${currentUser.email}`,
        details: {
          commentId: recentComment.id,
          commentBody: recentComment.body,
          taskTitle: task?.title,
          jobTitle: job?.title,
          jobNumber: job?.jobNumber,
          commenterName: recentComment.author.name,
        },
      });
    } catch (emailError: any) {
      return NextResponse.json({
        success: false,
        error: 'Failed to send email',
        details: {
          message: emailError.message,
          stack: emailError.stack,
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
