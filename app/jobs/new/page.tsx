// app/jobs/new/page.tsx
// Create new job form

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import JobForm from './JobForm';

export default async function NewJobPage() {
  // Fetch all non-archived clients with their non-archived brands for the form
  const clients = await prisma.client.findMany({
    where: {
      isArchived: false,
    },
    include: {
      brands: {
        where: {
          isArchived: false,
        },
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
      </div>

      {/* Form Component */}
      <JobForm clients={clients} />
    </main>
  );
}

