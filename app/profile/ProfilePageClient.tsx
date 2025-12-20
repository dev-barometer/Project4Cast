'use client';

import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  updateProfile,
  changePassword,
  updateTeams,
  updateNotificationPreferences,
  deleteAccount,
  assignAdmin,
  removeAdmin,
} from './actions';

type Team = {
  id: string;
  name: string;
  description: string | null;
};

type UserActivity = {
  id: string;
  type: string;
  details: string | null;
  createdAt: Date | string;
};

type NotificationPreferences = {
  id: string;
  jobAssignedInApp: boolean;
  jobAssignedEmail: boolean;
  commentMentionInApp: boolean;
  commentMentionEmail: boolean;
  jobChangeInApp: boolean;
  jobChangeEmail: boolean;
  taskCompleteInApp: boolean;
  taskCompleteEmail: boolean;
  taskOverdueInApp: boolean;
  taskOverdueEmail: boolean;
  frequency: string | null;
} | null;

type User = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  website: string | null;
  pronouns: string | null;
  timezone: string | null;
  avatar: string | null;
  teamMemberships: Array<{
    id: string;
    team: Team;
  }>;
  notificationPreferences: NotificationPreferences;
  activityLogs: UserActivity[];
};

type ProfilePageClientProps = {
  user: User & { role: 'OWNER' | 'ADMIN' | 'USER' };
  allTeams: Team[];
  admins: Array<{ id: string; email: string; name: string | null; role: 'OWNER' | 'ADMIN' | 'USER' }>;
  allUsers: Array<{ id: string; email: string; name: string | null; role: 'OWNER' | 'ADMIN' | 'USER' }>;
};

// Timezone options (common ones)
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

// Activity type labels
const ACTIVITY_LABELS: Record<string, string> = {
  SIGNED_IN: 'Signed in',
  SIGNED_OUT: 'Signed out',
  CREATED_TASK: 'Created task',
  MARKED_TASK_COMPLETE: 'Marked task complete',
  UPLOADED_FILE: 'Uploaded file',
  INVITED_COLLABORATOR: 'Invited collaborator',
  ASSIGNED_JOB: 'Assigned job',
  UPDATED_PROFILE: 'Updated profile',
  CHANGED_PASSWORD: 'Changed password',
  DELETED_ACCOUNT: 'Deleted account',
};

export default function ProfilePageClient({ user, allTeams, admins, allUsers }: ProfilePageClientProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'activity' | 'account' | 'admin'>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const isOwner = user.role === 'OWNER';
  const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER';
  const canManageAdmins = isOwner || isAdmin;

  const [profileState, profileAction] = useFormState(updateProfile, { success: false, error: null });
  const [passwordState, passwordAction] = useFormState(changePassword, { success: false, error: null });
  const [teamsState, teamsAction] = useFormState(updateTeams, { success: false, error: null });
  const [notificationsState, notificationsAction] = useFormState(updateNotificationPreferences, { success: false, error: null });
  const [deleteState, deleteAction] = useFormState(deleteAccount, { success: false, error: null });

  // Handle account deletion success - sign out and redirect
  useEffect(() => {
    if (deleteState?.success) {
      signOut({ redirect: true, callbackUrl: '/login' });
    }
  }, [deleteState?.success]);

  // Group activities by date
  const groupedActivities = user.activityLogs.reduce((acc, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, UserActivity[]>);

  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const prefs = user.notificationPreferences || {
    jobAssignedInApp: true,
    jobAssignedEmail: true,
    commentMentionInApp: true,
    commentMentionEmail: true,
    jobChangeInApp: true,
    jobChangeEmail: false,
    taskCompleteInApp: true,
    taskCompleteEmail: false,
    taskOverdueInApp: true,
    taskOverdueEmail: false,
    frequency: 'immediate',
  };

  const userTeamIds = user.teamMemberships.map(tm => tm.team.id);

  // Define tabs array with proper typing
  type TabType = 'profile' | 'notifications' | 'activity' | 'account' | 'admin';
  const baseTabs: TabType[] = ['profile', 'notifications', 'activity', 'account'];
  const tabs: TabType[] = canManageAdmins 
    ? [...baseTabs, 'admin']
    : baseTabs;

  return (
    <div style={{ padding: '40px', maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, color: '#2d3748', marginBottom: 32 }}>
        User Profile
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #e2e8f0' }}>
        {tabs.map((tab: TabType) => {
          if (tab === 'admin') {
            return (
              <Link
                key={tab}
                href="/admin"
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '2px solid transparent',
                  color: '#718096',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  textDecoration: 'none',
                }}
              >
                Admin
              </Link>
            );
          }
          return (
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
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Basic Information */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 20 }}>
                Basic Information
              </h2>
              <form action={profileAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {profileState?.error && (
                  <div style={{ backgroundColor: '#fed7d7', color: '#742a2a', padding: '12px 16px', borderRadius: 6, fontSize: 14 }}>
                    {profileState.error}
                  </div>
                )}
                {profileState?.success && (
                  <div style={{ backgroundColor: '#c6f6d5', color: '#22543d', padding: '12px 16px', borderRadius: 6, fontSize: 14 }}>
                    Profile updated successfully!
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={user.name || ''}
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      fontSize: 14,
                      backgroundColor: '#f7fafc',
                      color: '#718096',
                    }}
                  />
                  <p style={{ fontSize: 12, color: '#a0aec0', marginTop: 4 }}>Email cannot be changed</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 }}>
                    Phone Number <span style={{ color: '#a0aec0', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={user.phone || ''}
                    placeholder="+1 (555) 123-4567"
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
                    Website/Portfolio <span style={{ color: '#a0aec0', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="url"
                    name="website"
                    defaultValue={user.website || ''}
                    placeholder="https://example.com"
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
                    Pronouns <span style={{ color: '#a0aec0', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <select
                    name="pronouns"
                    defaultValue={user.pronouns || ''}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e0',
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  >
                    <option value="">Select pronouns</option>
                    <option value="he/him">he/him</option>
                    <option value="she/her">she/her</option>
                    <option value="they/them">they/them</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 }}>
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    defaultValue={user.timezone || ''}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e0',
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  >
                    <option value="">Select timezone</option>
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4299e1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Teams */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 20 }}>
                Teams
              </h2>
              <form action={teamsAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {teamsState?.error && (
                  <div style={{ backgroundColor: '#fed7d7', color: '#742a2a', padding: '12px 16px', borderRadius: 6, fontSize: 14 }}>
                    {teamsState.error}
                  </div>
                )}
                {teamsState?.success && (
                  <div style={{ backgroundColor: '#c6f6d5', color: '#22543d', padding: '12px 16px', borderRadius: 6, fontSize: 14 }}>
                    Teams updated successfully!
                  </div>
                )}
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 }}>
                  {allTeams.length === 0 ? (
                    <p style={{ fontSize: 14, color: '#718096' }}>No teams available</p>
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
                          name="teamIds"
                          value={team.id}
                          defaultChecked={userTeamIds.includes(team.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: 14, color: '#2d3748' }}>{team.name}</span>
                        {team.description && (
                          <span style={{ fontSize: 12, color: '#718096' }}>— {team.description}</span>
                        )}
                      </label>
                    ))
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#718096', marginTop: 8 }}>
                  Select teams to join. Team members have access to all jobs associated with their teams.
                </p>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4299e1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  Save Teams
                </button>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Change Password */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 20 }}>
                Change Password
              </h2>
              <form action={passwordAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {passwordState?.error && (
                  <div style={{ backgroundColor: '#fed7d7', color: '#742a2a', padding: '12px 16px', borderRadius: 6, fontSize: 14 }}>
                    {passwordState.error}
                  </div>
                )}
                {passwordState?.success && (
                  <div style={{ backgroundColor: '#c6f6d5', color: '#22543d', padding: '12px 16px', borderRadius: 6, fontSize: 14 }}>
                    Password changed successfully!
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
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
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e0',
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  />
                  <p style={{ fontSize: 12, color: '#a0aec0', marginTop: 4 }}>Must be at least 6 characters</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #cbd5e0',
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4299e1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 20 }}>
            Notification Preferences
          </h2>
          <form action={notificationsAction} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {notificationsState?.error && (
              <div style={{ backgroundColor: '#fed7d7', color: '#742a2a', padding: '12px 16px', borderRadius: 6, fontSize: 14 }}>
                {notificationsState.error}
              </div>
            )}
            {notificationsState?.success && (
              <div style={{ backgroundColor: '#c6f6d5', color: '#22543d', padding: '12px 16px', borderRadius: 6, fontSize: 14 }}>
                Notification preferences updated!
              </div>
            )}

            {/* Notification Types Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: 13, fontWeight: 600, color: '#4a5568' }}>
                      Notification Type
                    </th>
                    <th style={{ textAlign: 'center', padding: '12px', fontSize: 13, fontWeight: 600, color: '#4a5568' }}>
                      In-App
                    </th>
                    <th style={{ textAlign: 'center', padding: '12px', fontSize: 13, fontWeight: 600, color: '#4a5568' }}>
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px', fontSize: 14, color: '#2d3748' }}>Assigned to job</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="jobAssignedInApp" value="true" defaultChecked={prefs.jobAssignedInApp} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="jobAssignedInApp" value="false" defaultChecked={!prefs.jobAssignedInApp} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="jobAssignedEmail" value="true" defaultChecked={prefs.jobAssignedEmail} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="jobAssignedEmail" value="false" defaultChecked={!prefs.jobAssignedEmail} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px', fontSize: 14, color: '#2d3748' }}>Comment mention</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="commentMentionInApp" value="true" defaultChecked={prefs.commentMentionInApp} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="commentMentionInApp" value="false" defaultChecked={!prefs.commentMentionInApp} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="commentMentionEmail" value="true" defaultChecked={prefs.commentMentionEmail} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="commentMentionEmail" value="false" defaultChecked={!prefs.commentMentionEmail} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px', fontSize: 14, color: '#2d3748' }}>Job change</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="jobChangeInApp" value="true" defaultChecked={prefs.jobChangeInApp} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="jobChangeInApp" value="false" defaultChecked={!prefs.jobChangeInApp} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="jobChangeEmail" value="true" defaultChecked={prefs.jobChangeEmail} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="jobChangeEmail" value="false" defaultChecked={!prefs.jobChangeEmail} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px', fontSize: 14, color: '#2d3748' }}>Task complete</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="taskCompleteInApp" value="true" defaultChecked={prefs.taskCompleteInApp} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="taskCompleteInApp" value="false" defaultChecked={!prefs.taskCompleteInApp} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="taskCompleteEmail" value="true" defaultChecked={prefs.taskCompleteEmail} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="taskCompleteEmail" value="false" defaultChecked={!prefs.taskCompleteEmail} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px', fontSize: 14, color: '#2d3748' }}>Task overdue</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="taskOverdueInApp" value="true" defaultChecked={prefs.taskOverdueInApp} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="taskOverdueInApp" value="false" defaultChecked={!prefs.taskOverdueInApp} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="taskOverdueEmail" value="true" defaultChecked={prefs.taskOverdueEmail} />
                        <span style={{ fontSize: 13 }}>On</span>
                        <input type="radio" name="taskOverdueEmail" value="false" defaultChecked={!prefs.taskOverdueEmail} />
                        <span style={{ fontSize: 13 }}>Off</span>
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Frequency (only show if not immediate) */}
            {prefs.frequency !== 'immediate' && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a5568', marginBottom: 6 }}>
                  Frequency
                </label>
                <select
                  name="frequency"
                  defaultValue={prefs.frequency || 'immediate'}
                  style={{
                    width: '100%',
                    maxWidth: 300,
                    padding: '8px 12px',
                    border: '1px solid #cbd5e0',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#4299e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Save Preferences
            </button>
          </form>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 20 }}>
            Activity History
          </h2>
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {Object.keys(groupedActivities).length === 0 ? (
              <p style={{ fontSize: 14, color: '#718096' }}>No activity recorded yet</p>
            ) : (
              Object.entries(groupedActivities).map(([date, activities]) => (
                <div key={date} style={{ marginBottom: 16 }}>
                  <button
                    onClick={() => toggleDate(date)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#2d3748' }}>{date}</span>
                    <span style={{ fontSize: 12, color: '#718096' }}>
                      {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                    </span>
                    <span style={{ fontSize: 14, color: '#718096' }}>
                      {expandedDates.has(date) ? '▼' : '▶'}
                    </span>
                  </button>
                  {expandedDates.has(date) && (
                    <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: 'none' }}>
                      {activities.map(activity => (
                        <li
                          key={activity.id}
                          style={{
                            padding: '8px 16px',
                            fontSize: 14,
                            color: '#4a5568',
                            borderLeft: '2px solid #e2e8f0',
                            marginLeft: 16,
                            marginTop: 4,
                          }}
                        >
                          • {ACTIVITY_LABELS[activity.type] || activity.type}
                          <span style={{ fontSize: 12, color: '#a0aec0', marginLeft: 8 }}>
                            {new Date(activity.createdAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 20 }}>
            Account Management
          </h2>
          {!showDeleteConfirm ? (
            <div>
              <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 24 }}>
                Deleting your account will permanently remove all your data and cannot be undone.
                All admins will be notified of this action.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e53e3e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Delete Account
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {deleteState?.error && (
                <div style={{ backgroundColor: '#fed7d7', color: '#742a2a', padding: '12px 16px', borderRadius: 6, fontSize: 14 }}>
                  {deleteState.error}
                </div>
              )}
              <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fc8181', borderRadius: 6, padding: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#742a2a', marginBottom: 8 }}>
                  ⚠️ Warning: This action cannot be undone
                </p>
                <p style={{ fontSize: 14, color: '#742a2a', marginBottom: 16 }}>
                  All your data will be permanently deleted. Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #fc8181',
                    borderRadius: 6,
                    fontSize: 14,
                    marginBottom: 16,
                  }}
                />
                <form action={deleteAction}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="hidden" name="confirmText" value={deleteConfirmText} />
                    <button
                      type="submit"
                      disabled={deleteConfirmText !== 'DELETE'}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: deleteConfirmText === 'DELETE' ? '#e53e3e' : '#cbd5e0',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#ffffff',
                        color: '#4a5568',
                        border: '1px solid #cbd5e0',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Tab */}
      {activeTab === 'admin' && canManageAdmins && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2d3748', marginBottom: 8 }}>
              Admin Management
            </h2>
            <p style={{ fontSize: 14, color: '#718096' }}>
              {isOwner 
                ? 'As the owner, you can assign and remove admin privileges. Only you can remove admin privileges.'
                : 'You can assign admin privileges to other users. Only the owner can remove admin privileges.'}
            </p>
          </div>

          {/* Current Role Display */}
          <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f7fafc', borderRadius: 6 }}>
            <div style={{ fontSize: 14, color: '#4a5568', marginBottom: 4 }}>Your Role</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: isOwner ? '#742a2a' : '#2c5282' }}>
              {user.role === 'OWNER' ? '👑 Owner' : '🔧 Admin'}
            </div>
          </div>

          {/* Users Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f7fafc' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    User
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Role
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((targetUser) => {
                  const isCurrentUser = targetUser.id === user.id;
                  const isTargetOwner = targetUser.role === 'OWNER';
                  const isTargetAdmin = targetUser.role === 'ADMIN';
                  const canAssign = !isCurrentUser && !isTargetOwner && !isTargetAdmin;
                  const canRemove = isOwner && !isCurrentUser && !isTargetOwner && isTargetAdmin;

                  return (
                    <tr key={targetUser.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                      <td style={{ padding: '12px 16px', color: '#2d3748' }}>
                        <div style={{ fontWeight: 500 }}>{targetUser.name || targetUser.email}</div>
                        {targetUser.name && (
                          <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 2 }}>{targetUser.email}</div>
                        )}
                        {isCurrentUser && (
                          <div style={{ fontSize: 11, color: '#4299e1', marginTop: 2 }}>(You)</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 500,
                            backgroundColor: isTargetOwner ? '#fed7d7' : isTargetAdmin ? '#e6f2ff' : '#f0f4f8',
                            color: isTargetOwner ? '#742a2a' : isTargetAdmin ? '#2c5282' : '#4a5568',
                          }}
                        >
                          {isTargetOwner ? '👑 Owner' : isTargetAdmin ? '🔧 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {canAssign && (
                          <AdminAssignForm userId={targetUser.id} userEmail={targetUser.email} />
                        )}
                        {canRemove && (
                          <AdminRemoveForm userId={targetUser.id} userEmail={targetUser.email} />
                        )}
                        {!canAssign && !canRemove && (
                          <span style={{ color: '#a0aec0', fontSize: 13 }}>
                            {isCurrentUser ? '—' : isTargetOwner ? 'Cannot modify' : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Info Box */}
          <div style={{ marginTop: 24, padding: 16, backgroundColor: '#fff5f5', borderRadius: 6, border: '1px solid #fed7d7' }}>
            <p style={{ fontSize: 13, color: '#742a2a', margin: 0 }}>
              <strong>Note:</strong> {isOwner 
                ? 'As the owner, you have full access to all features. Only you can remove admin privileges from other users.'
                : 'Admins can assign admin privileges to other users, but only the owner can remove them.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Admin Assign Form Component
function AdminAssignForm({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [state, formAction] = useFormState(assignAdmin, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      // Form will revalidate automatically
    }
  }, [state?.success]);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
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
        Make Admin
      </button>
      {state?.error && (
        <div style={{ fontSize: 11, color: '#e53e3e', marginTop: 4 }}>{state.error}</div>
      )}
    </form>
  );
}

// Admin Remove Form Component
function AdminRemoveForm({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [state, formAction] = useFormState(removeAdmin, { success: false, error: null });

  useEffect(() => {
    if (state?.success) {
      // Form will revalidate automatically
    }
  }, [state?.success]);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        style={{
          padding: '6px 16px',
          backgroundColor: '#e53e3e',
          color: '#ffffff',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Remove Admin
      </button>
      {state?.error && (
        <div style={{ fontSize: 11, color: '#e53e3e', marginTop: 4 }}>{state.error}</div>
      )}
    </form>
  );
}
