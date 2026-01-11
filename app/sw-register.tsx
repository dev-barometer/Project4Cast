'use client';

import { useEffect } from 'react';

let currentVersion: string | null = null;

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for version updates
      const checkVersion = async () => {
        try {
          const response = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
          const data = await response.json();
          const newVersion = data.version + '-' + data.buildTime;
          
          if (currentVersion && currentVersion !== newVersion) {
            // Version changed - clear all caches and reload
            console.log('New version detected, clearing cache and reloading...');
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            // Unregister old service worker
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
            // Reload page to get fresh content
            window.location.reload();
            return;
          }
          
          currentVersion = newVersion;
        } catch (error) {
          console.log('Version check failed:', error);
        }
      };

      // Check version on load
      checkVersion();

      // Register service worker
      navigator.serviceWorker
        .register('/sw.js?t=' + Date.now())
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Check for updates every time the page loads
          registration.update();

          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available - reload to activate it
                  console.log('New service worker available, reloading...');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });

      // Listen for controller changes (when new service worker takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed, reloading...');
        window.location.reload();
      });
    }
  }, []);

  return null;
}



