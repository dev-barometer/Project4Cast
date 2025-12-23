'use client';

import { useEffect, useState } from 'react';

export default function EnvironmentBanner() {
  const [env, setEnv] = useState<'production' | 'staging' | 'local'>('production');

  useEffect(() => {
    // Client-side: check URL
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      setEnv('local');
    } else if (hostname.includes('staging')) {
      setEnv('staging');
    } else {
      setEnv('production');
    }
  }, []);

  // Don't show banner in production
  if (env === 'production') {
    return null;
  }

  const bannerConfig = {
    staging: {
      bgColor: '#FEF3C7', // Yellow
      textColor: '#92400E', // Dark yellow/brown
      borderColor: '#FCD34D',
      icon: '⚠️',
      text: 'STAGING ENVIRONMENT - Testing Only',
    },
    local: {
      bgColor: '#DBEAFE', // Blue
      textColor: '#1E40AF', // Dark blue
      borderColor: '#93C5FD',
      icon: '🔧',
      text: 'LOCAL DEVELOPMENT',
    },
  };

  const config = bannerConfig[env as keyof typeof bannerConfig];
  if (!config) return null;

  return (
    <div
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderBottom: `2px solid ${config.borderColor}`,
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 600,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {config.icon} {config.text}
    </div>
  );
}

