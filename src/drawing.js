/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false */
define(['./brush','./color','./drawcommand','./layer','./prandom!'], function(Brush, Color, DrawCommand, Layer, prandom) {

    // A Drawing is a sequence of DrawCommands and a set of layer.
    // It maintains the playback and undo/redo logic

    // Adjust this to trade off between the space taken by checkpoints
    // and the speed of replay.  The small interval is used when editing;
    // the large one is used when loading or doing playback
    var SMALL_CHECKPOINT_INTERVAL = 300;
    var LARGE_CHECKPOINT_INTERVAL = 10*SMALL_CHECKPOINT_INTERVAL;

    // Adjust this to trade off between network packet size and the
    // number of network transactions needed to load a drawing
    // (chunk size of 1000 is 10k-50k a chunk *gzip compressed*)
    var DEFAULT_CHUNK_SIZE = 1000;

    var Drawing = function() {
        this.domElement = document.createElement('div');
        this.commands = [];
        this.commands.last = 0;
        // .end might not == .length if we've got a redo buffer at the end
        this.commands.end = 0;
        this.layers = [ ];
        // checkpoint list, for fast undo
        this.checkpoints = [];
        this.checkpointOften = true;
        this.resize(100,100,1); // default size
        this.layers.current = this.addLayer(); // one default layer
        // chunks for fast save/restore/sync
        this.chunks = [];
        this.ctime = Date.now(); // creation time
        // hack in a brush change and color change
        // XXX we should have a different way to synchronize brush after load
        this.brush = new Brush(Color.BLACK, 'soft', 20, 0.7, 0.2);
        this.addCmd(DrawCommand.create_color_change(this.brush.color));
        this.addCmd(DrawCommand.create_brush_change({
            brush_type: this.brush.type,
            size: this.brush.size,
            opacity: this.brush.opacity,
            spacing: this.brush.spacing
        }));
        // where to start looking for a letter; this probably should be
        // refactored elsewhere.
        this.commands.recog = this.commands.end;
    };
    Drawing.prototype = { };
    Drawing.prototype.attachToContainer = function(container) {
        container.appendChild(this.domElement);
    };
    Drawing.prototype.removeFromContainer = function(container) {
        container.removeChild(this.domElement);
    };
    Drawing.prototype.addLayer = function() {
        var l = new Layer();
        l.resize(this.width, this.height, this.pixelRatio);
        this.layers.push(l);
        this.domElement.appendChild(l.domElement);
        return this.layers.length - 1; // index of new layer
    };
    Drawing.prototype.addCmd = function(cmd) {
        this.commands[this.commands.end++] = cmd;
        // truncate any redo buffer
        this.commands.length = this.commands.end;
        // truncate any stale checkpoints
        while (this.checkpoints.length > 0 &&
               this.checkpoints[this.checkpoints.length-1].pos >=
               this.commands.length) {
            this.checkpoints.pop();
        }
        // truncate stale chunks
        // Note the deliberate "off by one" in the comparison -- we want
        // to invalidate the final partial chunk written after a save, to
        // ensure that the next save is a complete chunk.
        while (this.chunks.length > 0 &&
               this.chunks[this.chunks.length-1].end >=
               (this.commands.length-1)) {
            this.chunks.pop();
        }
    };
    Drawing.START =  0;
    Drawing.END   = -1;
    Drawing.prototype.setCmdPos = function(pos, optTimeLimit) {
        var startTime = Date.now();
        if (pos===Drawing.END) { pos = this.commands.end; }
        console.assert(pos <= this.commands.end);
        // use checkpoints for efficiency
        var checkpoint = this._findNearestCheckpoint(pos);
        if (checkpoint) {
            if ((pos < this.commands.last) ||
                (pos - checkpoint.pos) < (pos - this.commands.last)) {
                // restoring checkpoint also sets this.commands.last
                this._restoreCheckpoint(checkpoint);
            }
        } else if (pos < this.commands.last) {
            this._clear();
            this.commands.last = 0;
        }
        console.assert(this.commands.last <= pos);
        while (this.commands.last < pos) {
            this._execCommand(this.commands[this.commands.last++]);
            if (this.commands[this.commands.last-1].type ===
                DrawCommand.Type.DRAW_END) {
                this.addCheckpoint();
                if (optTimeLimit && (Date.now() - startTime) > optTimeLimit) {
                    break;
                }
            }
        }
        // returns 'true' if there are more commands not yet drawn
        return (this.commands.last < this.commands.end);
    };
    Drawing.prototype.setCmdTime = function(timeDelta, optTimeLimit) {
        // scan ahead looking for the proper end point
        var i = this.commands.last;
        if (i === this.commands.end) {
            return false; // no more commands to draw
        }
        var lastCmd = this.commands[i++]; // always execute at least one cmd
        while (i < this.commands.end && timeDelta > 0) {
            var thisCmd = this.commands[i++];
            if (lastCmd.type===DrawCommand.Type.DRAW &&
                thisCmd.type===DrawCommand.Type.DRAW) {
                timeDelta -= (thisCmd.time - lastCmd.time);
            }
            lastCmd = thisCmd;
        }
        // okay, execute to this location
        // returns 'true' if there are more commands not yet drawn
        return this.setCmdPos(i, optTimeLimit);
    };

    Drawing.prototype.undo = function(optTimeLimit) {
        if (this.commands.end===0) { return false; /* nothing to undo */ }
        var i = this.commands.end-1;
        while (i >= 0 && this.commands[i].type !== DrawCommand.Type.DRAW_START){
            i--;
        }
        if (i<0) { return false; /* nothing but color changes to undo */ }
        // i should now point to a DRAW_START command.
        this.setCmdPos(i, optTimeLimit);
        this.commands.end = i;
        var isMore = (this.commands.last < this.commands.end);
        return isMore;
    };
    Drawing.prototype.redo = function(optTimeLimit) {
        if (this.commands.end >= this.commands.length) {
            return false; // nothing to redo
        }
        // scan forward for the next DRAW_END
        var i = this.commands.end;
        while (i < this.commands.length &&
               this.commands[i].type !== DrawCommand.Type.DRAW_END) {
            i++;
        }
        while (i < this.commands.length &&
               this.commands[i].type !== DrawCommand.Type.DRAW_START) {
            i++;
        }
        this.commands.end = i;
        var isMore = this.setCmdPos(Drawing.END, optTimeLimit);
        return isMore;
    };
    Drawing.prototype.resize = function(width, height, pixelRatio) {
        this.layers.forEach(function(l) {
            l.resize(width, height, pixelRatio);
        });
        this.commands.last = 0;
        this.width = width;
        this.height = height;
        this.pixelRatio = pixelRatio;
        // invalidate any checkpoints which are too small for the new size
        this.checkpoints = this.checkpoints.filter(function(c) {
            return c.width >= width &&
                c.height >= height &&
                c.pixelRatio===pixelRatio;
        });
    };
    Drawing.prototype._clear = function() {
        this.layers.forEach(function(l) { l.clear(); });
    };
    // returns true iff a visible change to the canvas was made
    Drawing.prototype._execCommand = function(cmd) {
        switch(cmd.type) {
        case DrawCommand.Type.DRAW_START:
            this.layers.current = cmd.layer;
            return this.layers[this.layers.current].execCommand(cmd);
        case DrawCommand.Type.DRAW:
        case DrawCommand.Type.DRAW_END:
            return this.layers[this.layers.current].execCommand(cmd,this.brush);
        case DrawCommand.Type.COLOR_CHANGE:
            this.brush.color = cmd.color;
            this.layers.forEach(function(l) { l.execCommand(cmd); });
            return false;
        case DrawCommand.Type.BRUSH_CHANGE:
            ['brush_type','size','opacity','spacing'].forEach(function(f) {
                if (f in cmd) {
                    this.brush[(f==='brush_type')?'type':f] = cmd[f];
                }
            }.bind(this));
            this.layers.forEach(function(l) { l.execCommand(cmd); });
            return false;
        default:
            console.assert(false, "Unknown drawing command", cmd);
            break;
        }
    };
    Drawing.prototype._saveCheckpoint = function() {
        return new Drawing.Checkpoint({
            pos: this.commands.last,
            brush: this.brush.clone(),
            layers: this.layers.map(function(layer) {
                return layer.saveCheckpoint();
            }),
            width: this.width,
            height: this.height,
            pixelRatio: this.pixelRatio
        });
    };
    Drawing.prototype._restoreCheckpoint = function(checkpoint) {
        this.commands.last = checkpoint.pos;
        this.brush = checkpoint.brush.clone();
        checkpoint.layers.forEach(function(chk, i) {
            this.layers[i].restoreCheckpoint(chk);
        }.bind(this));
    };
    var _binarySearch = function(arr, find, comparator) {
        var low = 0, high = arr.length - 1, i, comparison;
        while (low <= high) {
            i = low + Math.floor((high - low) / 2); // avoid canonical bug
            comparison = comparator(arr[i], find);
            if (comparison < 0) {
                low = i + 1;
            } else if (comparison > 0) {
                high = i - 1;
            } else {
                return i;
            }
        }
        // if search key not in the list, return (-(insertion point) - 1)
        return -(low + 1);
    };
    var _chkcmp = function(c1, c2) { return c1.pos - c2.pos; };
    Drawing.prototype._findNearestCheckpoint = function(pos) {
        // "nearest" means "nearest but not after the specified pos"
        var ipos = _binarySearch(this.checkpoints, {pos:pos}, _chkcmp);
        if (ipos >= 0) {
            // found exactly!
            return this.checkpoints[ipos];
        }
        ipos = -(ipos + 1); // insertion point
        if (ipos===0) {
            return null; // no appropriate checkpoint found
        }
        return this.checkpoints[ipos-1];
    };
    Drawing.prototype.addCheckpoint = function(optForce) {
        // keep checkpoints array in sorted order
        var nc = { pos: this.commands.last };
        var ipos = _binarySearch(this.checkpoints, nc, _chkcmp);
        if (ipos >= 0) {
            // this checkpoint already present
            return;
        }
        ipos = -(ipos + 1); // insertion point
        // don't save too many checkpoints
        var dist = nc.pos - ((ipos===0) ? 0 : this.checkpoints[ipos-1].pos);
        var checkpoint_interval = (this.checkpointOften) ?
            SMALL_CHECKPOINT_INTERVAL : LARGE_CHECKPOINT_INTERVAL;
        if (dist < checkpoint_interval && !optForce) {
            // too close to existing checkpoint, skip it
            return;
        }
        this.checkpoints.splice(ipos, 0, this._saveCheckpoint());
        // now thin out the checkpoint list
        this._thinCheckpoints();
    };
    Drawing.prototype._thinCheckpoints = function() {
        // thin out old checkpoints
        var nc = [], i;
        var prevPos = 0; // always a virtual checkpoint at 0
        for (i=0; i<this.checkpoints.length-1; i++) {
            if (this.checkpoints[i].pos > this.commands.last) { break; }
            // thin out "such that the interval between checkpoints [does] not
            // grow larger that the distance from the end of the resulting
            // combined interval to the current execution point."
            // this creates a set of exponentially larger checkpoint intervals,
            // ensuring that the time for this scan, and the space taken by
            // the checkpoints, are O(ln N) (where N is the # of strokes)
            // http://dx.doi.org/10.1145/349299.349339 (section 5.1)
            var between = this.checkpoints[i+1].pos - prevPos;
            var fromEnd = this.commands.last - this.checkpoints[i+1].pos;
            if (between > fromEnd) {
                // keep this checkpoint
                nc.push(this.checkpoints[i]);
                prevPos = this.checkpoints[i].pos;
            } // else discard it
        }
        // keep all checkpoints currently in the future
        for ( ; i<this.checkpoints.length; i++) {
            nc.push(this.checkpoints[i]);
        }
        this.checkpoints = nc;
    };

    Drawing.Checkpoint = function(props) {
        var name;
        for (name in props) {
            if (props.hasOwnProperty(name)) {
                this[name] = props[name];
            }
        }
    };
    Drawing.Checkpoint.prototype = {};
    Drawing.Checkpoint.fromJSON = function(str, callback) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        json.brush = Brush.fromJSON(json.brush);
        if (json.layers.length===0) {
            callback(new Drawing.Checkpoint(json));
        } else {
            var completed = 0;
            json.layers.forEach(function(l, i) {
                Layer.Checkpoint.fromJSON(l, function(lc) {
                    json.layers[i] = lc;
                    completed++;
                    if (completed === json.layers.length) {
                        callback(new Drawing.Checkpoint(json));
                    }
                });
            });
        }
    };

    Drawing.Chunk = function(drawing, num, start, end, prev) {
        this.drawing = drawing;
        this.uuid = prandom.uuid();
        this.num = num;
        this.start = start;
        this.end = end;
        this.prev = prev;
    };
    Drawing.Chunk.prototype = {};
    Drawing.Chunk.prototype.toJSON = function() {
        console.assert(this.end <= this.drawing.commands.length);
        var json = {
            num: this.num,
            uuid: this.uuid,
            start: this.start,
            prev: this.prev
        };
        if (this.drawing.uuid) { json.drawing = this.drawing.uuid; }
        if (this.checkpoint) {
            var cp = this.drawing._findNearestCheckpoint(this.end);
            if (cp) { json.checkpoint = cp; }
        }
        json.commands = this.drawing.commands.slice(this.start, this.end);
        return json;
    };
    Drawing.prototype._makeChunks = function() {
        // linear progression of chunks
        // FUTURE: invalidate some chunks to give logarithmic # of chunks?
        if (this.commands.length === 0) { return; }
        // remove stale checkpoint chunks
        while (this.chunks.length > 0 &&
               this.chunks[this.chunks.length-1].checkpoint &&
               (this.chunks[this.chunks.length-1].end + DEFAULT_CHUNK_SIZE) <
               this.commands.length) {
            this.chunks.pop();
        }
        while (true) {
            // create another chunk
            var start = (this.chunks.length===0) ? 0 :
                this.chunks[this.chunks.length-1].end;
            if (start >= this.commands.length) {
                break;
            }
            var end = Math.min(start + DEFAULT_CHUNK_SIZE,
                               this.commands.length);
            var prevChunk = (this.chunks.length===0) ? null :
                this.chunks[this.chunks.length-1];
            var newChunk = new Drawing.Chunk(
                this,
                prevChunk ? (prevChunk.num+1) : 0,
                start, end,
                prevChunk ? (prevChunk.uuid) : null);
            if (newChunk.end < this.commands.length &&
                newChunk.end + DEFAULT_CHUNK_SIZE >= this.commands.length) {
                // checkpoint goes on penultimate chunk
                newChunk.checkpoint = true;
            }
            this.chunks.push(newChunk);
        }
    };

    Drawing.prototype.toJSON = function(useChunks) {
        // save only the 1st and last checkpoints to save space.
        var ncheckpoints = [];
        if (this.checkpoints.length>0 && !useChunks) {
            ncheckpoints.push(this.checkpoints[0]);
        }
        if (this.checkpoints.length>1 && !useChunks) {
            ncheckpoints.push(this.checkpoints[this.checkpoints.length-1]);
        }
        var json = {
            end: this.commands.end, // save redo buffer
            nLayers: this.layers.length,
            width: this.width,
            height: this.height,
            pixelRatio: this.pixelRatio,
            ctime: this.ctime,
            checkpoints: ncheckpoints
        };
        if (this.uuid) {
            json.uuid = this.uuid;
        }
        if (useChunks) {
            this._makeChunks();
        }
        if (useChunks && this.chunks.length > 0) {
            json.firstChunk = this.chunks[0].uuid;
            json.lastChunk = this.chunks[this.chunks.length-1].uuid;
            json.nChunks = this.chunks.length;
        } else {
            json.commands = this.commands;
        }
        return json;
    };
    var fromChunksOrJSON = function(str, chunks, callback) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        var drawing = new Drawing();
        while (drawing.layers.length < (json.nLayers || json.nlayers)) {
            drawing.addLayer();
        }
        drawing.commands.length=drawing.commands.end=drawing.commands.last = 0;
        var checkpoints = [];
        if (chunks) {
            drawing.chunks = chunks.map(function(str) {
                var json = (typeof(str)==='string') ? JSON.parse(str) : str;
                json.commands.forEach(function(c) {
                    drawing.addCmd(DrawCommand.fromJSON(c));
                });
                var chunk = new Drawing.Chunk(drawing, json.num, json.start,
                                              json.start + json.commands.length,
                                              json.prev);
                chunk.uuid = json.uuid;
                if (json.checkpoint) {
                    checkpoints.push(json.checkpoint);
                    chunk.checkpoint = true;
                }
                return chunk;
            });
        } else {
            json.commands.forEach(function(c) {
                drawing.addCmd(DrawCommand.fromJSON(c));
            });
            checkpoints = json.checkpoints;
        }
        drawing.commands.end = drawing.commands.recog = json.end;
        drawing.resize(json.width, json.height, json.pixelRatio || 1);
        if (json.active_layer) {
            drawing.layers.current = json.active_layer || 0;
        }
        if (json.initial_playback_speed) {
            drawing.initial_playback_speed = json.initial_playback_speed || 2;
        }
        if (json.uuid) {
            drawing.uuid = json.uuid;
        }
        if (json.ctime) {
            drawing.ctime = json.ctime;
        }
        // restore checkpoints
        if (checkpoints.length===0) {
            callback(drawing);
        } else {
            var completed = 0;
            checkpoints.forEach(function(c, i) {
                Drawing.Checkpoint.fromJSON(c, function(chk) {
                    drawing.checkpoints[i] = chk;
                    completed++;
                    if (completed === checkpoints.length) {
                        callback(drawing);
                    }
                });
            });
        }
    };
    Drawing.fromJSON = function(str, callback) {
        return fromChunksOrJSON(str, null, callback);
    };
    Drawing.fromChunks = function(top, chunks, callback) {
        return fromChunksOrJSON(top, chunks, callback);
    };

    return Drawing;
});
