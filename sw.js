/* Netz zuerst, damit jeder Start die neueste Version lädt. Ohne Netz kommt die App aus dem Cache. */
const CACHE = 'punktlandung-v1';
const FILES = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const key = e.request.mode === 'navigate' ? './' : e.request;
    try {
      const res = await Promise.race([
        fetch(e.request, { cache: 'no-cache' }),
        new Promise((_, no) => setTimeout(() => no(new Error('Zeitüberschreitung')), 5000)),
      ]);
      if (res.ok) (await caches.open(CACHE)).put(key, res.clone());
      return res;
    } catch (err) {
      const hit = await caches.match(key, { ignoreSearch: true });
      if (hit) return hit;
      throw err;
    }
  })());
});
