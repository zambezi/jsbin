var jsbin = {
  'static': 'https://rem.jsbin-dev.com',
  runner: '/runner',
  root: 'https://rem.jsbin-dev.com',
  version: '4.0.0',
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(function(sw) {
    // registration worked!
  }).catch(function(e) {
    // registration failed :(
    console.log('failed to register');
    console.log(e);
  });
} else {
  console.log('no service worker');
}