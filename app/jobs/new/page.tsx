// app/jobs/new/page.tsx
// Create new job form

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import JobForm from './JobForm';

export default async function NewJobPage() {
  // Fetch all clients with their brands for the form
  const clients = await prisma.client.findMany({
    include: {
      brands: {
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <main style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          Create New Job
        </h1>
        <p style={{ color: '#718096', fontSize: 15 }}>
          Create a new job and assign it to a client and brand.
        </p>
        <p style={{ marginTop: 16, fontSize: 14, color: '#718096' }}>
          <Link href="/jobs" style={{ color: '#4299e1', textDecoration: 'none' }}>← Back to Jobs</Link>
        </p>
      </div>

      {/* Form Component */}
      <JobForm clients={clients} />
    </main>
  );
}

