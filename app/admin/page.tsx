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

  // Check if user is admin or owner
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
    redirect('/');
  }

  // Fetch all data for admin dashboard
  const [allUsers, allClients, allTeams] = await Promise.all([
    // Users
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPaused: true,
        emailVerified: true,
        teamMemberships: {
          select: {
            id: true,
            team: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { email: 'asc' },
    }),
    // Clients with nested brands and jobs
    prisma.client.findMany({
      select: {
        id: true,
        name: true,
        isArchived: true,
        brands: {
          select: {
            id: true,
            name: true,
            isArchived: true,
            jobs: {
              select: {
                id: true,
                jobNumber: true,
                title: true,
                isArchived: true,
                estimate: true,
                billedAmount: true,
                paidAmount: true,
                purchaseOrder: true,
              },
              orderBy: { jobNumber: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    }),
    // Teams
    prisma.team.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <AdminDashboardClient
      users={allUsers}
      clients={allClients}
      teams={allTeams}
    />
  );
}



