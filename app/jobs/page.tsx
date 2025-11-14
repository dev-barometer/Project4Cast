// app/jobs/page.tsx

import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { jobNumber: 'asc' },
    include: {
      brand: {
        include: {
          client: true,
        },
      },
      tasks: true,
    },
  });

  return (
    <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
            Jobs
          </h1>
          <p style={{ marginTop: 8, color: '#718096', fontSize: 15 }}>
            All jobs in the system, with client, brand, and task info.
          </p>
        </div>
        <Link
          href="/jobs/new"
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            background: '#4299e1',
            color: 'white',
            fontSize: 14,
            textDecoration: 'none',
            fontWeight: 500,
            display: 'inline-block',
          }}
        >
          + Create New Job
        </Link>
      </div>

      <p style={{ marginTop: 8, marginBottom: 32, fontSize: 14, color: '#718096' }}>
        <Link href="/dev" style={{ color: '#4299e1' }}>Dev dashboard</Link> ·{' '}
        <Link href="/" style={{ color: '#4299e1' }}>Home</Link>
      </p>

      <section style={{ marginTop: 32 }}>
        {jobs.length === 0 ? (
          <p style={{ color: '#718096', padding: 24 }}>No jobs found.</p>
        ) : (
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              marginTop: 8,
              backgroundColor: '#ffffff',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f7fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>Job #</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>Title</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>Client</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>Brand</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>Tasks</th>
              </tr>
            </thead>
            <tbody>
  {jobs.map((job) => (
    <tr key={job.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
      <td style={{ padding: '12px 16px', color: '#2d3748' }}>
        <Link href={`/jobs/${job.id}`} style={{ color: '#4299e1', textDecoration: 'none' }}>{job.jobNumber}</Link>
      </td>
      <td style={{ padding: '12px 16px', color: '#2d3748' }}>
        {job.title}
      </td>
      <td style={{ padding: '12px 16px', color: '#4a5568' }}>
        {job.brand?.client?.name ?? '—'}
      </td>
      <td style={{ padding: '12px 16px', color: '#4a5568' }}>
        {job.brand?.name ?? '—'}
      </td>
      <td style={{ padding: '12px 16px', color: '#4a5568' }}>
        {job.status}
      </td>
      <td style={{ padding: '12px 16px', color: '#4a5568' }}>
        {job.tasks.length}
      </td>
    </tr>
  ))}
</tbody>

          </table>
        )}
      </section>
    </main>
  );
}
