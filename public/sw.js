/* global importScripts*/

 // polyfill via https://github.com/coonsta/cache-polyfill
 // my new comment
importScripts('/js/offline/cache/index.js');
importScripts('/js/offline/urls.js');

var CACHE_NAME = 'jsbin-v3.3';

function log() {
  var args = [].slice.call(arguments);
  if (args[0].request.url === 'https://rem.jsbin-dev.com/') {
    var event = args.shift();
    args.unshift(event.request.url);
    console.log.apply(console, args);
  }
}

console.log('loaded %s', CACHE_NAME);

this.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function (cachesNames) {
      return Promise.all(cachesNames.filter(function (cache) {
        return cache !== CACHE_NAME;
      }).map(function (cache) {
        return caches.delete(cache);
      }));
    })
  );
});

this.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urls);
    })
  );
});

this.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  if (url.origin === location.origin) {
    if (url.pathname === '/' || url.pathname.split('/').pop() === 'edit') {
      return event.respondWith(caches.match('/'));
    }

    if (url.pathname === '/logout') {
      return;
    }
  }



  event.respondWith(
    caches.match(event.request).then(function (res) {
      // if res, then we have a catched copy
      return res || fetch(event.request).then(function (res) {
        // console.log('not caching', event.request.url);
        return res;
      });
    })
  );
});


















