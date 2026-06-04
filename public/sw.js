// Self-destructing service worker.
//
// An earlier version cached the app shell for offline use, but that caused the
// site to show a blank screen after redeploys: it kept serving a stale index.html
// that referenced old, now-missing hashed asset files. WildDex needs the network
// anyway (identification is an API call), so we no longer use a service worker.
//
// This version takes over from the old one, deletes all caches, unregisters
// itself, and reloads open tabs so the app always loads fresh from the network.

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) client.navigate(client.url)
    })(),
  )
})

// No fetch handler — every request goes straight to the network.
