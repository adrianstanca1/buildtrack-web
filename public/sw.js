// BuildTrack Service Worker
// Provides background sync, push notifications, and runtime caching.

/* eslint-env serviceworker */
const CACHE_NAME = 'buildtrack-cache-v1';
const OFFLINE_PAGE = '/offline.html';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/globals.css',
  '/manifest.json',
];

// Install: pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: stale-while-revalidate for GETs
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
      return cached || fetchPromise;
    })
  );
});

// Background Sync: replay queued mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'buildtrack-sync') {
    event.waitUntil(replaySyncQueue());
  }
});

// Push: display notification
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  event.waitUntil(
    self.registration.showNotification(payload.title || 'BuildTrack', {
      body: payload.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: payload.tag || 'default',
      data: payload.data || {},
      requireInteraction: payload.requireInteraction ?? false,
    })
  );
});

// Notification click: focus or open client
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    })
  );
});

async function replaySyncQueue() {
  // The main app replays IndexedDB queue via a message to the SW or direct on reconnect.
  // This stub ensures the sync event is handled so the browser knows it completed.
  const allClients = await self.clients.matchAll({ type: 'window' });
  for (const client of allClients) {
    client.postMessage({ type: 'SYNC_REPLAY' });
  }
}
