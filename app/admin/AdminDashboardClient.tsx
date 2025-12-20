// app/admin/AdminDashboardClient.tsx
// Client component for admin dashboard

'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { updateJobFinancials } from './actions';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: 'OWNER' | 'ADMIN' | 'USER';
};

type Client = {
  id: string;
  name: string;
  brands: Array<{
    id: string;
    name: string;
    _count: { jobs: number };
  }>;
};

type Brand = {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
  _count: { jobs: number };
};

type Job = {
  id: string;
  jobNumber: string;
  title: string;
  status: string;
  estimate: number | null;
  billedAmount: number | null;
  paidAmount: number | null;
  brand: {
    name: string;
    client: {
      id: string;
      name: string;
    } | null;
  };
  _count: {
    tasks: number;
    collaborators: number;
    attachments: number;
    comments: number;
  };
};

type Attachment = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
  job: {
    id: string;
    jobNumber: string;
    title: string;
  } | null;
  task: {
    id: string;
    title: string;
  } | null;
};

type Stats = {
  totalUsers: number;
  totalAdmins: number;
  totalClients: number;
  totalBrands: number;
  totalJobs: number;
  totalTasks: number;
  totalAttachments: number;
  totalEstimate: number;
  totalBilled: number;
  totalPaid: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    BLOCKED: number;
    DONE: number;
  };
};

type AdminDashboardClientProps = {
  stats: Stats;
  users: User[];
  clients: Client[];
  brands: Brand[];
  jobs: Job[];
  attachments: Attachment[];
};

export default function AdminDashboardClient({
  stats,
  users,
  clients,
  brands,
  jobs,
  attachments,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'users' | 'clients' | 'brands' | 'jobs' | 'files'>('overview');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div style={{ padding: '40px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#718096', fontSize: 16 }}>
          Overview and management of all clients, brands, jobs, files, and users
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
          <Link href="/" style={{ color: '#4299e1', textDecoration: 'none', fontSize: 14 }}>
            ← Home
          </Link>
          <Link href="/admin/collaborators" style={{ color: '#4299e1', textDecoration: 'none', fontSize: 14 }}>
            Collaborators
          </Link>
          <Link href="/admin/make-admin" style={{ color: '#4299e1', textDecoration: 'none', fontSize: 14 }}>
            Make Admin
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #e2e8f0' }}>
        {(['overview', 'financials', 'users', 'clients', 'brands', 'jobs', 'files'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #4299e1' : '2px solid transparent',
              color: activeTab === tab ? '#4299e1' : '#718096',
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {/* Stats Cards */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 8 }}>Total Users</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: '#2d3748' }}>{stats.totalUsers}</div>
            <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 4 }}>{stats.totalAdmins} admins</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 8 }}>Total Clients</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: '#2d3748' }}>{stats.totalClients}</div>
            <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 4 }}>{stats.totalBrands} brands</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 8 }}>Total Jobs</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: '#2d3748' }}>{stats.totalJobs}</div>
            <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 4 }}>{stats.totalTasks} tasks</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 8 }}>Total Attachments</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: '#2d3748' }}>{stats.totalAttachments}</div>
          </div>

          {/* Financial Summary */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>Financial Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Total Estimate</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#2d3748' }}>{formatCurrency(stats.totalEstimate)}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Total Billed</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#2d3748' }}>{formatCurrency(stats.totalBilled)}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Total Paid</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#2d3748' }}>{formatCurrency(stats.totalPaid)}</div>
              </div>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Outstanding</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#e53e3e' }}>
                {formatCurrency(stats.totalBilled - stats.totalPaid)}
              </div>
            </div>
          </div>

          {/* Task Status Breakdown */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>Tasks by Status</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>TODO</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#4299e1' }}>{stats.tasksByStatus.TODO}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>In Progress</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#ed8936' }}>{stats.tasksByStatus.IN_PROGRESS}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Blocked</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#e53e3e' }}>{stats.tasksByStatus.BLOCKED}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Done</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#38a169' }}>{stats.tasksByStatus.DONE}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financials Tab */}
      {activeTab === 'financials' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 24 }}>Project Financials</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Job
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Client/Brand
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Estimate
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Billed
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Paid
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Outstanding
                  </th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const outstanding = (job.billedAmount || 0) - (job.paidAmount || 0);
                  return (
                    <tr key={job.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                      <td style={{ padding: '12px 16px', color: '#2d3748' }}>
                        <Link href={`/jobs/${job.id}`} style={{ color: '#4299e1', textDecoration: 'none', fontWeight: 500 }}>
                          {job.jobNumber}
                        </Link>
                        <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 2 }}>{job.title}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                        {job.brand.client?.name} / {job.brand.name}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5568' }}>
                        {editingJobId === job.id ? (
                          <FinancialEditForm 
                            job={job} 
                            onCancel={() => setEditingJobId(null)}
                            onSuccess={() => setEditingJobId(null)}
                          />
                        ) : (
                          formatCurrency(job.estimate)
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5568' }}>
                        {formatCurrency(job.billedAmount)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5568' }}>
                        {formatCurrency(job.paidAmount)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: outstanding > 0 ? '#e53e3e' : '#4a5568', fontWeight: outstanding > 0 ? 600 : 400 }}>
                        {formatCurrency(outstanding)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {editingJobId === job.id ? null : (
                          <button
                            onClick={() => setEditingJobId(job.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#4299e1',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 24 }}>All Users</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Name
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Email
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Role
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px 16px', color: '#2d3748', fontWeight: 500 }}>
                      {user.name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: user.role === 'OWNER' ? '#fed7d7' : user.role === 'ADMIN' ? '#e6f2ff' : '#f0f4f8',
                          color: user.role === 'OWNER' ? '#742a2a' : user.role === 'ADMIN' ? '#2c5282' : '#4a5568',
                        }}
                      >
                        {user.role === 'OWNER' ? '👑 Owner' : user.role === 'ADMIN' ? '🔧 Admin' : '👤 User'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 24 }}>Clients & Brands</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {clients.map((client) => (
              <div key={client.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 12 }}>
                  {client.name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 16 }}>
                  {client.brands.map((brand) => (
                    <div key={brand.id} style={{ fontSize: 14, color: '#4a5568' }}>
                      <span style={{ fontWeight: 500 }}>{brand.name}</span>
                      <span style={{ color: '#a0aec0', marginLeft: 8 }}>({brand._count.jobs} jobs)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 24 }}>All Brands</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Brand
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Client
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Jobs
                  </th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px 16px', color: '#2d3748', fontWeight: 500 }}>
                      {brand.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>{brand.client.name}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5568' }}>
                      {brand._count.jobs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 24 }}>All Jobs</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Job Number
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Title
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Client/Brand
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Tasks
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Collaborators
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px 16px', color: '#2d3748' }}>
                      <Link href={`/jobs/${job.id}`} style={{ color: '#4299e1', textDecoration: 'none', fontWeight: 500 }}>
                        {job.jobNumber}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568' }}>{job.title}</td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                      {job.brand.client?.name} / {job.brand.name}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          backgroundColor: '#e6f2ff',
                          color: '#2c5282',
                        }}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5568' }}>
                      {job._count.tasks}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#4a5568' }}>
                      {job._count.collaborators}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 24 }}>Recent Attachments</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Filename
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Type
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Location
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Uploaded By
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {attachments.map((attachment) => (
                  <tr key={attachment.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px 16px', color: '#2d3748' }}>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#4299e1', textDecoration: 'none' }}
                      >
                        {attachment.filename}
                      </a>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                      {attachment.mimeType}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                      {attachment.job ? (
                        <Link href={`/jobs/${attachment.job.id}`} style={{ color: '#4299e1', textDecoration: 'none' }}>
                          {attachment.job.jobNumber}
                        </Link>
                      ) : attachment.task ? (
                        <span>Task: {attachment.task.title}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a5568', fontSize: 13 }}>
                      {attachment.uploadedBy.name || attachment.uploadedBy.email}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#718096', fontSize: 13 }}>
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Financial Edit Form Component
function FinancialEditForm({ job, onCancel, onSuccess }: { job: Job; onCancel: () => void; onSuccess: () => void }) {
  const [state, formAction] = useFormState(updateJobFinancials, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state?.success, onSuccess]);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 400 }}>
      <input type="hidden" name="jobId" value={job.id} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#718096', marginBottom: 4 }}>Estimate</label>
          <input
            type="number"
            name="estimate"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={job.estimate || ''}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #cbd5e0',
              borderRadius: 4,
              fontSize: 13,
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#718096', marginBottom: 4 }}>Billed</label>
          <input
            type="number"
            name="billedAmount"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={job.billedAmount || ''}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #cbd5e0',
              borderRadius: 4,
              fontSize: 13,
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#718096', marginBottom: 4 }}>Paid</label>
          <input
            type="number"
            name="paidAmount"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={job.paidAmount || ''}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #cbd5e0',
              borderRadius: 4,
              fontSize: 13,
            }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="submit"
          style={{
            padding: '6px 16px',
            backgroundColor: '#38a169',
            color: '#ffffff',
            border: 'none',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 16px',
            backgroundColor: '#cbd5e0',
            color: '#4a5568',
            border: 'none',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
      {state?.error && (
        <div style={{ fontSize: 12, color: '#e53e3e', marginTop: 4 }}>{state.error}</div>
      )}
    </form>
  );
}
