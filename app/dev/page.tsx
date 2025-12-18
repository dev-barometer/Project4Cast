// app/dev/page.tsx

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CleanupButton from './CleanupButton';

export default async function DevPage() {
  const [clients, brands, jobs, tasks] = await Promise.all([
    prisma.client.findMany(),
    prisma.brand.findMany(),
    prisma.job.findMany({
      include: {
        brand: {
          include: {
            client: true,
          },
        },
        tasks: true,
      },
    }),
    prisma.task.findMany(),
  ]);

  return (
    <main style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>Dev Dashboard</h1>
      <p style={{ color: '#718096', fontSize: 15 }}>Quick snapshot of what's in the database.</p>

      <section style={{ marginTop: 32, backgroundColor: '#ffffff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>Counts</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '8px 0', color: '#4a5568', fontSize: 15 }}>Clients: <strong style={{ color: '#2d3748' }}>{clients.length}</strong></li>
          <li style={{ padding: '8px 0', color: '#4a5568', fontSize: 15 }}>Brands: <strong style={{ color: '#2d3748' }}>{brands.length}</strong></li>
          <li style={{ padding: '8px 0', color: '#4a5568', fontSize: 15 }}>Jobs: <strong style={{ color: '#2d3748' }}>{jobs.length}</strong></li>
          <li style={{ padding: '8px 0', color: '#4a5568', fontSize: 15 }}>Tasks: <strong style={{ color: '#2d3748' }}>{tasks.length}</strong></li>
        </ul>
      </section>

      <section style={{ marginTop: 32, backgroundColor: '#ffffff', padding: 24, borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>Jobs</h2>
        {jobs.length === 0 ? (
          <p style={{ color: '#718096', padding: 24 }}>No jobs yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {jobs.map((job) => (
              <li key={job.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f4f8' }}>
                <strong style={{ color: '#2d3748', fontSize: 15 }}>{job.jobNumber}</strong> — <span style={{ color: '#2d3748' }}>{job.title}</span> <span style={{ color: '#718096', fontSize: 14 }}>({job.status})</span>
                <br />
                <small style={{ color: '#a0aec0', fontSize: 13, display: 'block', marginTop: 4 }}>
                  Brand: {job.brand?.name} | Client: {job.brand?.client?.name}
                </small>
                {job.tasks.length > 0 && (
                  <div style={{ marginTop: 8, marginLeft: 16, color: '#4a5568', fontSize: 14 }}>
                    Tasks:{' '}
                    {job.tasks.map((task) => (
                      <span key={task.id} style={{ marginRight: 8 }}>
                        {task.title} <span style={{ color: '#a0aec0' }}>[{task.status}/{task.priority}]</span>
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 32, backgroundColor: '#fff5f5', padding: 24, borderRadius: 8, border: '1px solid #fed7d7' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#742a2a', marginBottom: 16 }}>⚠️ Danger Zone</h2>
        <p style={{ color: '#742a2a', fontSize: 14, marginBottom: 16 }}>
          This will delete ALL jobs, tasks, attachments, comments, clients, brands, and invitations.
          <br />
          <strong>Users will be preserved.</strong>
        </p>
        <CleanupButton />
      </section>

      <p style={{ marginTop: 32 }}>
        <Link href="/" style={{ color: '#4299e1', textDecoration: 'none', fontSize: 14 }}>← Back to home</Link>
      </p>
    </main>
  );
}
