import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { auth } from '@/auth';
import Header from './components/Header';
import { prisma } from '@/lib/prisma';
import EmailVerificationWrapper from './components/EmailVerificationWrapper';
import ServiceWorkerRegistration from './sw-register';
import AutoRefresh from './components/AutoRefresh';

export const metadata: Metadata = {
  title: "Project4Cast",
  description: "Project4Cast - Project management platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Project4Cast",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#14B8A6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Project4Cast" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <ServiceWorkerRegistration />
        {session?.user && <Header user={session.user} unreadNotificationCount={unreadNotificationCount} />}
        {session?.user && <AutoRefresh enabled={true} />}
        <EmailVerificationWrapper>
          {children}
        </EmailVerificationWrapper>
      </body>
    </html>
  );
}



