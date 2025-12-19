'use client';

// Client Component for the job creation form
// Uses useFormState to handle form submission and display errors

import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createJob } from './actions';
import { createClient, createBrand } from './client-actions';
import Link from 'next/link';

type Client = {
  id: string;
  name: string;
  brands: Array<{
    id: string;
    name: string;
  }>;
};

type JobFormProps = {
  clients: Client[];
};

export default function JobForm({ clients }: JobFormProps) {
  const [state, formAction] = useFormState(createJob, { error: null, success: false, jobId: undefined });
  const router = useRouter();
  const [jobNumber, setJobNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showCreateBrand, setShowCreateBrand] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [clientsList, setClientsList] = useState(clients);

  // Format job number as user types: XXX-000
  const handleJobNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''); // Only allow letters, numbers, and hyphen
    
    // Remove extra hyphens
    const parts = value.split('-');
    if (parts.length > 2) {
      value = parts[0] + '-' + parts.slice(1).join('');
    }
    
    // Limit to format XXX-000
    if (value.includes('-')) {
      const [letters, numbers] = value.split('-');
      const formattedLetters = letters.slice(0, 3);
      const formattedNumbers = numbers ? numbers.slice(0, 3) : '';
      value = formattedLetters + (formattedNumbers ? '-' + formattedNumbers : '-');
    } else {
      // If no hyphen yet, limit to 3 letters
      value = value.slice(0, 3);
    }
    
    setJobNumber(value);
  };

  // Filter brands based on selected client
  const availableBrands = selectedClientId
    ? clientsList.find(c => c.id === selectedClientId)?.brands || []
    : [];

  // Handle creating new client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newClientName);
    const result = await createClient(formData);
    if (result.success && result.clientId) {
      // Refresh the page to get updated clients list
      router.refresh();
      setSelectedClientId(result.clientId);
      setShowCreateClient(false);
      setNewClientName('');
    } else {
      alert(result.error || 'Failed to create client');
    }
  };

  // Handle creating new brand
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert('Please select a client first');
      return;
    }
    const formData = new FormData();
    formData.append('name', newBrandName);
    formData.append('clientId', selectedClientId);
    const result = await createBrand(formData);
    if (result.success && result.brandId) {
      // Refresh the page to get updated brands list
      router.refresh();
      setSelectedBrandId(result.brandId);
      setShowCreateBrand(false);
      setNewBrandName('');
    } else {
      alert(result.error || 'Failed to create brand');
    }
  };

  // Handle redirect on success
  useEffect(() => {
    if (state?.success && state?.jobId) {
      router.push(`/jobs/${state.jobId}`);
    }
  }, [state, router]);

  // Update clients list when props change (after refresh)
  useEffect(() => {
    setClientsList(clients);
  }, [clients]);

  return (
    <>
      {/* Error message */}
      {state?.error && (
        <div
          style={{
            backgroundColor: '#fed7d7',
            color: '#742a2a',
            padding: '12px 16px',
            borderRadius: 6,
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          <strong>Error:</strong> {state.error}
        </div>
      )}

      {/* Form */}
      <form
        action={formAction}
        style={{
          backgroundColor: '#ffffff',
          padding: 32,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Job Number */}
          <div>
            <label
              htmlFor="jobNumber"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8,
              }}
            >
              Job Number <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              type="text"
              id="jobNumber"
              name="jobNumber"
              required
              value={jobNumber}
              onChange={handleJobNumberChange}
              pattern="^[A-Z]{3}-[0-9]{3}$"
              placeholder="e.g., JOB-002"
              maxLength={7}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                fontSize: 14,
                backgroundColor: '#ffffff',
                color: '#2d3748',
                fontFamily: 'monospace',
                letterSpacing: '0.5px',
              }}
            />
            <p style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
              Format: XXX-000 (3 uppercase letters, hyphen, 3 numbers). Must be unique.
            </p>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8,
              }}
            >
              Job Title <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g., Launch Materials"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                fontSize: 14,
                backgroundColor: '#ffffff',
                color: '#2d3748',
              }}
            />
          </div>

          {/* Client */}
          <div>
            <label
              htmlFor="clientId"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8,
              }}
            >
              Client <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <select
              id="clientId"
              value={selectedClientId}
              onChange={(e) => {
                if (e.target.value === '__create_new__') {
                  setShowCreateClient(true);
                  setSelectedClientId(''); // Keep it empty until new client is created
                } else {
                  setSelectedClientId(e.target.value);
                  setSelectedBrandId(''); // Reset brand when client changes
                }
              }}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                fontSize: 14,
                color: '#4a5568',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="">Select a client...</option>
              {clientsList.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
              <option value="__create_new__" style={{ fontStyle: 'italic', color: '#4299e1' }}>
                ➕ Create new client...
              </option>
            </select>
          </div>

          {/* Brand */}
          <div>
            <label
              htmlFor="brandId"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8,
              }}
            >
              Brand <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <select
              id="brandId"
              name="brandId"
              value={selectedBrandId}
              onChange={(e) => {
                if (e.target.value === '__create_new__') {
                  setShowCreateBrand(true);
                  setSelectedBrandId(''); // Keep it empty until new brand is created
                } else {
                  setSelectedBrandId(e.target.value);
                }
              }}
              required
              disabled={!selectedClientId}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                fontSize: 14,
                color: selectedClientId ? '#4a5568' : '#a0aec0',
                backgroundColor: selectedClientId ? '#ffffff' : '#f7fafc',
                cursor: selectedClientId ? 'pointer' : 'not-allowed',
              }}
            >
              <option value="">
                {selectedClientId ? 'Select a brand...' : 'Select a client first...'}
              </option>
              {availableBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
              {selectedClientId && (
                <option value="__create_new__" style={{ fontStyle: 'italic', color: '#4299e1' }}>
                  ➕ Create new brand...
                </option>
              )}
            </select>
          </div>


          {/* Submit Button */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                borderRadius: 6,
                border: 'none',
                background: '#4299e1',
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Create Job
            </button>
            <Link
              href="/"
              style={{
                padding: '12px 24px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                background: '#ffffff',
                color: '#4a5568',
                fontSize: 14,
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: 500,
              }}
            >
              Cancel
            </Link>
          </div>
        </div>
        </form>

        {/* Create Client Modal */}
        {showCreateClient && (
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
            onClick={() => setShowCreateClient(false)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: 24,
                borderRadius: 8,
                width: '90%',
                maxWidth: 400,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
                Create New Client
              </h3>
              <form onSubmit={handleCreateClient}>
                <div style={{ marginBottom: 16 }}>
                  <label
                    htmlFor="newClientName"
                    style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#2d3748',
                      marginBottom: 8,
                    }}
                  >
                    Client Name <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="newClientName"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required
                    placeholder="e.g., Acme Corp"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e0',
                      fontSize: 14,
                      backgroundColor: '#ffffff',
                      color: '#2d3748',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateClient(false);
                      setNewClientName('');
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e0',
                      backgroundColor: '#ffffff',
                      color: '#4a5568',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: '#4299e1',
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Create Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Brand Modal */}
        {showCreateBrand && (
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
            onClick={() => setShowCreateBrand(false)}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: 24,
                borderRadius: 8,
                width: '90%',
                maxWidth: 400,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#2d3748', marginBottom: 16 }}>
                Create New Brand
              </h3>
              <form onSubmit={handleCreateBrand}>
                <div style={{ marginBottom: 16 }}>
                  <label
                    htmlFor="newBrandName"
                    style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#2d3748',
                      marginBottom: 8,
                    }}
                  >
                    Brand Name <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="newBrandName"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    required
                    placeholder="e.g., Acme Kidney"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e0',
                      fontSize: 14,
                      backgroundColor: '#ffffff',
                      color: '#2d3748',
                    }}
                  />
                  <p style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                    Client: {clientsList.find(c => c.id === selectedClientId)?.name || 'Unknown'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateBrand(false);
                      setNewBrandName('');
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e0',
                      backgroundColor: '#ffffff',
                      color: '#4a5568',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: '#4299e1',
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Create Brand
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

