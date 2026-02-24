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
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Save scroll position before refresh
    const saveScrollPositions = () => {
      // Save sidebar scroll position
      const sidebar = document.querySelector('[data-sidebar-scroll]') as HTMLElement;
      if (sidebar) {
        sessionStorage.setItem('sidebar-scroll', sidebar.scrollTop.toString());
      }
    };

    // Restore scroll position after refresh
    const restoreScrollPositions = () => {
      const sidebar = document.querySelector('[data-sidebar-scroll]') as HTMLElement;
      if (sidebar) {
        const savedScroll = sessionStorage.getItem('sidebar-scroll');
        if (savedScroll) {
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            sidebar.scrollTop = parseInt(savedScroll, 10);
            // Also try again after a short delay in case content is still loading
            setTimeout(() => {
              sidebar.scrollTop = parseInt(savedScroll, 10);
            }, 100);
            sessionStorage.removeItem('sidebar-scroll');
          });
        }
      }
    };

    // Restore scroll position on mount - try multiple times to catch when content loads
    restoreScrollPositions();
    const restoreTimeout = setTimeout(restoreScrollPositions, 200);
    const restoreTimeout2 = setTimeout(restoreScrollPositions, 500);

    // Track user activity
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      isIdleRef.current = false;
    };

    // Track scrolling state - listen specifically to sidebar scroll
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      // Only track scroll if it's the sidebar or a child of sidebar
      const sidebar = document.querySelector('[data-sidebar-scroll]') as HTMLElement;
      if (sidebar && (target === sidebar || sidebar.contains(target))) {
        isScrollingRef.current = true;
        updateActivity();
        
        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // Mark as not scrolling after 1 second of no scroll activity
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 1000);
      }
    };

    // Track idle state (no activity for 2 minutes)
    const checkIdle = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      isIdleRef.current = timeSinceLastActivity > 2 * 60 * 1000; // 2 minutes
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Add scroll listener specifically to sidebar
    const sidebar = document.querySelector('[data-sidebar-scroll]') as HTMLElement;
    if (sidebar) {
      sidebar.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Also listen to document scroll as fallback
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    // Check idle state every 30 seconds
    const idleCheckInterval = setInterval(checkIdle, 30000);

    // Set up auto-refresh interval
    const refreshInterval = intervalMinutes * 60 * 1000; // Convert to milliseconds
    
    intervalRef.current = setInterval(() => {
      // Only refresh if:
      // 1. User is not idle (has been active in last 2 minutes)
      // 2. User is not currently scrolling
      if (!isIdleRef.current && !isScrollingRef.current) {
        saveScrollPositions();
        router.refresh();
      }
    }, refreshInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      clearTimeout(restoreTimeout);
      clearTimeout(restoreTimeout2);
      clearInterval(idleCheckInterval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      const sidebar = document.querySelector('[data-sidebar-scroll]') as HTMLElement;
      if (sidebar) {
        sidebar.removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [router, intervalMinutes, enabled]);

  return null; // This component doesn't render anything
}
