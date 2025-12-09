import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from '@/auth';
import Header from './components/Header';
import { prisma } from '@/lib/prisma';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Management",
  description: "Asana replacement for project management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  // Get unread notification count
  let unreadNotificationCount = 0;
  if (session?.user?.id) {
    try {
      unreadNotificationCount = await prisma.notification.count({
        where: {
          userId: session.user.id,
          read: false,
        },
      });
    } catch (error) {
      console.error('Error getting notification count:', error);
    }
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        {session?.user && <Header user={session.user} unreadNotificationCount={unreadNotificationCount} />}
        {children}
      </body>
    </html>
  );
}



