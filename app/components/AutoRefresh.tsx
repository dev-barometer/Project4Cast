'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type AutoRefreshProps = {
  enabled?: boolean; // Default: true
};

export default function AutoRefresh({ 
  enabled = true 
}: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    // Check if we've already done the initial refresh in this session
    const hasRefreshedKey = 'auto-refresh-done';
    const hasRefreshed = sessionStorage.getItem(hasRefreshedKey);

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

    // Restore scroll position on mount (after refresh)
    restoreScrollPositions();

    // Refresh on initial page load only (if not already refreshed in this session)
    if (!hasRefreshed) {
      sessionStorage.setItem(hasRefreshedKey, 'true');
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        router.refresh();
      }, 500);
    }
  }, [router, enabled]);

  return null; // This component doesn't render anything
}

// Export function to save scroll position before refresh (for manual refresh button)
export function saveScrollPosition() {
  const sidebar = document.querySelector('[data-sidebar-scroll]') as HTMLElement;
  if (sidebar) {
    sessionStorage.setItem('sidebar-scroll', sidebar.scrollTop.toString());
  }
}
