import { ReactNode } from 'react';

export default function JobsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div 
      className="jobs-layout"
      style={{ 
        display: 'flex', 
        flexDirection: 'row',
        height: 'calc(100vh - 60px)', 
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
}
