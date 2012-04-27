/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false */
define(['./drawcommand', './brush', './point'], function(DrawCommand, Brush, Point) {
    'use strict';
    // Each 'layer' in a drawing is a <div><canvas/><canvas/></div>.
    // The top canvas is for real-time drawing, and its opacity corresponds
    // to the current pen opacity.  The bottom canvas displays all
    // completed strokes.
    var id = 0;
    var Layer = function() {
        this.domElement = document.createElement("div");
        this.completedCanvas = document.createElement("canvas");
        this.progressCanvas = document.createElement("canvas");
        this.domElement.appendChild(this.completedCanvas);
        this.domElement.appendChild(this.progressCanvas);
        this.domElement.id = "layer"+(id++);
        [this.domElement,
         this.completedCanvas,
         this.progressCanvas].forEach(function(e) {
             e.style.position = "absolute";
             e.style.left = e.style.top = e.style.right = e.style.bottom="0px";
             e.style.width="100%";
             e.style.height="100%";
         });
        this.progressContext = this.progressCanvas.getContext('2d');
        this.completedContext = this.completedCanvas.getContext('2d');
        // cached brush stamp
        this.brush_stamp = null;
        // line state
        this.isDrawingPath = false;
        // XXX handle resize events?
    };
    Layer.prototype = {
        _getBrushStamp: function(brush) {
            if (this.brush_stamp === null) {
                var b = brush.clone(); b.size *= this.pixel_ratio;
                b.size = Math.max(0, Math.min(128, Math.round(b.size)));
                this.brush_stamp = b.toCanvas();
                this.progressCanvas.style.opacity = brush.opacity;
            }
            return this.brush_stamp;
        },
        _drawStamp: function(pos, brush) {
            this.lastPoint = pos;
            var stamp = this._getBrushStamp(brush);
            var center = Math.floor(stamp.width / 2);
            var x = Math.round(pos.x) - center, y = Math.round(pos.y) - center;
            this.progressContext.drawImage(stamp, x, y);
        },
        execDraw: function(x, y, brush) {
            var pos = { x:x, y:y };
            var drawn = false;
            if (!this.isDrawingPath) {
                this._drawStamp(pos, brush);
                this.isDrawingPath = true;
                drawn = true;
            } else {
                var from = this.lastPoint;
                var to = pos;
                // interpolate along path
                var dist = Point.dist(from, to), d;
                var step = brush.size * brush.spacing;
                if (dist < step) {
                    // XXX idle?
                } else {
                    for (d = step; d < dist; d+= step) {
                        this._drawStamp(Point.interp(from, to, d/dist), brush);
                        drawn = true;
                    }
                }
            }
            return drawn;
        },
        execDrawEnd: function() {
            console.assert(this.isDrawingPath);
            // transfer from 'progress' to 'completed' canvas.
            this.completedContext.globalAlpha=this.progressCanvas.style.opacity;
            this.completedContext.drawImage(this.progressCanvas, 0, 0);
            this.progressContext.clearRect(0,0, this.width, this.height);
            this.isDrawingPath = false;
            return false;
        },
        // returns true iff we actually made a change to the canvas
        execCommand: function(draw_command, brush) {
            switch(draw_command.type) {
            case DrawCommand.Type.DRAW_START:
                console.assert(!this.isDrawingPath);
                return false;
            case DrawCommand.Type.DRAW:
                return this.execDraw(draw_command.pos.x * this.pixel_ratio,
                                     draw_command.pos.y * this.pixel_ratio,
                                     brush);
            case DrawCommand.Type.DRAW_END:
                return this.execDrawEnd();
            case DrawCommand.Type.COLOR_CHANGE:
            case DrawCommand.Type.BRUSH_CHANGE:
                console.assert(!this.isDrawingPath);
                this.brush_stamp = null;
                return false;
            default:
                console.assert(false, draw_command);
            }
        },
        cancelCurrentStroke: function() {
            this.progressContext.clearRect(0,0,this.width,this.height);
            this.isDrawingPath = false;
        },
        clear: function() {
            [this.progressContext, this.completedContext].forEach(function(c){
                c.clearRect(0,0, this.width, this.height);
            }.bind(this));
            this.isDrawingPath = false;
            // reset brush as well.
            this.brush_stamp = null;
        },
        resize: function(width, height, pixel_ratio) {
            var w = width * pixel_ratio, h = height * pixel_ratio;
            [this,this.completedCanvas,this.progressCanvas].forEach(function(o){
                o.width = w;
                o.height = h;
            });
            this.isDrawingPath = false;
            this.brush_stamp = null;
            this.pixel_ratio = pixel_ratio;
        },
        saveCheckpoint: function() {
            console.assert(!this.isDrawingPath);
            var ncanvas = document.createElement('canvas');
            ncanvas.width = this.completedCanvas.width;
            ncanvas.height = this.completedCanvas.height;
            ncanvas.getContext('2d').drawImage(this.completedCanvas, 0, 0);
            return new Layer.Checkpoint(ncanvas);
        },
        restoreCheckpoint: function(checkpoint) {
            console.assert(typeof(checkpoint)!=='string',
                           'need to decode checkpoint before restoring');
            this.clear();
            console.assert(!this.isDrawingPath);
            this.completedContext.globalAlpha = 1.0;
            this.completedContext.drawImage(checkpoint.canvas, 0, 0);
        }
    };
    Layer.Checkpoint = function(canvas) {
        this.canvas = canvas;
    };
    Layer.Checkpoint.prototype = {};
    Layer.Checkpoint.prototype.toJSON = function() {
        return {
            canvas: this.canvas.toDataURL('image/png')
        };
    };
    Layer.Checkpoint.fromJSON = function(str, callback) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        var image = document.createElement('img');
        // xxx can't load image from data: url synchronously
        image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext('2d').drawImage(image, 0, 0);
            callback(new Layer.Checkpoint(canvas));
        };
        image.src = json.canvas;
    };

    return Layer;
});
