import { ReactNode } from 'react';

export default function JobsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
