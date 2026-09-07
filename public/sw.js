// Minimal service worker whose only job is satisfying Chrome/Android's PWA
// installability requirement (manifest + an active SW with a fetch handler)
// so `beforeinstallprompt` fires - see components/vpn/install-app-button.tsx.
// No offline caching yet: every request just passes straight through.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
