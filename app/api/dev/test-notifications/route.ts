// Diagnostic endpoint to test notifications
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Test 1: Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    // Test 2: Check if Notification table exists by trying to count
    let notificationCount = 0;
    try {
      notificationCount = await prisma.notification.count({
        where: { userId },
      });
    } catch (countError: any) {
      return NextResponse.json({
        success: false,
        error: 'Notification table query failed',
        details: {
          message: countError.message,
          code: countError.code,
          meta: countError.meta,
        },
        tests: {
          userExists: !!user,
          userId,
        },
      });
    }

    // Test 3: Try to fetch notifications
    let notifications = [];
    try {
      notifications = await prisma.notification.findMany({
        where: { userId },
        take: 5,
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
    } catch (fetchError: any) {
      return NextResponse.json({
        success: false,
        error: 'Notification fetch failed',
        details: {
          message: fetchError.message,
          code: fetchError.code,
          meta: fetchError.meta,
        },
        tests: {
          userExists: !!user,
          notificationCount,
          userId,
        },
      });
    }

    // Test 4: Check schema
    const schemaCheck = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Notification'
      ORDER BY ordinal_position;
    `.catch(() => null);

    return NextResponse.json({
      success: true,
      tests: {
        userExists: !!user,
        userId,
        userEmail: user?.email,
        notificationCount,
        notificationsFound: notifications.length,
        schemaColumns: schemaCheck,
      },
      sampleNotifications: notifications.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        read: n.read,
        createdAt: n.createdAt,
        hasActor: !!n.actor,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: {
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
    }, { status: 500 });
  }
}
