import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cleanup endpoint to delete read notifications older than 30 days
// This runs as a cron job to keep the database clean
export async function GET(request: Request) {
  // Verify the request is from a cron job or has a secret token
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is set, require it
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete read notifications older than 30 days
    const result = await prisma.notification.deleteMany({
      where: {
        read: true,
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Read notifications cleanup successful',
      deletedCount: result.count,
      cutoffDate: thirtyDaysAgo.toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cleanup read notifications error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Cleanup failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
