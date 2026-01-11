'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for version updates (only once per session)
      const checkVersion = async () => {
        try {
          const storedVersion = sessionStorage.getItem('app-version');
          const response = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
          const data = await response.json();
          const newVersion = data.version + '-' + data.buildTime;
          
          // Only reload if version actually changed and we've seen a version before
          if (storedVersion && storedVersion !== newVersion) {
            // Version changed - clear all caches and reload
            console.log('New version detected, clearing cache and reloading...');
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            // Unregister old service worker
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
            // Store new version before reload
            sessionStorage.setItem('app-version', newVersion);
            // Reload page to get fresh content
            window.location.reload();
            return;
          }
          
          // Store current version
          if (!storedVersion) {
            sessionStorage.setItem('app-version', newVersion);
          }
        } catch (error) {
          console.log('Version check failed:', error);
        }
      };

      // Register service worker first
      navigator.serviceWorker
        .register('/sw.js?t=' + Date.now())
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Check for updates (but don't force reload immediately)
          registration.update();

          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available - check version before reloading
                  checkVersion().then(() => {
                    // Only reload if version check didn't already trigger reload
                    if (sessionStorage.getItem('app-version')) {
                      console.log('New service worker available, reloading...');
                      window.location.reload();
                    }
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });

      // Check version after a short delay to avoid immediate reload
      setTimeout(() => {
        checkVersion();
      }, 1000);
    }
  }, []);

  return null;
}



