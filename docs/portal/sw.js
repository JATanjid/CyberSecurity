/* CHCS Portal service worker: caches the app shell so it opens instantly and offline.
   API calls (/wp-json/) are never cached. */
var CACHE = 'chcs-portal-v1';
var SHELL = ['./', 'css/portal.css', 'js/core.js', 'js/app.js', 'assets/logo.png', 'assets/icon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.pathname.indexOf('/wp-json/') !== -1 || url.origin !== self.location.origin) return;
  if (url.pathname.indexOf('/forms/') !== -1) return; // forms talk to their own servers; always fetch fresh
  // network first, fall back to cache (so updates show up right away when online)
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match('./'); }); }));
});
