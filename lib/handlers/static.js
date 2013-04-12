"use strict";
var utils = require('../utils'),
    Observable = utils.Observable,
    fs = require('fs'),
    path = require('path'),
    unzip = require('unzip');

module.exports = Observable.extend({
  constructor: function StaticHandler(sandbox) {
    Observable.apply(this, arguments);

    this.models = sandbox.models;
    this.helpers = sandbox.helpers;

    this.uploadPath = this.helpers.set('server useruploads');

    // For now we bind all methods to the class scope. In reality only those
    // used as route callbacks need to be bound.
    var methods = Object.getOwnPropertyNames(StaticHandler.prototype).filter(function (prop) {
      return typeof this[prop] === 'function';
    }, this);

    utils.bindAll(this, methods);
  },
  upload: function (req, res, next) {
    if (!req.session.user) {
      return res.send(500, {error: 'Not authorised.'});
    }

    console.log(req.files);

    if (req.files.zip) {
      res.send(true);
      var userpath = path.join(this.uploadPath, req.session.user.name + '/');
      fs.mkdir(userpath, function (err) {
        // ignore the error
        try {
          var extract = unzip.Extract({ path: userpath });
          extract.on('error', function(err) {
            console.log('error thrown', err);
          });
          extract.on('close', function () {
            console.log('all done');
            fs.unlink(req.files.zip.path, function () {});
          });

          fs.createReadStream(req.files.zip.path).pipe(extract);
        } catch (e) {
          // this happens when extract fails to read and write a file properly.
          // sadly doesn't trigger errr inside the stream but borks here.
          console.log('failed to extract ' + req.files.zip.path);
          fs.unlink(req.files.zip.path, function () {});
        }
      });
    }
  }
});