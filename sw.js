addEventListener('fetch', fetchEvent => {
  console.log('fetching', fetchEvent.request);
  fetchEvent.respondWith((async () => {
    if (fetchEvent.request.mode === 'navigate' &&
      fetchEvent.request.method === 'GET' &&
      registration.waiting &&
      (await clients.matchAll()).length < 2
    ) {
      registration.waiting.postMessage('skipWaiting');
      return new Response("", {headers: {"Refresh": "0"}});
    }

    return await caches.match(fetchEvent.request) ||
      fetch(fetchEvent.request);
  })());
});

const LATEST_CACHE_ID = 'v2';

addEventListener('install', installEvent => {
  installEvent.waitUntil(
    caches.open(LATEST_CACHE_ID).then(cache => cache.addAll(['/']))
  );
});

addEventListener('activate', activateEvent => {
  activateEvent.waitUntil(
    caches.keys().then(keyList => Promise.all(keyList.map(key => {
      if (key !== LATEST_CACHE_ID) {
        return caches.delete(key);
      }
    })))
  );
});

addEventListener('message', messageEvent => {
  if (messageEvent.data === 'skipWaiting') return skipWaiting();
});