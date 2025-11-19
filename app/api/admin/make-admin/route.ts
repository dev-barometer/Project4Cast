import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user to admin
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error making user admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to make user admin' },
      { status: 500 }
    );
  }
}

