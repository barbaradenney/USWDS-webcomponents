/**
 * USWDS Web Components - Service Worker
 *
 * Optimized caching strategy for USWDS components and assets.
 * Auto-generated on: 2025-10-22
 * Version: 1.1.0
 */

// Cache versioning - automatically invalidates old caches
const CACHE_VERSION = '1.1.0';
const CACHE_PREFIX = 'uswds-wc';

// Cache names for different asset types
const CACHES = {
  // Static assets (components, CSS, JS) - long-term cache
  static: `${CACHE_PREFIX}-static-v${CACHE_VERSION}`,

  // USWDS core files - long-term cache
  uswds: `${CACHE_PREFIX}-uswds-v${CACHE_VERSION}`,

  // Images and fonts - very long-term cache
  assets: `${CACHE_PREFIX}-assets-v${CACHE_VERSION}`,

  // Runtime cache for dynamic content
  runtime: `${CACHE_PREFIX}-runtime-v${CACHE_VERSION}`,
};

// Assets to precache on install
const PRECACHE_URLS = [
  // Core USWDS files
  '/node_modules/@uswds/uswds/dist/js/uswds.min.js',
  '/node_modules/@uswds/uswds/dist/css/uswds.min.css',

  // Component library
  '/dist/index.js',
  '/src/styles/styles.css',
];

// Asset type patterns for routing
const ASSET_PATTERNS = {
  // Static components and modules
  static: /\.(js|ts|css|scss)$/,

  // Images and fonts
  assets: /\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/,

  // USWDS specific files
  uswds: /@uswds\/uswds/,

  // Component-specific CSS
  componentCSS: /\/css\/.+\.css$/,
};

/**
 * Service Worker Installation
 * Precache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing version:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHES.static)
      .then((cache) => {
        console.log('[ServiceWorker] Precaching static assets');
        return cache.addAll(PRECACHE_URLS.map(url => new Request(url, {
          cache: 'reload' // Bypass HTTP cache
        })));
      })
      .then(() => {
        console.log('[ServiceWorker] Precaching complete');
        // Activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Precaching failed:', error);
      })
  );
});

/**
 * Service Worker Activation
 * Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating version:', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Delete old caches
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Keep caches from current version
              if (Object.values(CACHES).includes(cacheName)) {
                return false;
              }

              // Delete caches from old versions
              if (cacheName.startsWith(CACHE_PREFIX)) {
                console.log('[ServiceWorker] Deleting old cache:', cacheName);
                return true;
              }

              return false;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Old caches deleted');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

/**
 * Determine which cache to use for a request
 */
function getCacheForRequest(url) {
  // USWDS files
  if (ASSET_PATTERNS.uswds.test(url)) {
    return CACHES.uswds;
  }

  // Images and fonts
  if (ASSET_PATTERNS.assets.test(url)) {
    return CACHES.assets;
  }

  // Component CSS
  if (ASSET_PATTERNS.componentCSS.test(url)) {
    return CACHES.static;
  }

  // Static JS/CSS
  if (ASSET_PATTERNS.static.test(url)) {
    return CACHES.static;
  }

  // Everything else goes to runtime cache
  return CACHES.runtime;
}

/**
 * Cache-first strategy
 * Use cached version if available, fetch if not
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[ServiceWorker] Cache hit:', request.url);
    return cached;
  }

  console.log('[ServiceWorker] Cache miss, fetching:', request.url);

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', request.url, error);
    throw error;
  }
}

/**
 * Network-first strategy
 * Try network first, fall back to cache
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    console.log('[ServiceWorker] Network first:', request.url);
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);

    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached version immediately if available
  if (cached) {
    console.log('[ServiceWorker] Serving cached (updating in background):', request.url);
    return cached;
  }

  // If no cache, wait for fetch
  console.log('[ServiceWorker] No cache, waiting for network:', request.url);
  return fetchPromise;
}

/**
 * Service Worker Fetch Handler
 * Route requests to appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests from same origin or specific CDNs
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Determine cache and strategy
  const cacheName = getCacheForRequest(url.pathname);

  // HTML files: Network-first (always get latest)
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirst(request, CACHES.runtime));
    return;
  }

  // USWDS core files: Cache-first (rarely change)
  if (ASSET_PATTERNS.uswds.test(url.pathname)) {
    event.respondWith(cacheFirst(request, cacheName));
    return;
  }

  // Images and fonts: Cache-first (immutable)
  if (ASSET_PATTERNS.assets.test(url.pathname)) {
    event.respondWith(cacheFirst(request, cacheName));
    return;
  }

  // Component JS/CSS: Stale-while-revalidate (balance freshness and speed)
  if (ASSET_PATTERNS.static.test(url.pathname) || ASSET_PATTERNS.componentCSS.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, cacheName));
    return;
  }

  // Everything else: Network-first with cache fallback
  event.respondWith(networkFirst(request, CACHES.runtime));
});

/**
 * Message Handler
 * Allow pages to communicate with service worker
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith(CACHE_PREFIX)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

console.log('[ServiceWorker] Loaded version:', CACHE_VERSION);
