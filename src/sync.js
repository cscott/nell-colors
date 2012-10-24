/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./drawing', './lzw', './lawnchair/lawnchair', './samples'], function(Drawing, LZW, Lawnchair, Samples) {
    var DEBUG = false;
    var TOP = 'top';
    // keep these constants in sync with .gallery rule in ncolors.css
    // (proportions should match, but we might want to account for some
    //  CSS-pixel-to-device-pixel scaling here)
    var THUMB_WIDTH = 160, THUMB_HEIGHT = 120;

    // Sync drawing to local storage.
    var Sync = {};

    var getDefault = function(lawnchair, key, defaultValue, callback) {
        lawnchair.exists(key, function(exists) {
            if (exists) {
                lawnchair.get(key, callback);
            } else {
                callback(defaultValue);
            }
        });
    };

    var addToIndex = function(drawing, adapter, callback) {
        Lawnchair({name:'drawing_index', adapter:adapter}, function() {
            var lawnchair = this;
            var thumb = drawing.makeThumbnail(THUMB_WIDTH, THUMB_HEIGHT);
            lawnchair.save({
                key: drawing.uuid,
                thumb: JSON.stringify(new Drawing.Layer.Checkpoint(thumb,true)),
                ctime: drawing.ctime,
                mtime: Date.now()
            }, function() {
                callback.call(drawing);
            });
        });
    };
    var removeFromIndex = function(uuid, adapter, callback) {
        Lawnchair({name:'drawing_index', adapter:adapter}, function() {
            var lawnchair = this;
            lawnchair.remove(uuid, callback);
        });
    };

    Sync.list = function(callback) {
        Lawnchair({name:'drawing_index'}, function() {
            var lawnchair = this;
            lawnchair.all(function(results) {
                results.sort(function(a, b) {
                    // oldest first
                    return a.ctime - b.ctime;
                });
                // return list of uuids (don't expose 'key' field)
                // second arg is a list of promises for the thumbnails
                //  ie, a function which you can call with a callback which
                //      will then get invoked with a decoded <canvas>
                callback(results.map(function(r) { return r.key; }),
                         results.map(function(r) {
                             if (!r.thumb) { return null; /* no thumbnail */}
                             return function(callback) {
                                 var cb = function(layerCheckpoint) {
                                     callback(layerCheckpoint.canvas);
                                 };
                                 Drawing.Layer.Checkpoint.fromJSON(r.thumb,cb);
                             };
                         }));
            });
        });
    };

    Sync['delete'] = function(uuid, where, callback) {
        var lawnchairParams = { name: 'drawing.'+uuid };
        if (where === 'remote') {
            lawnchairParams.adapter = 'nell-colors-journal';
        }
        removeFromIndex(uuid, lawnchairParams.adapter, function() {
            Lawnchair(lawnchairParams, function() {
                this.nuke(callback, true);
            });
        });
    };

    Sync.load = function(uuid, where, callback) {
        if (where==='sample') {
            return Samples.load(uuid, callback);
        }
        var withLawnchair = function(lawnchair) {
            lawnchair.get(TOP, function(top) {
                var i, done = 0, chunks = [];
                var doChunk = function(i) {
                    lawnchair.get(''+i, function(achunk) {
                        chunks[i] = JSON.parse(LZW.decode(achunk.data));
                        done++;
                        if (done===top.data.nChunks) {
                            Drawing.fromChunks(top.data, chunks, callback);
                        }
                    });
                };
                for (i=0; i<top.data.nChunks; i++) {
                    doChunk(i);
                }
            });
        };
        var lawnchairParams = { name: 'drawing.'+uuid };
        if (where === 'remote') {
            lawnchairParams.adapter = 'nell-colors-journal';
            lawnchairParams.wildcard = true;
        }
        Lawnchair(lawnchairParams, function() { withLawnchair(this); });
    };

    Sync.exists = function(uuid, callback) {
        if (Samples.exists(uuid)) {
            return callback(true, 'sample');
        }
        var lawnchairParams = { name: 'drawing.'+uuid };
        Lawnchair(lawnchairParams, function() {
            var lawnchair = this;
            lawnchair.exists(TOP, function(exists) {
                if (exists) {
                    callback(true, 'local');
                } else if (window.navigator && window.navigator.onLine) {
                    lawnchairParams.adapter = 'nell-colors-journal';
                    lawnchairParams.wildcard = true;
                    Lawnchair(lawnchairParams, function() {
                        var lawnchair = this;
                        lawnchair.exists(TOP, function(exists) {
                            callback(exists, 'remote');
                        });
                    });
                } else {
                    callback(false, 'local');
                }
            });
        });
    };

    Sync.save = function(drawing, callback, optForce) {
        console.assert(drawing.uuid);
        var saveWithLawnchair = function(lawnchair, dj, callback) {
            var wrapUp = function() {
                if (DEBUG) { console.log('writing', drawing.uuid); }
                lawnchair.save({ key: TOP, data: dj }, function() {
                    addToIndex(drawing, lawnchair.adapter, function() {
                        return callback.call(drawing, true/*success*/);
                    });
                });
            };
            var chunk = dj.nChunks;
            var saveChunk = function() {
                chunk--;
                if (chunk < 0) {
                    wrapUp();
                } else {
                    getDefault(lawnchair, ''+chunk, null, function(c) {
                        if (chunk >= drawing.chunks.length) {
                            // whoops, we're stale!
                            // XXX clean up written chunks
                            // bail
                            return callback.call(drawing, false);
                        }
                        // XXX we should check to be sure this chunk's UUID
                        // still matches what we expect it to be.
                        if (c && c.uuid === drawing.chunks[chunk].uuid) {
                            // all the rest of the chunks are up to date
                            wrapUp();
                        } else {
                            if (DEBUG) { console.log('writing', chunk); }
                            lawnchair.save({
                                key: ''+chunk,
                                uuid: drawing.chunks[chunk].uuid,
                                data: LZW.encode(JSON.stringify(drawing.chunks[chunk]))
                            }, saveChunk);
                        }
                    });
                }
            };
            saveChunk();
        };
        var dj = drawing.toJSON('use chunks');
        var withLawnchair = function(callback) {
            return function() {
                var lawnchair = this;
                var s = function() {
                    saveWithLawnchair(lawnchair, dj, callback);
                };
                if (optForce) {
                    lawnchair.nuke(s);
                } else {
                    s();
                }
            };
        };
        var lawnchairParams = { name: 'drawing.'+drawing.uuid };
        // save locally.
        Lawnchair(lawnchairParams, withLawnchair(function(success) {
            if (success && window.navigator && window.navigator.onLine) {
                // try to save to cloud
                if (DEBUG) { console.log('saving to cloud'); }
                lawnchairParams.adapter = 'nell-colors-journal';
                Lawnchair(lawnchairParams, withLawnchair(callback));
            } else {
                callback.call(drawing, success);
            }
        }));
    }
    return Sync;
});
