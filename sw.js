// ====================================================================
//  HEYCAT Service Worker
//  Strategy:
//    - App shell (HTML, fonts, CDN scripts) -> Cache-First
//    - Supabase API / Storage                -> Network-First (never cached)
//    - Google Fonts CSS                       -> Stale-While-Revalidate
// ====================================================================

const CACHE_NAME    = 'heycat-v15';
const RUNTIME_CACHE = 'heycat-runtime-v2';

// Notification icon, embedded so this file has no separate image dependency
const ICON_DATA_URL = 'data:image/png;base64,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';

// CDN resources fetched at runtime -> cached on first use
const CDN_ORIGINS = [
  'https://cdn.jsdelivr.net',    // supabase-js
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// These origins must NEVER be cached -> always go to network
const NEVER_CACHE_ORIGINS = [
  'https://dwemfkxegzuwvlmzzfnd.supabase.co', // Supabase REST / realtime / storage
];

// -- INSTALL: activate immediately, no hardcoded app-shell file list --
// (deliberately does NOT pre-cache a specific HTML filename here — this
// service worker is shared across files that may be deployed under
// different names/paths, and a 404 during addAll() would abort install)
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

// -- ACTIVATE: delete stale caches --
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())  // take control of all open tabs
  );
});

// -- FETCH: routing logic --
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Non-GET requests (POST/PUT/DELETE) -> always network, never cache
  if (request.method !== 'GET') return;

  // 2. Supabase API / Storage -> always network (live data, auth tokens)
  if (NEVER_CACHE_ORIGINS.some(o => request.url.startsWith(o))) return;

  // 3. Same-origin navigations/pages -> Network-First so a redeploy shows up
  //    immediately when online; the cached copy is only a fallback for offline.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // 4. CDN resources (supabase-js, Google Fonts) -> Stale-While-Revalidate
  if (CDN_ORIGINS.some(o => request.url.startsWith(o))) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // 5. Everything else (same-origin assets) -> Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
  // (anything else falls through to the browser's default behaviour)
});

// ====================================================================
//  Strategy helpers
// ====================================================================

/** Network-First: fetch fresh copy when online (so redeploys show up right away);
 *  fall back to the last cached copy only when the network is unavailable. */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('Offline - please reconnect', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/** Cache-First: return cached copy instantly; update in background if online */
async function cacheFirst(request, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline - please reconnect', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/** Stale-While-Revalidate: serve cache immediately, refresh in background */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || await networkFetch;
}

// ====================================================================
//  PUSH NOTIFICATIONS
// ====================================================================

/** Fired when the push server delivers a message to this device */
self.addEventListener('push', event => {
  let data = { title: 'HEY CAT', body: 'You have a new notification' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch { /* malformed payload -> use defaults */ }

  const options = {
    body:    data.body,
    icon:    data.icon_url  || ICON_DATA_URL,
    badge:   ICON_DATA_URL,
    tag:     data.tag       || 'heycat-notif',
    data:    { url: data.url || '/' },
    vibrate: [200, 100, 200],
  };
  // "image" shows a large picture inside the notification (a "big picture"
  // style push, like Costa/Starbucks promo notifications) — only added
  // when the admin actually attached one, since not every push has a photo.
  if (data.image_url) options.image = data.image_url;

  event.waitUntil(self.registration.showNotification(data.title, options));
});

/** Tapping the notification opens / focuses the app */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
