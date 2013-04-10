# Creating new routes

This code lives inside of `lib/routes.js`.  There are a number of param helpers that will preload the `req` object with the user or more importantly, the bin requested (i.e. if you use `:bin` in your path).

## Posting

JS Bin uses a CSRF middleware in place that prevents arbitrary posting to JS Bin. In the JS Bin client code, jQuery has a `beforeSend` filter applied, but if you're doing XHR manually, you need to set this header using:

    xhr.setRequestHeader('X-CSRF-Token', jsbin.state.token);

