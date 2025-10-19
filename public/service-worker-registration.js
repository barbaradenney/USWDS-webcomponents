/**
 * Service Worker Registration Helper
 *
 * Use this to register the service worker in your application.
 */

/**
 * Register the service worker
 * @param {string} swPath - Path to service worker file (default: '/service-worker.js')
 * @param {object} options - Registration options
 * @returns {Promise<ServiceWorkerRegistration>}
 */
export async function registerServiceWorker(swPath = '/service-worker.js', options = {}) {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported in this browser');
    return null;
  }

  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !options.enableInDev) {
    console.log('Service Worker disabled in development mode');
    return null;
  }

  try {
    console.log('Registering Service Worker...');

    const registration = await navigator.serviceWorker.register(swPath, {
      scope: options.scope || '/',
    });

    console.log('Service Worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('New Service Worker available');

            if (options.onUpdate) {
              options.onUpdate(registration);
            } else {
              // Default: prompt user to reload
              if (confirm('New version available! Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          }
        });
      }
    });

    // Auto-reload when service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (options.reloadOnUpdate !== false) {
        window.location.reload();
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();

    if (success) {
      console.log('Service Worker unregistered');
    }

    return success;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Clear all caches
 */
export async function clearServiceWorkerCaches() {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('All caches cleared');
    return true;
  } catch (error) {
    console.error('Cache clearing failed:', error);
    return false;
  }
}
