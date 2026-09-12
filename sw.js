/* Guarda el tablero en el dispositivo para que abra sin internet.
   Al publicar una semana nueva, cambia CACHE por la versión siguiente
   y el navegador descarta la copia vieja solo. */
const CACHE = 'tgo-vencida-v11';
const ARCHIVOS = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];

self.addEventListener('install', ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS).catch(() => {})));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Primero la red, para traer la semana nueva en cuanto haya señal.
   Si no hay conexión, se sirve la copia guardada. */
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    fetch(ev.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(ev.request, copia).catch(() => {}));
        }
        return res;
      })
      .catch(() => caches.match(ev.request).then(r => r || caches.match('./index.html')))
  );
});
