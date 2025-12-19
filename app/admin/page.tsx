// app/admin/page.tsx
// Main admin dashboard page

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  // Get authenticated user
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    redirect('/login');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch all data for admin dashboard
  const [
    allUsers,
    allClients,
    allBrands,
    allJobs,
    allAttachments,
    allTasks,
  ] = await Promise.all([
    // Users
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Clients
    prisma.client.findMany({
      include: {
        brands: {
          include: {
            _count: {
              select: { jobs: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    // Brands
    prisma.brand.findMany({
      include: {
        client: {
          select: { id: true, name: true },
        },
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    // Jobs
    prisma.job.findMany({
      include: {
        brand: {
          include: {
            client: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            collaborators: true,
            attachments: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Attachments
    prisma.attachment.findMany({
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        job: {
          select: { id: true, jobNumber: true, title: true },
        },
        task: {
          select: { id: true, title: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
      take: 50, // Limit to most recent 50
    }),
    // Tasks summary
    prisma.task.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    }),
  ]);

  // Calculate statistics
  const stats = {
    totalUsers: allUsers.length,
    totalAdmins: allUsers.filter(u => u.role === 'ADMIN').length,
    totalClients: allClients.length,
    totalBrands: allBrands.length,
    totalJobs: allJobs.length,
    totalTasks: allTasks.reduce((sum, t) => sum + t._count.id, 0),
    totalAttachments: allAttachments.length,
    totalEstimate: allJobs.reduce((sum, j) => sum + (j.estimate || 0), 0),
    totalBilled: allJobs.reduce((sum, j) => sum + (j.billedAmount || 0), 0),
    totalPaid: allJobs.reduce((sum, j) => sum + (j.paidAmount || 0), 0),
    tasksByStatus: {
      TODO: allTasks.find(t => t.status === 'TODO')?._count.id || 0,
      IN_PROGRESS: allTasks.find(t => t.status === 'IN_PROGRESS')?._count.id || 0,
      BLOCKED: allTasks.find(t => t.status === 'BLOCKED')?._count.id || 0,
      DONE: allTasks.find(t => t.status === 'DONE')?._count.id || 0,
    },
  };

  return (
    <AdminDashboardClient
      stats={stats}
      users={allUsers}
      clients={allClients}
      brands={allBrands}
      jobs={allJobs}
      attachments={allAttachments}
    />
  );
}
