/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['domReady!','./compat','./sync'], function(document, Compat, Sync) {
    var Gallery = function(funf) {
        this.domElement = document.createElement('div');
        this.domElement.classList.add('gallery');
        this.funf = funf;
        // start populating with thumbnails
        Sync.list(this._populate.bind(this));
    };
    Gallery.prototype = {};
    Gallery.prototype._populate = function(uuids, thumbnails) {
        // record number of thumbnails via funf
        this.funf.record('gallery', { drawings: uuids.length });
        var addUUID = function(uuid, idx) {
            var a = document.createElement('a');
            a.href='#'; // for iOS
            a.className = uuid;
            a.textContent = uuid; // hidden by thumbnail (if present)
            a.addEventListener('click', function(event) {
                event.preventDefault();
                this._callback(uuid);
            }.bind(this));
            this.domElement.appendChild(a);
            // decode thumbnail
            if (thumbnails[idx]) {
                thumbnails[idx](function(canvas) {
                    a.appendChild(canvas);
                    // log thumbnail to funf
                    // XXX maybe should only log when new? each thumbnail is 16k
                    var dataUrl = (canvas.toDataURLHD ? canvas.toDataURLHD() :
                                   canvas.toDataURL ? canvas.toDataURL() :
                                   null);
                    this.funf.record('thumb', { uuid: uuid, data: dataUrl });
                }.bind(this));
            }
        }.bind(this);
        uuids.forEach(addUUID);
        // make "new document" element
        addUUID('new', -1);
    };
    Gallery.prototype.wait = function(callback) {
        // register callback
        this._callback = callback;
    };
    Gallery.abort = function() {
        var galleries = document.querySelectorAll('div.gallery'), i;
        for (i=0; i<galleries.length; i++) {
            galleries[i].parentElement.removeChild(galleries[i]);
        }
    };
    return Gallery;
});
