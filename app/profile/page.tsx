import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProfilePageClient from './ProfilePageClient';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get user with all related data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teamMemberships: {
        include: {
          team: true,
        },
      },
      notificationPreferences: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to last 100 activities
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      website: true,
      pronouns: true,
      timezone: true,
      avatar: true,
      role: true,
      teamMemberships: {
        include: {
          team: true,
        },
      },
      notificationPreferences: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Get all available teams
  const allTeams = await prisma.team.findMany({
    orderBy: { name: 'asc' },
  });

  // Get all admins and owners for account deletion notification
  const admins = await prisma.user.findMany({
    where: { 
      role: { in: ['ADMIN', 'OWNER'] }
    },
    select: { id: true, email: true, name: true, role: true },
  });

  // Get all users for admin management (only if user is owner or admin)
  const allUsers = (user.role === 'OWNER' || user.role === 'ADMIN') 
    ? await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { email: 'asc' },
      })
    : [];

  return (
    <ProfilePageClient
      user={user}
      allTeams={allTeams}
      admins={admins}
      allUsers={allUsers}
    />
  );
}
