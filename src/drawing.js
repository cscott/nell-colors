/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, Uint8Array:false */
define(['./brush','./color','./drawcommand','./layer'], function(Brush, Color, DrawCommand, Layer) {

    // A Drawing is a sequence of DrawCommands and a set of layer.
    // It maintains the playback and undo/redo logic

    var Drawing = function(container) {
        this.commands = [];
        this.commands.last = 0;
        // .end might not == .length if we've got a redo buffer at the end
        this.commands.end = 0;
        this.layers = [ new Layer() ];
        this.layers.current = 0;
        this.layers.forEach(function(l) {
            container.appendChild(l.domElement);
        });
        // hack in a brush change and color change
        // XXX we should have a different way to synchronize brush after load
        this.brush = new Brush(Color.BLACK, Brush.Type.SOFT, 20, 0.7, 0.2);
        this.addCmd(DrawCommand.create_color_change(this.brush.color));
        this.addCmd(DrawCommand.create_brush_change(this.brush.type,
                                                    this.brush.size,
                                                    this.brush.opacity,
                                                    this.brush.spacing));
        // where to start looking for a letter; this probably should be
        // refactored elsewhere.
        this.commands.recog = this.commands.end;
    };
    Drawing.prototype = { };
    Drawing.prototype.addCmd = function(cmd) {
        this.commands[this.commands.end++] = cmd;
        // truncate any redo buffer
        this.commands.length = this.commands.end;
    };
    Drawing.START =  0;
    Drawing.END   = -1;
    Drawing.prototype.setCmdPos = function(pos) {
        if (pos===Drawing.END) { pos = this.commands.end; }
        console.assert(pos <= this.commands.end);
        if (pos < this.commands.last) {
            // moving backward
            // XXX make more efficient using checkpoints
            this._clear();
            this.commands.last = 0;
        }
        while (this.commands.last < pos) {
            this._execCommand(this.commands[this.commands.last++]);
        }
        // returns 'true' if there are more commands not yet drawn
        return (this.commands.last < this.commands.end);
    };
    Drawing.prototype.setCmdTime = function(timeDelta) {
        while (this.commands.last < this.commands.end) {
            this._execCommand(this.commands[this.commands.last++]);
            if (this.commands.last < this.commands.end) {
                var c1 = this.commands[this.commands.last-1];
                var c2 = this.commands[this.commands.last  ];
                if (c1.type===DrawCommand.Type.DRAW &&
                    c2.type===DrawCommand.Type.DRAW) {
                    timeDelta -= (c2.time - c1.time);
                }
            }
            if (timeDelta <= 0) { break; }
        }
        // returns 'true' if there are more commands not yet drawn
        return (this.commands.last < this.commands.end);
    };

    Drawing.prototype.undo = function() {
        if (this.commands.end===0) { return false; /* nothing to undo */ }
        var i = this.commands.end-1;
        while (i >= 0 && this.commands[i].type !== DrawCommand.Type.DRAW_START){
            i--;
        }
        if (i<0) { return false; /* nothing but color changes to undo */ }
        // i should now point to a DRAW_START command.
        this.setCmdPos(i);
        this.commands.end = i;
        return true;
    };
    Drawing.prototype.redo = function() {
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
        this.setCmdPos(Drawing.END);
        return true;
    };
    Drawing.prototype.resize = function(width, height, pixelRatio) {
        this.layers.forEach(function(l) {
            l.resize(width, height, pixelRatio);
        });
        this.commands.last = 0;
    };
    Drawing.prototype._clear = function() {
        this.layers.forEach(function(l) { l.clear(); });
    };
    Drawing.prototype._execCommand = function(cmd) {
        switch(cmd.type) {
        case DrawCommand.Type.DRAW_START:
            this.layers.current = cmd.layer;
            this.layers[this.layers.current].execCommand(cmd);
            break;
        case DrawCommand.Type.DRAW:
        case DrawCommand.Type.DRAW_END:
            this.layers[this.layers.current].execCommand(cmd, this.brush);
            break;
        case DrawCommand.Type.COLOR_CHANGE:
            this.brush.color = cmd.color;
            this.layers.forEach(function(l) { l.execCommand(cmd); });
            break;
        case DrawCommand.Type.BRUSH_CHANGE:
            this.brush.type = cmd.brush_type;
            this.brush.size = cmd.size;
            this.brush.opacity = cmd.opacity;
            this.brush.spacing = cmd.spacing;
            this.layers.forEach(function(l) { l.execCommand(cmd); });
            break;
        default:
            console.assert(false, "Unknown drawing command", cmd);
            break;
        }
    };

    Drawing.prototype.loadJSON = function(input_drawing) {
        input_drawing.commands.forEach(function(c) {
            var cmd = new DrawCommand(c.type), name;
            for (name in c) {
                if (c.hasOwnProperty(name)) {
                    if (name==='color') {
                        cmd[name] = new Color();
                        cmd[name].set_from_color(c[name]);
                    } else {
                        cmd[name] = c[name];
                    }
                }
            }
            this.addCmd(cmd);
        }.bind(this));
        this.commands.recog = this.commands.end;
    };


    return Drawing;
});
