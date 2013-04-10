function allowDrop(holder) {
  holder.ondragover = function () { 
    return false;
  };

  holder.ondragend = function () { 
    return false;
  };

  var jstypes = ['javascript', 'coffeescript', 'coffee', 'js'],
      csstypes = ['css', 'less', 'sass'],
      htmltypes = ['html', 'md', 'txt'],
      allowedtypes = jstypes.concat(csstypes.concat(htmltypes));

  holder.ondrop = function (e) {
    e.preventDefault();

    var file = e.dataTransfer.files[0],
        reader = new FileReader(),
        type = file.type ? file.type.toLowerCase().replace(/^text\//, '') : file.name.toLowerCase().replace(/.*\./g, '');

    console.log(type, allowedtypes.indexOf(type));

    if (type === 'application/zip') {
      var formData = new FormData();
      formData.append('zip', file);

      // now post a new XHR request
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/static');
      xhr.onload = function() {
        console.log('upload complete');
      };

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
          var complete = (event.loaded / event.total * 100 | 0);
          console.log(complete);
        }
      };

      xhr.setRequestHeader('X-CSRF-Token', jsbin.state.token);

      xhr.send(formData);
      return;
    } else if (allowedtypes.indexOf(type) === -1) {
      return;
    }

    reader.onload = function (event) {
      var panelId = 'html',
          panel = editors[panelId],
          syncCode = event.target.result,
          scroller = null;

      if (jstypes.indexOf(type) !== -1) {
        panelId = 'javascript';
      } else if (csstypes.indexOf(type) !== -1) {
        panelId = 'css';
      } else if (htmltypes.indexOf(type) !== -1) {
        panelId = 'html';
      }

      panel = editors[panelId];
      scroller = panel.editor.scroller;

      panel.setCode(event.target.result);
      panel.show();

      try {
        // now kick off - basically just doing a copy and paste job from @wookiehangover - thanks man! :)
        var worker = new Worker(jsbin.root + '/js/editors/sync-worker.js');

        // pass the worker the file object
        worker.postMessage(file);

        panel.$el.find('> .label').append('<small> (live: edit & save in your fav editor)</small>');

        // bind onmessage handler
        worker.onmessage = function (event) {
          var top = scroller.scrollTop;
          panel.setCode(event.data.body);
          scroller.scrollTop = top;
          syncCode = event.data.body;
        };

        /* FIXME for now, there's a bug in CodeMirror 2 whereby binding the
          onKeyEvent causes all cursor keys to be ate :( */
        // panel.editor.setOption('onKeyEvent', function (event) {
        //   if (syncCode !== panel.editor.getCode()) {
        //     worker.terminate();
        //     console.log('terminate');
        //     panel.$el.find('> .label small').remove();
        //     panel.editor.setOption('onKeyEvent', function () { return true });
        //   }
        //   return event;
        // });
      } catch (e) {
        // fail on the awesomeness...oh well
      }
    };

    reader.readAsText(file);

    return false;
  };
}

// test for dnd and file api first
if (!!(window.File && window.FileList && window.FileReader)) {
  allowDrop(document.body);
}
