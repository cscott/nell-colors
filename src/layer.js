/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false */
define(['./drawcommand', './brush', './point'], function(DrawCommand, Brush, Point) {
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
        // default brush
        this.brush = new Brush();
        this.brush_stamp = null;
        this.progressCanvas.style.opacity = this.brush.opacity;
        // line state
        this.isDrawingPath = false;
        // XXX handle resize events?
    };
    Layer.prototype = {
        _getBrushStamp: function() {
            if (this.brush_stamp === null) {
                this.brush_stamp = this.brush.toCanvas();
            }
            return this.brush_stamp;
        },
        execColorChange: function(color) {
            console.assert(!this.isDrawingPath);
            this.brush = new Brush(color, this.brush.type, this.brush.size,
                                   this.brush.opacity, this.brush.spacing);
            this.brush_stamp = null;
        },
        execBrushChange: function(type, size, opacity, spacing) {
            console.assert(!this.isDrawingPath);
            this.brush = new Brush(this.brush.color, type, size, opacity,
                                   spacing);
            this.brush_stamp = null;
            this.progressCanvas.style.opacity = this.brush.opacity;
        },
        _drawStamp: function(pos) {
            this.lastPoint = pos;
            var stamp = this._getBrushStamp();
            var center = Math.floor(stamp.width / 2);
            var x = Math.round(pos.x) - center, y = Math.round(pos.y) - center;
            this.progressContext.drawImage(stamp, x, y);
        },
        execDraw: function(x, y) {
            var pos = { x:x, y:y };
            if (!this.isDrawingPath) {
                this._drawStamp(pos);
                this.isDrawingPath = true;
            } else {
                var from = this.lastPoint;
                var to = pos;
                // interpolate along path
                var dist = Point.dist(from, to), d;
                var step = this.brush.size * this.brush.spacing;
                if (dist < step) {
                    // XXX idle?
                } else {
                    for (d = step; d < dist; d+= step) {
                        this._drawStamp(Point.interp(from, to, d/dist));
                    }
                }
            }
        },
        execDrawEnd: function() {
            console.assert(this.isDrawingPath);
            // transfer from 'progress' to 'completed' canvas.
            this.completedContext.globalAlpha = this.brush.opacity;
            this.completedContext.drawImage(this.progressCanvas, 0, 0);
            this.progressContext.clearRect(0,0, this.width, this.height);
            this.isDrawingPath = false;
        },
        execCommand: function(draw_command) {
            switch(draw_command.type) {
            case DrawCommand.Type.DRAW:
                this.execDraw(draw_command.pos.x * this.pixel_ratio,
                              draw_command.pos.y * this.pixel_ratio);
                break;
            case DrawCommand.Type.DRAW_END:
                this.execDrawEnd();
                break;
            case DrawCommand.Type.COLOR_CHANGE:
                this.execColorChange(draw_command.color);
                break;
            case DrawCommand.Type.BRUSH_CHANGE:
                this.execBrushChange(draw_command.brush_type,
                                     draw_command.size * this.pixel_ratio,
                                     draw_command.opacity,
                                     draw_command.spacing);
                break;
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
        },
        resize: function(width, height, pixel_ratio) {
            var w = width * pixel_ratio, h = height * pixel_ratio;
            [this,this.completedCanvas,this.progressCanvas].forEach(function(o){
                o.width = w;
                o.height = h;
            });
            this.pixel_ratio = pixel_ratio;
        }
    };
    return Layer;
});
