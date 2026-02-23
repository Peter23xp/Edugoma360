/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// â”€â”€ API calls: Network First (fall back to cache when offline) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'api-responses',
        networkTimeoutSeconds: 10,
        plugins: [
            {
                cacheWillUpdate: async ({ response }) => {
                    // Only cache successful GET responses
                    if (response && response.ok && response.headers.get('content-type')?.includes('json')) {
                        return response;
                    }
                    return null;
                },
            },
        ],
    }),
    'GET',
);

// â”€â”€ Static assets: Cache First â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
registerRoute(
    ({ request }) =>
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font',
    new CacheFirst({
        cacheName: 'static-assets',
    }),
);

// â”€â”€ Images: Stale While Revalidate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
registerRoute(
    ({ request }) => request.destination === 'image',
    new StaleWhileRevalidate({
        cacheName: 'images',
    }),
);

// â”€â”€ Handle offline page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    self.clients.claim();
});
