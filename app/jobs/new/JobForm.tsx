'use client';

// Client Component for the job creation form
// Uses useFormState to handle form submission and display errors

import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createJob } from './actions';
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
  const [state, formAction] = useFormState(createJob, { error: null, success: false, jobId: null });
  const router = useRouter();

  // Handle redirect on success
  useEffect(() => {
    if (state?.success && state?.jobId) {
      router.push(`/jobs/${state.jobId}`);
    }
  }, [state, router]);

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
              placeholder="e.g., JOB-002"
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
              Must be unique. Used to identify the job.
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

          {/* Client and Brand */}
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
              <option value="">Select a brand...</option>
              {clients.map((client) =>
                client.brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {client.name} → {brand.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8,
              }}
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="PLANNING"
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
              <option value="PLANNING">PLANNING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Brief */}
          <div>
            <label
              htmlFor="brief"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8,
              }}
            >
              Brief
            </label>
            <textarea
              id="brief"
              name="brief"
              rows={6}
              placeholder="Add a brief description of the job..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e0',
                fontSize: 14,
                backgroundColor: '#ffffff',
                color: '#2d3748',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
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
              href="/jobs"
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
    </>
  );
}

