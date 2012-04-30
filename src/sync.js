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

    Sync.save = function(drawing, callback, optForce) {
        console.assert(drawing.uuid);
        var saveWithLawnchair = function(lawnchair) {
            var dj = drawing.toJSON('use chunks');
            var wrapUp = function() {
                if (DEBUG) { console.log('writing', drawing.uuid); }
                lawnchair.save({ key: TOP, data: dj }, callback);
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
