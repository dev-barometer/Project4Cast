import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { auth } from '@/auth';
import Header from './components/Header';
import { prisma } from '@/lib/prisma';
import EmailVerificationWrapper from './components/EmailVerificationWrapper';

export const metadata: Metadata = {
  title: "Project Management",
  description: "Project4Cast - Project management platform",
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
    <html lang="en" className={GeistSans.className}>
      <body>
        {session?.user && <Header user={session.user} unreadNotificationCount={unreadNotificationCount} />}
        <EmailVerificationWrapper>
          {children}
        </EmailVerificationWrapper>
      </body>
    </html>
  );
}



