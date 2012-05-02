/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['domReady!','./compat','./sync'], function(document, Compat, Sync) {
    var Gallery = function() {
        this.domElement = document.createElement('div');
        this.domElement.classList.add('gallery');
        // start populating with thumbnails
        Sync.list(this._populate.bind(this));
    };
    Gallery.prototype = {};
    Gallery.prototype._populate = function(uuids) {
        var addUUID = function(uuid) {
            var a = document.createElement('a');
            a.href='#'; // for iOS
            a.textContent = uuid; // XXX should be a thumbnail
            a.addEventListener('click', function(event) {
                event.preventDefault();
                this._callback(uuid);
            }.bind(this));
            this.domElement.appendChild(a);
        }.bind(this);
        uuids.forEach(addUUID);
        // make "new document" element
        addUUID('new');
    };
    Gallery.prototype.wait = function(callback) {
        // register callback
        this._callback = callback;
    };
    return Gallery;
});
