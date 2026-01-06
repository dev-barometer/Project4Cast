import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Keep-alive endpoint to prevent Supabase database from pausing
// This runs a lightweight query to keep the database active
export async function GET(request: Request) {
  // Verify the request is from a cron job or has a secret token
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is set, require it
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Run a lightweight query to keep the database active
    // This just counts users (very fast, doesn't load data)
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database keep-alive successful',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Keep-alive error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

