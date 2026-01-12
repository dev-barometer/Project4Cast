// Diagnostic endpoint to test comment mention notification flow
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { parseMentions, findUsersByMention, notifyCommentMention } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testText = searchParams.get('text') || '@chris test comment';
    const mentionedUserId = searchParams.get('mentionedUserId') || 'cmjhj1fc20000kw04v1hnc52b'; // Chris's ID from diagnostic

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    // Get mentioned user
    const mentionedUser = await prisma.user.findUnique({
      where: { id: mentionedUserId },
      select: { id: true, name: true, email: true },
    });

    if (!currentUser || !mentionedUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        currentUser: !!currentUser,
        mentionedUser: !!mentionedUser,
      });
    }

    // Test 1: Parse mentions
    const mentions = parseMentions(testText);
    
    // Test 2: Find users for mentions
    const userResults = [];
    for (const mention of mentions) {
      const userIds = await findUsersByMention(mention);
      userResults.push({ mention, userIds });
    }

    // Test 3: Check notification preferences
    const preferences = await prisma.userNotificationPreferences.findUnique({
      where: { userId: mentionedUserId },
    });

    // Test 4: Try to create a notification (without actually creating a comment)
    // We'll create a fake comment ID for testing
    const testCommentId = 'test-comment-' + Date.now();
    const testTaskId = 'test-task-' + Date.now();

    let notificationResult = null;
    let notificationError = null;
    
    try {
      await notifyCommentMention({
        userId: mentionedUserId,
        commentId: testCommentId,
        taskId: testTaskId,
        taskTitle: 'Test Task',
        jobId: null,
        jobTitle: null,
        actorId: userId,
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        taskUrl: 'https://project4-cast.vercel.app/test',
      });
      notificationResult = 'success';
    } catch (error: any) {
      notificationError = {
        message: error.message,
        code: error.code,
        meta: error.meta,
      };
    }

    // Test 5: Check if notification was actually created
    const createdNotification = await prisma.notification.findFirst({
      where: {
        userId: mentionedUserId,
        commentId: testCommentId,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Clean up test notification
    if (createdNotification) {
      await prisma.notification.delete({
        where: { id: createdNotification.id },
      });
    }

    return NextResponse.json({
      success: true,
      testText,
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      mentionedUser: {
        id: mentionedUser.id,
        name: mentionedUser.name,
        email: mentionedUser.email,
      },
      parsedMentions: mentions,
      userResults,
      preferences: preferences ? {
        commentMentionInApp: preferences.commentMentionInApp,
        commentMentionEmail: preferences.commentMentionEmail,
      } : 'No preferences found (will default to true)',
      notificationTest: {
        result: notificationResult,
        error: notificationError,
        notificationCreated: !!createdNotification,
        notificationId: createdNotification?.id,
      },
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
