function load(state, template) {
  if (!Promise) {
    Promise = RSVP.Promise;
  }
  var token = jsbin.state.token;
  var old = jsbin.saveDisabled;
  jsbin.saveDisabled = true; // whilst we populate
  $.extend(jsbin.state, state);
  saveChecksum = null;
  var promises = [];
  jsbin.panels.allEditors(function (panel) {
    panel.setCode(template[panel.id] || '');
    if (template[panel.id]) {
      panel.show();
    }

    promises.push(new Promise(function (resolve) {
      // configure the state.processors
      jsbin.processors.set(panel.id, state.processors[panel.id] || panel.id, resolve);
    }));
  });

  jsbin.panels.panels.live.show();

  Promise.all(promises).then(function () {
    $document.trigger('refreshCode');
    renderLivePreview();
    jsbin.saveDisabled = old;
    jsbin.state.token = token;
  });
}
