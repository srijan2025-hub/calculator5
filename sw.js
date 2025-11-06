// Shopping Calculator offline service worker
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `shopcalc-${CACHE_VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k.startsWith('shopcalc-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method!=='GET')return;
  const isHTML = req.headers.get('accept')?.includes('text/html');
  if(isHTML){
    e.respondWith(
      fetch(req).then(r=>{const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(req,c));return r;})
      .catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
  }else{
    e.respondWith(
      caches.match(req).then(cached=>cached||fetch(req).then(r=>{const c=r.clone();caches.open(CACHE_NAME).then(x=>x.put(req,c));return r;}).catch(()=>cached))
    );
  }
});
