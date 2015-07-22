/* global importScripts*/

 // polyfill via https://github.com/coonsta/cache-polyfill
 // my new comment
importScripts('/js/offline/cache/index.js');
importScripts('/js/offline/urls.js');

var CACHE_NAME = 'jsbin-v3.17';

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

  // if we're requesting the main application template (i.e. '/' or and */edit
  // page), then we'll serve up the cached copy of the 'root' template
  if (url.origin === location.origin) {
    if (url.pathname === '/' || url.pathname.split('/').pop() === 'edit') {
      return event.respondWith(caches.match('/'));
    }

    if (url.pathname === '/logout') {
      return;
    }
  }


  // otherwise, try to response with the pre-cached copy (via urls.js)
  // and if that fails (see `res || fetch(...)`) then fetch the online
  // version
  event.respondWith(
    caches.match(event.request).then(function (res) {
      // we have a cached copy, so return that
      if (res) {
        return res;
      }



      // try to fetch it from the network
      return fetch(event.request).then(function (res) {
        // if the fetch was bad (i.e. non 200 OK), then let's handle
        // some specific exceptions, like 'start.js'
        // if (res.status !== 200) {
        if (res.status !== 200) console.log(url.pathname, res.status);
        if (/*res.status !== 200 && */url.pathname.indexOf('/start.js') !== -1) {
          console.log('not caching', event.request.url);
          return caches.match('/js/account/offline-user.js');
        }
        return res;
      }).catch(function (e) {
        console.log('failed to fetch %s', event.request.url);
        console.log(e);
        throw e;
      });
    })
  );
});


















