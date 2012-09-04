/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./drawing', './lzw', './lawnchair/lawnchair'], function(Drawing, LZW, Lawnchair) {
    var DEBUG = false;
    var TOP = 'top';

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

    var addToIndex = function(drawing, callback) {
        Lawnchair({name:'drawing_index'}, function() {
            var lawnchair = this;
            lawnchair.save({
                key: drawing.uuid,
                ctime: drawing.ctime,
                mtime: Date.now()
            }, function() {
                callback.call(drawing);
            });
        });
    };
    var removeFromIndex = function(uuid, callback) {
        Lawnchair({name:'drawing_index'}, function() {
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
                callback(results.map(function(r) { return r.key; }));
            });
        });
    };

    Sync['delete'] = function(uuid, callback) {
        removeFromIndex(uuid, function() {
            Lawnchair({name:'drawing.'+uuid}, function() {
                this.nuke(callback, true);
            });
        });
    };

    Sync.load = function(uuid, callback) {
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
        Lawnchair({name:'drawing.'+uuid}, function() { withLawnchair(this); });
    };

    Sync.exists = function(uuid, callback) {
        var withLawnchair = function(lawnchair) {
            lawnchair.exists(TOP, callback);
        };
        Lawnchair({name:'drawing.'+uuid}, function() { withLawnchair(this); });
    };

    Sync.save = function(drawing, callback, optForce) {
        console.assert(drawing.uuid);
        var saveWithLawnchair = function(lawnchair) {
            var dj = drawing.toJSON('use chunks');
            var wrapUp = function() {
                if (DEBUG) { console.log('writing', drawing.uuid); }
                lawnchair.save({ key: TOP, data: dj }, function() {
                    addToIndex(drawing, callback);
                });
            };
            var chunk = dj.nChunks;
            var saveChunk = function() {
                chunk--;
                if (chunk < 0) {
                    wrapUp();
                } else {
                    getDefault(lawnchair, ''+chunk, null, function(c) {
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
        Lawnchair({name:'drawing.'+drawing.uuid}, function() {
            var s = function() { saveWithLawnchair(this); }.bind(this);
            if (optForce) {
                this.nuke(s);
            } else {
                s();
            }
        });
    };

    return Sync;
});