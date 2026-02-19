const CACHE_NAME = 'love-language-v1';
const STATIC = [
  '/love-language/',
  '/love-language/index.html',
  '/love-language/js/i18n.js',
  '/love-language/js/locales/ko.json',
  '/love-language/js/locales/en.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const c = res.clone();
        caches.open(CACHE_NAME).then(ca => ca.put(e.request, c));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
