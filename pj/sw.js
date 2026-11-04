/* ZelConta PJ v0.3: cache próprio e limitado à pasta pj/, sem alterar o PF. */
const CACHE = 'zelconta-pj-v0-3';
const PRECACHE = ['./', './index.html', './style.css', './app.js', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async path => {
      try { const response = await fetch(new Request(path,{cache:'reload'})); if (response.ok) await cache.put(path, response); }
      catch (error) { console.warn('Recurso não armazenado:', path); }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('zelconta-pj-v') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type !== 'opaque') await cache.put(event.request,response.clone());
      return response;
    } catch (err) {
      const cached = await cache.match(event.request,{ignoreSearch:true});
      if (cached) return cached;
      if (event.request.mode === 'navigate') return await cache.match('./index.html') || Response.error();
      return Response.error();
    }
  })());
});
