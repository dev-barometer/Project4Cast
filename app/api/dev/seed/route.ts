import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 1. Create test users if they don't exist (with passwords)
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    // Only create users if they don't exist (don't recreate deleted ones)
    const users = await Promise.all([
      prisma.user.findUnique({ where: { email: 'alice@example.com' } })
        .then(existing => existing || prisma.user.create({
          data: {
            email: 'alice@example.com',
            name: 'Alice Johnson',
            password: defaultPassword,
            role: 'USER',
          },
        })),
      prisma.user.findUnique({ where: { email: 'bob@example.com' } })
        .then(existing => existing || prisma.user.create({
          data: {
            email: 'bob@example.com',
            name: 'Bob Smith',
            password: defaultPassword,
            role: 'USER',
          },
        })),
      prisma.user.findUnique({ where: { email: 'charlie@example.com' } })
        .then(existing => existing || prisma.user.create({
          data: {
            email: 'charlie@example.com',
            name: 'Charlie Brown',
            password: defaultPassword,
            role: 'USER',
          },
        })),
    ]);

    // 2. Check if the job already exists
    const existingJob = await prisma.job.findUnique({
      where: { jobNumber: 'JOB-001' },
      include: {
        brand: {
          include: {
            client: true,
          },
        },
        tasks: true,
      },
    });

    if (existingJob) {
      // If it exists, just return it and don't create duplicates
      return NextResponse.json({
        success: true,
        alreadySeeded: true,
        job: existingJob,
        users,
      });
    }

    // 3. Create the whole chain if it doesn't exist
    const client = await prisma.client.create({
      data: {
        name: 'Acme Pharma',
        brands: {
          create: {
            name: 'Acme Kidney',
            jobs: {
              create: {
                jobNumber: 'JOB-001',
                title: 'Launch Materials',
                status: 'PLANNING',
                tasks: {
                  create: {
                    title: 'Draft overview deck',
                    status: 'IN_PROGRESS',
                    priority: 'HIGH',
                  },
                },
              },
            },
          },
        },
      },
      include: {
        brands: {
          include: {
            jobs: {
              include: {
                tasks: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, alreadySeeded: false, client, users });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
