// Diagnostic endpoint to test mention parsing and user finding
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { parseMentions, findUsersByMention } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testText = searchParams.get('text') || '@chris';

    // Test 1: Parse mentions from text
    const mentions = parseMentions(testText);
    
    // Test 2: Find users for each mention
    const userResults = [];
    for (const mention of mentions) {
      const userIds = await findUsersByMention(mention);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });
      userResults.push({
        mention,
        userIds,
        users,
      });
    }

    // Test 3: Get all users in the system
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({
      success: true,
      testText,
      parsedMentions: mentions,
      userResults,
      allUsers,
      currentUserId: userId,
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
