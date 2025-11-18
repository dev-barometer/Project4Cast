import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 40, maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginTop: 80, marginBottom: 60 }}>
        <h1 style={{ fontSize: 48, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
          Project Management
        </h1>
        <p style={{ fontSize: 18, color: '#718096', maxWidth: 600, margin: '0 auto' }}>
          Organize your projects by client, brand, and job. Manage tasks, collaborate with your team, and stay on track.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 48 }}>
        <Link
          href="/my-tasks"
          className="card-link"
          style={{
            display: 'block',
            backgroundColor: '#ffffff',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            textDecoration: 'none',
            border: '2px solid #4299e1',
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
            My Tasks
          </h2>
          <p style={{ fontSize: 14, color: '#718096', margin: 0, lineHeight: 1.6 }}>
            View and manage tasks assigned to you across all jobs.
          </p>
        </Link>

        <Link
          href="/jobs"
          className="card-link"
          style={{
            display: 'block',
            backgroundColor: '#ffffff',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            textDecoration: 'none',
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
            Jobs
          </h2>
          <p style={{ fontSize: 14, color: '#718096', margin: 0, lineHeight: 1.6 }}>
            View and manage all your jobs organized by client and brand.
          </p>
        </Link>

        <Link
          href="/tasks"
          className="card-link"
          style={{
            display: 'block',
            backgroundColor: '#ffffff',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            textDecoration: 'none',
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
            All Tasks
          </h2>
          <p style={{ fontSize: 14, color: '#718096', margin: 0, lineHeight: 1.6 }}>
            View and manage all tasks across all jobs in one place.
          </p>
        </Link>

        <Link
          href="/dev"
          className="card-link"
          style={{
            display: 'block',
            backgroundColor: '#ffffff',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            textDecoration: 'none',
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
            Dev Dashboard
          </h2>
          <p style={{ fontSize: 14, color: '#718096', margin: 0, lineHeight: 1.6 }}>
            Quick overview of all data in the system for development purposes.
          </p>
        </Link>
      </div>
    </main>
  );
}



