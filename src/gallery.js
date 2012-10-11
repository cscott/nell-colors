/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['domReady!','./compat','../lib/hammer', './sync'], function(document, Compat, Hammer, Sync) {
    var firstGallery = true;

    var Gallery = function(funf) {
        this.domElement = document.createElement('div');
        this.domElement.classList.add('gallery');
        this.funf = funf;
        this.first = firstGallery;
        firstGallery = false;
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
            this.domElement.appendChild(a);
            var hammer = new Hammer(a, {
                prevent_default: true,
                transform: false,
                tap_double: false,
                apply_hover: true
            });
            hammer.ontap = function(event) {
                this._callback(uuid);
            }.bind(this);

            if (uuid === 'new') { return; }

            hammer.ondragstart = function(event) {
                // ensure this thumb stays on top
                a.style.zIndex = 99;
            };
            hammer.ondrag = function(event) {
                var t = Math.round(event.distanceX)+'px,'+
                    Math.round(event.distanceY)+'px';
                a.style.WebkitTransform = 'translate3d('+t+',0)';
                a.style.MozTransform = a.style.transform = 'translate('+t+')';
            };
            hammer.ondragend = function(event) {
                a.style.WebkitTransform =
                    a.style.MozTransform =
                    a.style.transform = null;
                a.style.zIndex = null;
            };
            hammer.onhold = function(event) {
                console.log('hold');
            };
            // decode thumbnail
            if (thumbnails[idx]) {
                thumbnails[idx](function(canvas) {
                    a.appendChild(canvas);
                    // log thumbnail to funf when we first start
                    if (this.first) {
                        // each thumbnail is 16k when a PNG; half that as a JPEG
                        // to save space we don't use toDataURLHD here
                        var dataUrl = (canvas.toDataURL ?
                                       canvas.toDataURL('image/jpeg') :
                                       null);
                        this.funf.record('thumb', { uuid: uuid,
                                                    data: dataUrl });
                    }
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
