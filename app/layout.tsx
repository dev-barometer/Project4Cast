import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from '@/auth';
import Header from './components/Header';

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

  return (
    <html lang="en">
      <body className={inter.className}>
        {session?.user && <Header user={session.user} />}
        {children}
      </body>
    </html>
  );
}



