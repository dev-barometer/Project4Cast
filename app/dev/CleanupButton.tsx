'use client';

import { useState } from 'react';

export default function CleanupButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string; deleted?: any } | null>(null);

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to delete ALL jobs, tasks, and files? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/dev/cleanup', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Reload the page after a short delay to show the results
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Failed to cleanup database',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleCleanup}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#cbd5e0' : '#e53e3e',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Cleaning...' : 'Clear All Jobs & Files'}
      </button>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 6,
            backgroundColor: result.success ? '#c6f6d5' : '#fed7d7',
            color: result.success ? '#22543d' : '#742a2a',
            fontSize: 14,
          }}
        >
          {result.success ? (
            <div>
              <strong>✅ Success!</strong> Deleted:
              <ul style={{ marginTop: 8, marginLeft: 20 }}>
                {result.deleted && Object.entries(result.deleted).map(([key, value]: [string, any]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: 8, marginBottom: 0 }}>Page will reload in 2 seconds...</p>
            </div>
          ) : (
            <div>
              <strong>❌ Error:</strong> {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

