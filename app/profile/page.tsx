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
  });

  if (!user) {
    redirect('/login');
  }

  // Get all available teams
  const allTeams = await prisma.team.findMany({
    orderBy: { name: 'asc' },
  });

  // Get all admins for account deletion notification
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true },
  });

  return (
    <ProfilePageClient
      user={user}
      allTeams={allTeams}
      admins={admins}
    />
  );
}
