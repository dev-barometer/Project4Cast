'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type AutoRefreshProps = {
  intervalMinutes?: number; // Default: 5 minutes
  enabled?: boolean; // Default: true
};

export default function AutoRefresh({ 
  intervalMinutes = 5, 
  enabled = true 
}: AutoRefreshProps) {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isIdleRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    // Track user activity
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      isIdleRef.current = false;
    };

    // Track idle state (no activity for 2 minutes)
    const checkIdle = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      isIdleRef.current = timeSinceLastActivity > 2 * 60 * 1000; // 2 minutes
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check idle state every 30 seconds
    const idleCheckInterval = setInterval(checkIdle, 30000);

    // Set up auto-refresh interval
    const refreshInterval = intervalMinutes * 60 * 1000; // Convert to milliseconds
    
    intervalRef.current = setInterval(() => {
      // Only refresh if user is not idle (has been active in last 2 minutes)
      if (!isIdleRef.current) {
        router.refresh();
      }
    }, refreshInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(idleCheckInterval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [router, intervalMinutes, enabled]);

  return null; // This component doesn't render anything
}
