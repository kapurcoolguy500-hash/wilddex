// Minimal app-shell service worker. Caches static assets so the app launches
// instantly and survives a flaky connection. Identification always needs the
// network (it hits /identify), so those requests are never cached.

const CACHE = 'wilddex-shell-v1'
const SHELL = ['/', '/index.html', '/icon.svg', '/manifest.webmanifest']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  // Never cache API calls.
  if (request.method !== 'GET' || new URL(request.url).pathname.startsWith('/identify')) return
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => caches.match('/'))),
  )
})
