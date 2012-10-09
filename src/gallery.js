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
    Gallery.prototype._populate = function(uuids) {
        var numThumbnails = 0;
        var addUUID = function(uuid) {
            var a = document.createElement('a');
            a.href='#'; // for iOS
            a.textContent = uuid; // XXX should be a thumbnail
            a.addEventListener('click', function(event) {
                event.preventDefault();
                this._callback(uuid);
            }.bind(this));
            this.domElement.appendChild(a);
            numThumbnails++;
        }.bind(this);
        uuids.forEach(addUUID);
        // record number of thumbnails via funf
        this.funf.record('gallery', { thumbnails: numThumbnails });
        // make "new document" element
        addUUID('new');
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
