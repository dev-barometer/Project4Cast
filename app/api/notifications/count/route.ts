// app/api/notifications/count/route.ts
// API route to get unread notification count

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting notification count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}







