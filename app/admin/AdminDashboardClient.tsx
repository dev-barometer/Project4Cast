// app/admin/AdminDashboardClient.tsx
// Simplified admin dashboard with 3 tabs: Users, Work, Financial

'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import {
  deleteUser,
  assignAdminRole,
  removeAdminRole,
  assignUserToTeams,
  createTeam,
  updateJobFinancials,
  archiveJob,
  unarchiveJob,
  deleteJob,
  deleteClient,
  deleteBrand,
} from './actions';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: 'OWNER' | 'ADMIN' | 'USER';
  isPaused: boolean;
  teamMemberships: Array<{
    id: string;
    team: {
      id: string;
      name: string;
    };
  }>;
};

type Client = {
  id: string;
  name: string;
  isArchived: boolean;
  brands: Array<{
    id: string;
    name: string;
    isArchived: boolean;
    jobs: Array<{
      id: string;
      jobNumber: string;
      title: string;
      isArchived: boolean;
      estimate: number | null;
      billedAmount: number | null;
      paidAmount: number | null;
      purchaseOrder: string | null;
    }>;
  }>;
};

type Team = {
  id: string;
  name: string;
};

type AdminDashboardClientProps = {
  users: User[];
  clients: Client[];
  teams: Team[];
};

export default function AdminDashboardClient({
  users,
  clients,
  teams,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'work' | 'financial'>('users');

  // Debug: Log data to console
  useEffect(() => {
    console.log('Admin Dashboard Data:', { users: users.length, clients: clients.length, teams: teams.length });
  }, [users, clients, teams]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate financial totals
  const financialData = clients.map(client => {
    const brandTotals = client.brands.map(brand => {
      const jobs = brand.jobs || [];
      return {
        brandId: brand.id,
        brandName: brand.name,
        estimate: jobs.reduce((sum, job) => sum + (job.estimate || 0), 0),
        billed: jobs.reduce((sum, job) => sum + (job.billedAmount || 0), 0),
        paid: jobs.reduce((sum, job) => sum + (job.paidAmount || 0), 0),
      };
    });
    return {
      clientId: client.id,
      clientName: client.name,
      brands: brandTotals,
      estimate: brandTotals.reduce((sum, b) => sum + b.estimate, 0),
      billed: brandTotals.reduce((sum, b) => sum + b.billed, 0),
      paid: brandTotals.reduce((sum, b) => sum + b.paid, 0),
    };
  });

  return (
    <div style={{ padding: '40px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
          Admin Dashboard
        </h1>
        <div style={{ marginTop: 16, fontSize: 12, color: '#718096' }}>
          <Link href="/" style={{ color: '#4299e1', textDecoration: 'none', fontSize: 14 }}>
            ← Home
          </Link>
          <span style={{ marginLeft: 16 }}>
            Users: {users.length} | Clients: {clients.length} | Teams: {teams.length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #e2e8f0' }}>
        {(['users', 'work', 'financial'] as const).map((tab) => (
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

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 24 }}>Users</h2>
          {users.length === 0 ? (
            <p style={{ color: '#718096', fontSize: 14 }}>No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f7fafc' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                      Name
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                      Email
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                      Role
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13, minWidth: 200 }}>
                      Teams
                    </th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px 8px', color: '#2d3748', fontWeight: 500 }}>
                      {user.name || '—'}
                    </td>
                    <td style={{ padding: '12px 8px', color: '#4a5568' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {user.role === 'OWNER' ? (
                        <span style={{ fontSize: 12, color: '#742a2a', fontWeight: 500 }}>👑 Owner</span>
                      ) : (
                        <RoleDropdown userId={user.id} currentRole={user.role} />
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>
                      <UserTeamsList userId={user.id} teams={user.teamMemberships.map(tm => tm.team)} allTeams={teams} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {user.role !== 'OWNER' && (
                        <DeleteUserButton userId={user.id} userEmail={user.email} />
                      )}
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Work Tab */}
      {activeTab === 'work' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 24 }}>Work</h2>
          {clients.length === 0 ? (
            <p style={{ color: '#718096', fontSize: 14 }}>No clients found.</p>
          ) : (
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 12 }}>
                    Job
                  </th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 12 }}>
                    Active
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 12 }}>
                    P.O.
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 12 }}>
                    Estimate
                  </th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 12 }}>
                    Billed
                  </th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 12 }}>
                    Paid
                  </th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 12 }}>
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <>
                    {/* Client Row */}
                    <ClientRow key={`client-${client.id}`} clientId={client.id} clientName={client.name} />
                    {client.brands.map((brand) => (
                      <>
                        {/* Brand Row */}
                        <BrandRow key={`brand-${brand.id}`} brandId={brand.id} brandName={brand.name} />
                        {/* Job Rows */}
                            {brand.jobs.map((job) => (
                              <JobRow
                                key={job.id}
                                job={job}
                              />
                            ))}
                      </>
                    ))}
                  </>
                ))}
                {/* Totals Row */}
                <TotalsRow clients={clients} />
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 24 }}>Financial</h2>
          {financialData.length === 0 ? (
            <p style={{ color: '#718096', fontSize: 14 }}>No financial data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {financialData.map((clientData) => (
                <div key={clientData.clientId} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
                  {clientData.clientName}
                </h3>
                <div style={{ marginLeft: 20 }}>
                  {clientData.brands.map((brandData) => (
                    <div key={brandData.brandId} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f4f8' }}>
                      <h4 style={{ fontSize: 16, fontWeight: 500, color: '#4a5568', marginBottom: 8 }}>
                        {brandData.brandName}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Estimate</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: '#2d3748' }}>
                            {formatCurrency(brandData.estimate)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Billed</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: '#4299e1' }}>
                            {formatCurrency(brandData.billed)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Paid</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: '#38a169' }}>
                            {formatCurrency(brandData.paid)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Total Estimate</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#2d3748' }}>
                        {formatCurrency(clientData.estimate)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Total Billed</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#4299e1' }}>
                        {formatCurrency(clientData.billed)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Total Paid</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#38a169' }}>
                        {formatCurrency(clientData.paid)}
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Role Dropdown Component
function RoleDropdown({ userId, currentRole }: { userId: string; currentRole: 'ADMIN' | 'USER' }) {
  const [assignState, assignAction] = useFormState(assignAdminRole, { success: false, error: null });
  const [removeState, removeAction] = useFormState(removeAdminRole, { success: false, error: null });

  useEffect(() => {
    if (assignState?.success || removeState?.success) {
      window.location.reload();
    }
  }, [assignState?.success, removeState?.success]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'ADMIN' | 'USER';
    if (newRole !== currentRole) {
      const formData = new FormData();
      formData.append('userId', userId);
      if (newRole === 'ADMIN') {
        assignAction(formData);
      } else {
        removeAction(formData);
      }
    }
  };

  return (
    <div>
      <select
        value={currentRole}
        onChange={handleRoleChange}
        style={{
          padding: '4px 8px',
          border: '1px solid #cbd5e0',
          borderRadius: 4,
          fontSize: 13,
          cursor: 'pointer',
          backgroundColor: '#ffffff',
        }}
      >
        <option value="USER">user</option>
        <option value="ADMIN">admin</option>
      </select>
      {(assignState?.error || removeState?.error) && (
        <div style={{ fontSize: 11, color: '#e53e3e', marginTop: 4 }}>
          {assignState?.error || removeState?.error}
        </div>
      )}
    </div>
  );
}

// User Teams List Component
function UserTeamsList({ userId, teams, allTeams }: { userId: string; teams: Array<{ id: string; name: string }>; allTeams: Team[] }) {
  const [showPopup, setShowPopup] = useState(false);
  const [state, formAction] = useFormState(assignUserToTeams, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  const removeTeam = (teamId: string) => {
    const currentTeamIds = teams.map(t => t.id).filter(id => id !== teamId);
    const formData = new FormData();
    formData.append('userId', userId);
    currentTeamIds.forEach(id => formData.append('teamIds', id));
    formAction(formData);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {teams.length === 0 ? (
          <span style={{ color: '#a0aec0', fontSize: 12 }}>No teams</span>
        ) : (
          teams.map((team) => (
            <span
              key={team.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                backgroundColor: '#e6f2ff',
                borderRadius: 4,
                fontSize: 12,
                color: '#2c5282',
              }}
            >
              {team.name}
              <button
                onClick={() => removeTeam(team.id)}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#cbd5e0',
                  color: '#4a5568',
                  cursor: 'pointer',
                  fontSize: 12,
                  lineHeight: 1,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                type="button"
              >
                –
              </button>
            </span>
          ))
        )}
        <button
          onClick={() => setShowPopup(true)}
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '1px solid #cbd5e0',
            backgroundColor: '#ffffff',
            color: '#4a5568',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          type="button"
        >
          +
        </button>
      </div>
      {showPopup && (
        <TeamManagementPopup
          userId={userId}
          currentTeams={teams.map(t => t.id)}
          allTeams={allTeams}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

// Team Management Popup Component
function TeamManagementPopup({ userId, currentTeams, allTeams, onClose }: { userId: string; currentTeams: string[]; allTeams: Team[]; onClose: () => void }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [state, formAction] = useFormState(assignUserToTeams, { success: false, error: null });
  const [createState, createAction] = useFormState(createTeam, { success: false, error: null });

  useEffect(() => {
    if (state?.success || createState?.success) {
      window.location.reload();
    }
  }, [state?.success, createState?.success]);

  const handleTeamToggle = (teamId: string, checked: boolean) => {
    const newTeamIds = checked
      ? [...currentTeams, teamId]
      : currentTeams.filter(id => id !== teamId);
    
    const formData = new FormData();
    formData.append('userId', userId);
    newTeamIds.forEach(id => formData.append('teamIds', id));
    formAction(formData);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 8,
          padding: 24,
          maxWidth: 500,
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748' }}>Manage Teams</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              color: '#718096',
              cursor: 'pointer',
              padding: 0,
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            type="button"
          >
            ×
          </button>
        </div>

        {!showCreateForm ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#38a169',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                type="button"
              >
                + Create New Team
              </button>
            </div>

            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 }}>
              {allTeams.length === 0 ? (
                <p style={{ fontSize: 13, color: '#718096', textAlign: 'center', padding: 20 }}>
                  No teams available. Create one to get started.
                </p>
              ) : (
                allTeams.map(team => (
                  <label
                    key={team.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 0',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={currentTeams.includes(team.id)}
                      onChange={(e) => handleTeamToggle(team.id, e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 14, color: '#2d3748' }}>{team.name}</span>
                  </label>
                ))
              )}
            </div>
          </>
        ) : (
          <CreateTeamFormInline
            onCancel={() => setShowCreateForm(false)}
            onCreateSuccess={() => {
              setShowCreateForm(false);
              window.location.reload();
            }}
          />
        )}

        {state?.error && (
          <div style={{ marginTop: 12, padding: '8px 12px', backgroundColor: '#fed7d7', color: '#742a2a', borderRadius: 6, fontSize: 13 }}>
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline Create Team Form Component
function CreateTeamFormInline({ onCancel, onCreateSuccess }: { onCancel: () => void; onCreateSuccess: () => void }) {
  const [state, formAction] = useFormState(createTeam, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      onCreateSuccess();
    }
  }, [state?.success, onCreateSuccess]);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>Create New Team</h4>
      {state?.error && (
        <div style={{ backgroundColor: '#fed7d7', color: '#742a2a', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
          {state.error}
        </div>
      )}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 }}>
          Team Name *
        </label>
        <input
          type="text"
          name="name"
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #cbd5e0',
            borderRadius: 6,
            fontSize: 14,
          }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 }}>
          Description
        </label>
        <input
          type="text"
          name="description"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #cbd5e0',
            borderRadius: 6,
            fontSize: 14,
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#38a169',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Create Team
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#cbd5e0',
            color: '#4a5568',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Delete User Button Component
function DeleteUserButton({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction] = useFormState(deleteUser, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  // If there's an error (like self-deletion), show it and reset confirm state
  useEffect(() => {
    if (state?.error) {
      setShowConfirm(false);
    }
  }, [state?.error]);

  if (state?.error) {
    return (
      <div style={{ fontSize: 11, color: '#e53e3e', maxWidth: 250, lineHeight: 1.4, textAlign: 'right' }}>
        {state.error}
      </div>
    );
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#fed7d7',
          color: '#742a2a',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        type="button"
      >
        –
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: 'inline-block' }}>
      <input type="hidden" name="userId" value={userId} />
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#742a2a' }}>Delete?</span>
        <button
          type="submit"
          style={{
            padding: '2px 8px',
            backgroundColor: '#e53e3e',
            color: '#ffffff',
            border: 'none',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          style={{
            padding: '2px 8px',
            backgroundColor: '#cbd5e0',
            color: '#4a5568',
            border: 'none',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          No
        </button>
      </div>
    </form>
  );
}

// Delete Client Button Component
function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction] = useFormState(deleteClient, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#fed7d7',
          color: '#742a2a',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        type="button"
      >
        –
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: 'inline-block' }}>
      <input type="hidden" name="clientId" value={clientId} />
      {state?.error && <div style={{ fontSize: 11, color: '#e53e3e' }}>{state.error}</div>}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#742a2a' }}>Delete?</span>
        <button
          type="submit"
          style={{
            padding: '2px 8px',
            backgroundColor: '#e53e3e',
            color: '#ffffff',
            border: 'none',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          style={{
            padding: '2px 8px',
            backgroundColor: '#cbd5e0',
            color: '#4a5568',
            border: 'none',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          No
        </button>
      </div>
    </form>
  );
}

// Delete Brand Button Component
function DeleteBrandButton({ brandId, brandName }: { brandId: string; brandName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction] = useFormState(deleteBrand, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#fed7d7',
          color: '#742a2a',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        type="button"
      >
        –
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: 'inline-block' }}>
      <input type="hidden" name="brandId" value={brandId} />
      {state?.error && <div style={{ fontSize: 11, color: '#e53e3e' }}>{state.error}</div>}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#742a2a' }}>Delete?</span>
        <button
          type="submit"
          style={{
            padding: '2px 8px',
            backgroundColor: '#e53e3e',
            color: '#ffffff',
            border: 'none',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          style={{
            padding: '2px 8px',
            backgroundColor: '#cbd5e0',
            color: '#4a5568',
            border: 'none',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          No
        </button>
      </div>
    </form>
  );
}

// Client Row Component
function ClientRow({ clientId, clientName }: { clientId: string; clientName: string }) {
  return (
    <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
      <td style={{ padding: '12px', fontWeight: 600, fontSize: 16, color: '#2d3748' }} colSpan={6}>
        {clientName}
      </td>
      <td style={{ padding: '12px', textAlign: 'right' }}>
        <DeleteClientButton clientId={clientId} clientName={clientName} />
      </td>
    </tr>
  );
}

// Brand Row Component
function BrandRow({ brandId, brandName }: { brandId: string; brandName: string }) {
  return (
    <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #e2e8f0' }}>
      <td style={{ padding: '10px 12px 10px 24px', fontWeight: 500, fontSize: 14, color: '#4a5568' }} colSpan={6}>
        {brandName}
      </td>
      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
        <DeleteBrandButton brandId={brandId} brandName={brandName} />
      </td>
    </tr>
  );
}

// Totals Row Component
function TotalsRow({ clients }: { clients: Client[] }) {
  // Calculate totals across all jobs
  let totalEstimate = 0;
  let totalBilled = 0;
  let totalPaid = 0;

  clients.forEach((client) => {
    client.brands.forEach((brand) => {
      brand.jobs.forEach((job) => {
        totalEstimate += job.estimate || 0;
        totalBilled += job.billedAmount || 0;
        totalPaid += job.paidAmount || 0;
      });
    });
  });

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <tr style={{ backgroundColor: '#f7fafc', borderTop: '2px solid #e2e8f0', fontWeight: 600 }}>
      <td style={{ padding: '12px', color: '#2d3748', fontSize: 14 }}>Total</td>
      <td style={{ padding: '12px', textAlign: 'center' }}></td>
      <td style={{ padding: '12px' }}></td>
      <td style={{ padding: '12px', color: '#2d3748', fontSize: 14 }}>
        {formatCurrency(totalEstimate)}
      </td>
      <td style={{ padding: '12px', textAlign: 'center', color: '#4299e1', fontSize: 14 }}>
        {formatCurrency(totalBilled)}
      </td>
      <td style={{ padding: '12px', textAlign: 'center', color: '#38a169', fontSize: 14 }}>
        {formatCurrency(totalPaid)}
      </td>
      <td style={{ padding: '12px', textAlign: 'right' }}></td>
    </tr>
  );
}

// Job Row Component
function JobRow({ job }: { 
  job: { id: string; jobNumber: string; title: string; isArchived: boolean; estimate: number | null; billedAmount: number | null; paidAmount: number | null; purchaseOrder: string | null };
}) {
  const isBilled = job.billedAmount !== null && job.billedAmount > 0;
  const isPaid = job.paidAmount !== null && job.paidAmount > 0;
  // Only grey out when BOTH billed AND paid are checked
  const shouldGreyOut = isBilled && isPaid;

  return (
    <tr style={{ borderBottom: '1px solid #f0f4f8', opacity: shouldGreyOut ? 0.5 : 1 }}>
      <td style={{ padding: '8px 12px 8px 36px', color: '#2d3748' }}>
        <span style={{ fontWeight: 500 }}>{job.jobNumber}</span> {job.title}
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
        <ActiveToggle jobId={job.id} isActive={!job.isArchived} />
      </td>
      <td style={{ padding: '8px 12px' }}>
        <PurchaseOrderField jobId={job.id} purchaseOrder={job.purchaseOrder} />
      </td>
      <td style={{ padding: '8px 12px' }}>
        <EstimateField jobId={job.id} estimate={job.estimate} isLocked={isBilled} />
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <BilledAmountField jobId={job.id} billedAmount={job.billedAmount} isLocked={isPaid} />
          <BilledCheckbox jobId={job.id} isBilled={isBilled} billedAmount={job.billedAmount} />
        </div>
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <PaidAmountField jobId={job.id} paidAmount={job.paidAmount} billedAmount={job.billedAmount} isPaid={isPaid} />
          <PaidCheckbox jobId={job.id} isPaid={isPaid} billedAmount={job.billedAmount} />
        </div>
      </td>
      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
        <DeleteJobButton jobId={job.id} jobNumber={job.jobNumber} />
      </td>
    </tr>
  );
}

// Job Edit Form Component
function JobEditForm({ job, onCancel }: { job: { id: string; jobNumber: string; title: string; estimate: number | null; billedAmount: number | null; paidAmount: number | null; purchaseOrder: string | null }; onCancel: () => void }) {
  const [state, formAction] = useFormState(updateJobFinancials, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  return (
    <tr>
      <td colSpan={7} style={{ padding: '12px', backgroundColor: '#f7fafc' }}>
        <form action={formAction} style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
          <input type="hidden" name="jobId" value={job.id} />
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#718096', marginBottom: 4 }}>Estimate ($)</label>
            <input
              type="number"
              name="estimate"
              step="0.01"
              min="0"
              defaultValue={job.estimate || ''}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #cbd5e0',
                borderRadius: 4,
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#718096', marginBottom: 4 }}>Billed ($)</label>
            <input
              type="number"
              name="billedAmount"
              step="0.01"
              min="0"
              defaultValue={job.billedAmount || ''}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #cbd5e0',
                borderRadius: 4,
                fontSize: 13,
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#718096', marginBottom: 4 }}>Paid ($)</label>
            <input
              type="number"
              name="paidAmount"
              step="0.01"
              min="0"
              defaultValue={job.paidAmount || ''}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #cbd5e0',
                borderRadius: 4,
                fontSize: 13,
              }}
            />
          </div>
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
        </form>
        {state?.error && <div style={{ fontSize: 11, color: '#e53e3e', marginTop: 4 }}>{state.error}</div>}
      </td>
    </tr>
  );
}

// Active Toggle Component
function ActiveToggle({ jobId, isActive }: { jobId: string; isActive: boolean }) {
  const [state, formAction] = useFormState(
    isActive ? archiveJob : unarchiveJob,
    { success: false, error: null }
  );

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  return (
    <form action={formAction}>
      <input type="hidden" name="jobId" value={jobId} />
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => {
            if (e.target.checked !== isActive) {
              formAction(new FormData(e.target.form!));
            }
          }}
          style={{ cursor: 'pointer' }}
        />
      </label>
    </form>
  );
}

// Purchase Order Field Component
function PurchaseOrderField({ jobId, purchaseOrder }: { jobId: string; purchaseOrder: string | null }) {
  const [value, setValue] = useState(purchaseOrder || '');
  const [state, formAction] = useFormState(updateJobFinancials, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      // Don't reload, just update the value
    }
  }, [state?.success]);

  const handleBlur = () => {
    if (value !== (purchaseOrder || '')) {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('purchaseOrder', value);
      formAction(formData);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      placeholder="P.O. Number"
      style={{
        width: '100%',
        padding: '4px 8px',
        border: '1px solid #cbd5e0',
        borderRadius: 4,
        fontSize: 12,
      }}
    />
  );
}

// Estimate Field Component
function EstimateField({ jobId, estimate, isLocked }: { jobId: string; estimate: number | null; isLocked: boolean }) {
  const [value, setValue] = useState(estimate?.toString() || '');
  const [state, formAction] = useFormState(updateJobFinancials, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  const handleBlur = () => {
    const numValue = value === '' ? null : parseFloat(value);
    if (numValue !== estimate) {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('estimate', value === '' ? '' : value);
      formAction(formData);
    }
  };

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={isLocked}
      step="0.01"
      min="0"
      placeholder="0.00"
      style={{
        width: '100%',
        padding: '4px 8px',
        border: '1px solid #cbd5e0',
        borderRadius: 4,
        fontSize: 12,
        backgroundColor: isLocked ? '#f7fafc' : '#ffffff',
        cursor: isLocked ? 'not-allowed' : 'text',
      }}
    />
  );
}

// Billed Amount Field Component
function BilledAmountField({ jobId, billedAmount, isLocked }: { jobId: string; billedAmount: number | null; isLocked: boolean }) {
  const [value, setValue] = useState(billedAmount?.toString() || '');
  const [state, formAction] = useFormState(updateJobFinancials, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  const handleBlur = () => {
    const numValue = value === '' ? null : parseFloat(value);
    if (numValue !== billedAmount) {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('billedAmount', value === '' ? '' : value);
      formAction(formData);
    }
  };

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={isLocked}
      step="0.01"
      min="0"
      placeholder="0.00"
      style={{
        width: '80px',
        padding: '4px 8px',
        border: '1px solid #cbd5e0',
        borderRadius: 4,
        fontSize: 12,
        backgroundColor: isLocked ? '#f7fafc' : '#ffffff',
        cursor: isLocked ? 'not-allowed' : 'text',
      }}
    />
  );
}

// Billed Checkbox Component
function BilledCheckbox({ jobId, isBilled, billedAmount }: { jobId: string; isBilled: boolean; billedAmount: number | null }) {
  const [state, formAction] = useFormState(updateJobFinancials, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  const toggleBilled = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    formData.append('jobId', jobId);
    if (e.target.checked) {
      // When checking, set billedAmount if not already set
      if (!billedAmount || billedAmount === 0) {
        formData.append('billedAmount', '0');
      }
    } else {
      // When unchecking, clear billedAmount
      formData.append('billedAmount', '');
    }
    formAction(formData);
  };

  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={isBilled}
        onChange={toggleBilled}
        style={{ cursor: 'pointer' }}
      />
      <span style={{ fontSize: 10, marginLeft: 4, color: '#718096' }}>Billed</span>
    </label>
  );
}

// Paid Amount Field Component
function PaidAmountField({ jobId, paidAmount, billedAmount, isPaid }: { jobId: string; paidAmount: number | null; billedAmount: number | null; isPaid: boolean }) {
  const [value, setValue] = useState(paidAmount?.toString() || '');
  const [state, formAction] = useFormState(updateJobFinancials, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  const handleBlur = () => {
    const numValue = value === '' ? null : parseFloat(value);
    if (numValue !== paidAmount) {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('paidAmount', value === '' ? '' : value);
      formAction(formData);
    }
  };

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={isPaid}
      step="0.01"
      min="0"
      placeholder="0.00"
      style={{
        width: '80px',
        padding: '4px 8px',
        border: '1px solid #cbd5e0',
        borderRadius: 4,
        fontSize: 12,
        backgroundColor: isPaid ? '#f7fafc' : '#ffffff',
        cursor: isPaid ? 'not-allowed' : 'text',
      }}
    />
  );
}

// Paid Checkbox Component
function PaidCheckbox({ jobId, isPaid, billedAmount }: { jobId: string; isPaid: boolean; billedAmount: number | null }) {
  const [state, formAction] = useFormState(updateJobFinancials, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  const togglePaid = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    formData.append('jobId', jobId);
    if (e.target.checked) {
      // When checking, set paidAmount to billedAmount
      const paidValue = billedAmount && billedAmount > 0 ? billedAmount.toString() : '0';
      formData.append('paidAmount', paidValue);
    } else {
      // When unchecking, clear paidAmount
      formData.append('paidAmount', '');
    }
    formAction(formData);
  };

  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={isPaid}
        onChange={togglePaid}
        style={{ cursor: 'pointer' }}
      />
      <span style={{ fontSize: 10, marginLeft: 4, color: '#718096' }}>Paid</span>
    </label>
  );
}

// Delete Job Button Component
function DeleteJobButton({ jobId, jobNumber }: { jobId: string; jobNumber: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction] = useFormState(deleteJob, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state?.success]);

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: 'none',
          backgroundColor: '#fed7d7',
          color: '#742a2a',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        type="button"
      >
        –
      </button>
    );
  }

  return (
    <form action={formAction} style={{ display: 'inline-block' }}>
      <input type="hidden" name="jobId" value={jobId} />
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#742a2a' }}>Delete?</span>
        <button
          type="submit"
          style={{
            padding: '2px 6px',
            backgroundColor: '#e53e3e',
            color: '#ffffff',
            border: 'none',
            borderRadius: 3,
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          style={{
            padding: '2px 6px',
            backgroundColor: '#cbd5e0',
            color: '#4a5568',
            border: 'none',
            borderRadius: 3,
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          No
        </button>
      </div>
    </form>
  );
}

