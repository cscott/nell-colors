'use strict';
/** AppCacheUI: https://github.com/timdream/appcacheui (MIT License) */
(function () {

var AppCacheUI = {
  init: function () {
    var INFO_ID = 'appcache_info';

    var doc = document,
    body = doc.body,
    cache = window.applicationCache;

    if (!cache)
      return;

    if (!body) {
      console.log('Premature init. Put the <script> in <body>.');
      return;
    }

    this.info = doc.getElementById(INFO_ID);

    if (!this.info) {
      doc.cE = doc.createElement;
      var a = doc.cE('a');
      var info = doc.cE('div');
      info.id = INFO_ID;
      a.href = '';
      a.addEventListener('click', function (ev) {
        ev.stopPropagation();
        window.location.reload();
      }, true /* useCapture */);
      info.appendChild(a);

      if (body.firstChild)
        body.insertBefore(info, body.firstChild);

      this.info = info;
    }

    var events = [
      /* First event */
      'checking',
      /* Intermediate events */
      'downloading', 'progress',
      /* Last events */
      'noupdate', 'cached', 'updateready', 'obsolete', 'error'
    ];

    events.forEach(function (name) {
      cache.addEventListener(name, AppCacheUI);
    });
  },
  handleEvent: function (ev) {
    this.info.className =
      this.info.className.replace(/ ?appcache\-.+\b/g, '')
      + ' appcache-' + ev.type;

    this.count = this.count || 0;
    if (ev.type === 'progress') {
      this.count++;
      var progress;
      if (ev.total)
        progress = (ev.loaded + 1) + '/' + ev.total;
      else
        progress = this.count;
      this.info.setAttribute('data-progress', progress);
    }
  }
};

AppCacheUI.init();

})();
