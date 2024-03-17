importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE_NAME = "pwabuilder-page";
const OFFLINE_URL = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL))
      .catch((error) => {
        console.error("Failed to cache offline page:", error);
      })
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResp = await event.preloadResponse;

          if (preloadResp) {
            return preloadResp;
          }

          const networkResp = await fetch(event.request);
          return networkResp;
        } catch (error) {
          console.error("Fetch error:", error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResp = await cache.match(OFFLINE_URL);
          return cachedResp;
        }
      })()
    );
  }
});

self.addEventListener('push', function(event) {
  console.log('Push Notification received', event);

  const title = 'Push Notification';
  const options = {
    body: 'This is a push notification.',
    icon: 'icon.png',
    badge: 'badge.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
