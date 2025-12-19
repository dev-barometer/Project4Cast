// app/components/EmailVerificationWrapper.tsx
// Server component wrapper to show verification banner for unverified users

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import EmailVerificationBanner from './EmailVerificationBanner';

type EmailVerificationWrapperProps = {
  children: React.ReactNode;
};

export default async function EmailVerificationWrapper({ children }: EmailVerificationWrapperProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return <>{children}</>;
  }

  // Check if email is verified
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, email: true },
  });

  const isVerified = !!user?.emailVerified;

  return (
    <>
      {!isVerified && user && (
        <div style={{ padding: '20px 40px 0 40px', maxWidth: 1400, margin: '0 auto' }}>
          <EmailVerificationBanner userId={session.user.id} email={user.email} />
        </div>
      )}
      {children}
    </>
  );
}








