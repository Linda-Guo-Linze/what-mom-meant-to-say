const CACHE_NAME = "mom-meant-shell-v3";
const APP_SHELL = ["/", "/manifest.webmanifest", "/favicon.svg", "/pwa-icon-192.png", "/pwa-icon-512.png", "/pwa-icon-maskable-512.png", "/audio/demo/case-missing-wallet.mp3", "/audio/demo/case-bathing-refusal.mp3", "/audio/demo/case-going-home.mp3", "/audio/demo/case-medication-refusal.mp3"];
self.addEventListener("install", (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))); self.clients.claim(); });
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).pathname.startsWith("/api/")) return;
  event.respondWith(fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))));
});
