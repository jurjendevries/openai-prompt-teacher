// Set a name for the current cache
var cacheName = 'v1'; 

// Default files to always cache
var cacheFiles = [
  '/openai-prompt-teacher/',
  '/openai-prompt-teacher/index.html',
  '/openai-prompt-teacher/styles.css',
  '/openai-prompt-teacher/main.js',
  '/openai-prompt-teacher/manifest.json',
  '/openai-prompt-teacher/favicon.ico',
  '/openai-prompt-teacher/icon-192x192.png',
  '/openai-prompt-teacher/icon-512x512.png'
]

self.addEventListener('install', function(e) {
  console.log("[ServiceWorker] Installed");
  
  // e.waitUntil Delays the event until the Promise is resolved
  e.waitUntil(
    // Open the cache
    caches.open(cacheName).then(function(cache) {
      console.log("[ServiceWorker] Caching cacheFiles");
      // Add all the default files to the cache
      return cache.addAll(cacheFiles);
    })
  ); // end e.waitUntil
});


self.addEventListener('activate', function(e) {
  console.log("[ServiceWorker] Activated");
  
  e.waitUntil(
    // Get all the cache keys (cacheName)
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(thisCacheName) {
        // If a cached item is saved under a previous cacheName
        if (thisCacheName !== cacheName) {
          // Delete that cached file
          console.log("[ServiceWorker] Removing Cached Files from", thisCacheName);
          return caches.delete(thisCacheName);
        }
      }));
    }) // end e.waitUntil
  );
});


self.addEventListener('fetch', function(e) {
  console.log("[ServiceWorker] Fetching", e.request.url);
  
  // e.respondWith Responds to the fetch event
  e.respondWith(
    // Check in cache for the request being made
    caches.match(e.request)
      .then(function(response) {
        // If the request is in the cache
        if ( response ) {
          console.log("[ServiceWorker] Found in Cache", e.request.url, response);
          // Return the cached version
          return response;
        }

        // If the request is NOT in the cache, fetch and cache
        var requestClone = e.request.clone();
        return fetch(requestClone)
          .then(function(response) {
            if ( !response ) {
              console.log("[ServiceWorker] No response from fetch");
              return response;
            }

            var responseClone = response.clone();
            
            //  Open the cache
            caches.open(cacheName).then(function(cache) {
              // Put the fetched response in the cache
              cache.put(e.request, responseClone);
              console.log('[ServiceWorker] New Data Cached', e.request.url);
            }); // end caches.open

            return response;
          })
          .catch(function(err) {
            console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
          });
      }) // end caches.match(e.request)
  ); // end e.respondWith
});
