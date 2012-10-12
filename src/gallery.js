/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['domReady!','./compat','./coords','../lib/hammer', './sync'], function(document, Compat, Coords, Hammer, Sync) {
    var firstGallery = true;

    var useNativeDnD = ('ondragstart' in document.createElement('a'));
    // might have to use browser sniffing (sigh) to identify browsers
    // on which we can't rely on the native DnD support, since
    // Firefox/Android (at least) implements ondragstart, it just
    // never invokes it.  But at the moment the touch support on
    // Firefox/Android works fine even if we register ondragstart.

    var Gallery = function(funf, toolbarPort) {
        this.domElement = document.createElement('div');
        this.domElement.classList.add('gallery');
        this.funf = funf;
        this.toolbarPort = toolbarPort;
        this.first = firstGallery;
        firstGallery = false;
        // start populating with thumbnails
        Sync.list(this._populate.bind(this));
    };
    Gallery.prototype = {};
    Gallery.prototype._populate = function(uuids, thumbnails) {
        // record number of thumbnails via funf
        this.funf.record('gallery', { drawings: uuids.length });
        var toolbarPort = this.toolbarPort;
        var addUUID = function(uuid, idx) {
            var a = document.createElement('a');
            a.href='./#' + uuid; // for iOS
            a.className = uuid;
            a.textContent = uuid; // hidden by thumbnail (if present)
            this.domElement.appendChild(a);
            a.addEventListener('click', function(event) {
                event.preventDefault();
                this._callback(uuid);
            }.bind(this), false);
            a.addEventListener('contextmenu', function(event) {
                event.preventDefault();
            }, false);

            // make bookmarkable URL for this document
            var url = document.URL.
                // strip document hash and 'ncolors.html'
                replace(/#[^#]*$/, '').replace(/[\/][^\/]*$/, '') +
                // add uuid for this document.
                '/#' + uuid;
            a.addEventListener('dragstart', function(event) {
                if (uuid==='new') { event.preventDefault(); return; }
                event.dataTransfer.items.add(uuid, 'text/x-nell-colors');
                event.dataTransfer.items.add(url, 'text/uri-list');
                event.dataTransfer.items.add(url, 'text/plain');
                a.classList.add('dragging');
            }, false);
            a.addEventListener('dragend', function(event) {
                a.classList.remove('dragging');
            }, false);

            if (uuid === 'new') { return; }

            a.draggable = true;

            var thumbUrl;
            var raiseDragShadow = function(isTouch) {
                var bbInner = Coords.getAbsolutePosition(a);
                toolbarPort.postMessage(JSON.stringify({
                    type: 'drag-shadow',
                    uuid: uuid,
                    show: true,
                    dragging: isTouch,
                    x: bbInner.x,
                    y: bbInner.y,
                    thumb: thumbUrl,
                    captureEvents: !isTouch
                }));
            };
            if (!useNativeDnD) {
                var that = this;
                a.addEventListener('mouseover', function(event) {
                    raiseDragShadow(false);
                }, false);
                a.addEventListener('mouseout', function(event) {
                    var related = event.relatedTarget, target = this;
                    // For mousenter/leave call the handler if related is
                    // outside the target.
                    // NB: No relatedTarget if the mouse left/entered the
                    // browser window
                    if (!related ||
                        (related !== target && !target.contains(related))) {
                        // emualate mouseleave event
                        toolbarPort.postMessage(JSON.stringify({
                            type: 'drag-shadow',
                            uuid: uuid,
                            show: false,
                        }));
                    }
                }, false);
            }
            var hammer = new Hammer(a, {
                only_touch: true,
                apply_hover: true,
                prevent_default: true,
                css_hacks: false,
                drag_min_distance: 5,
                transform: false,
                tap: false,
                tap_double: false,
                hold: false
            });
            hammer.ondragstart = function(event) {
                raiseDragShadow(true/*is touch*/);
            };
            hammer.ondrag = function(event) {
                toolbarPort.postMessage(JSON.stringify({
                    type: 'drag-shadow-move',
                    x: event.distanceX,
                    y: event.distanceY
                }));
            };
            hammer.ondragend = function(event) {
                toolbarPort.postMessage(JSON.stringify({
                    type: 'drag-shadow-drop'
                }));
            };

            // decode thumbnail
            if (thumbnails[idx]) {
                thumbnails[idx](function(canvas) {
                    a.appendChild(canvas);
                    window.setTimeout(function() {
                        // convert to jpeg in timeout so we don't delay the
                        // initial appearance of the gallery thumbs
                        thumbUrl = canvas.toDataURL('image/jpeg');
                        // log thumbnail to funf when we first start
                        // each thumbnail is 16k when a PNG; half that as a JPEG
                        // to save space we don't use toDataURLHD here
                        if (this.first) {
                            this.funf.record('thumb', { uuid: uuid,
                                                        data: thumbUrl });
                        }
                    }.bind(this), 100);
                }.bind(this));
            }
        }.bind(this);
        uuids.forEach(addUUID);
        // make "new document" element
        addUUID('new', -1);
    };
    Gallery.prototype.trash = function(uuid) {
        Sync['delete'].call(Sync, uuid, function() {
            var a = this.domElement.querySelector('a.'+uuid);
            this.domElement.removeChild(a);
        }.bind(this));
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
