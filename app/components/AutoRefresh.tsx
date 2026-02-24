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
  const lastScrollTimeRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    // Save scroll position before refresh
    const saveScrollPositions = () => {
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
          const scrollValue = parseInt(savedScroll, 10);
          // Try multiple times to ensure content is loaded
          requestAnimationFrame(() => {
            sidebar.scrollTop = scrollValue;
          });
          setTimeout(() => {
            sidebar.scrollTop = scrollValue;
          }, 100);
          setTimeout(() => {
            sidebar.scrollTop = scrollValue;
          }, 300);
          setTimeout(() => {
            sidebar.scrollTop = scrollValue;
            sessionStorage.removeItem('sidebar-scroll');
          }, 500);
        }
      }
    };

    // Restore scroll position on mount
    restoreScrollPositions();

    // Track user activity
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      isIdleRef.current = false;
    };

    // Track scrolling state - listen specifically to sidebar scroll
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const sidebar = document.querySelector('[data-sidebar-scroll]') as HTMLElement;
      if (sidebar && (target === sidebar || sidebar.contains(target))) {
        isScrollingRef.current = true;
        lastScrollTimeRef.current = Date.now();
        updateActivity();
        
        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // Mark as not scrolling after 1.5 seconds of no scroll activity
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 1500);
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
      // Don't refresh if:
      // 1. Already refreshing
      // 2. User is currently scrolling
      // 3. User scrolled within the last 10 seconds
      // 4. User is idle
      const timeSinceLastScroll = Date.now() - lastScrollTimeRef.current;
      
      if (isRefreshingRef.current) {
        return; // Already refreshing, skip
      }
      
      if (isScrollingRef.current) {
        return; // Currently scrolling, skip
      }
      
      if (timeSinceLastScroll < 10000) {
        return; // Scrolled recently, skip (10 second cooldown)
      }
      
      if (isIdleRef.current) {
        return; // User is idle, skip
      }
      
      // All checks passed - refresh once
      isRefreshingRef.current = true;
      saveScrollPositions();
      router.refresh();
      
      // Reset refreshing flag after refresh completes (give it time)
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 2000);
    }, refreshInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
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
