/* Netz zuerst, damit jeder Start die neueste Version lädt. Ohne Netz kommt die App aus dem Cache.
   Die Startseite wird über eine eigene Adresse geholt: Einen Navigations-Request umzuschreiben
   behandeln Browser unterschiedlich, und ein Fehler dabei würde still die alte Kopie liefern. */
const CACHE = 'punktlandung-v2';
const FILES = ['./', 'icons.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const name of await caches.keys()) if (name !== CACHE) await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.searchParams.has('check')) return;
  e.respondWith((async () => {
    const nav = e.request.mode === 'navigate';
    const key = nav ? './' : url.pathname.endsWith('icons.js') ? 'icons.js' : e.request;
    try {
      const res = await Promise.race([
        nav ? fetch(`./?sw=${Date.now()}`, { cache: 'no-store' }) : fetch(e.request, { cache: 'no-cache' }),
        new Promise((_, no) => setTimeout(() => no(new Error('Zeitüberschreitung')), 8000)),
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
