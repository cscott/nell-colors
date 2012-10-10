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
        this.lastPoint = new Point();
        this.firstPoint = new Point();
        this.spentDist = 0;
        // temporaries, to avoid reallocating points every time we invoke
        // execDraw()
        this._draw_from = new Point();
        this._draw_to   = new Point();
        this._draw_tmp  = new Point();
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
            this.spentDist = 0;
            var stamp = this._getBrushStamp(brush);
            var center = stamp.width / 2;
            // possibly rotate brush
            var r = brush.rotationIncrement();
            var f = brush.followsTangent();
            if (f && this.brushPoints===0 && this.tangent === null) {
                /* draw nothing for first point, we need at least two
                 * points to compute a tangent to follow */
                this.firstPoint.set_from_point(pos);
            } else if (r===0 && !f) {
                // easy case, no rotation
                this.progressContext.drawImage(stamp,
                                               pos.x - center,
                                               pos.y - center);
            } else {
                // progressive rotation:
                r *= this.brushPoints;
                // compute tangent to follow:
                if (f) {
                    var SMOOTH_FACTOR = 0.8; // adjust based on brush.spacing?
                    // t is in [-pi, pi]
                    var t = Math.atan2(pos.y - this.lastPoint.y,
                                       pos.x - this.lastPoint.x);
                    if (this.brushPoints===0) {
                        // redrawing point #0 after we've seen point #1
                        t = this.tangent;
                    } else if (this.brushPoints > 1) {
                        // lightly smooth tangent (for small step sizes)
                        var lt = this.tangent;
                        // step 1, ensure that t > lt
                        if (lt >= t) { lt -= 2*Math.PI; }
                        // step 2, compare (t-lt) to (2*pi+lt-t), use closest
                        if ((t-lt) > (2*Math.PI+lt-t)) { lt += 2*Math.PI; }
                        // step 3, average, then restore to [-pi,pi] interval
                        t = (SMOOTH_FACTOR*t) + ((1-SMOOTH_FACTOR)*lt);
                        if (t > Math.PI) { t -= 2*Math.PI; }
                        if (t < -Math.PI) { t += 2*Math.PI; }
                    }
                    this.tangent = t;
                    r += t;
                    if (this.brushPoints === 1) {
                        // go back and draw point #0
                        // note that this.firstPoint !== this.lastPoint,
                        // because lastPoint may be the last path endpoint,
                        // not necessarily the last stamp location
                        this.brushPoints--;
                        this._drawStamp(this.firstPoint, brush);
                        this.brushPoints++;
                    }
                }
                this.progressContext.save();
                this.progressContext.translate(pos.x, pos.y);
                this.progressContext.rotate(r);
                this.progressContext.drawImage(stamp, -center, -center);
                this.progressContext.restore();
            }
            this.lastPoint.set_from_point(pos);
        },
        execDraw: function(x, y, brush) {
            var from=this._draw_from, to=this._draw_to, tmp=this._draw_tmp;

            from.set_from_point(this.lastPoint);
            to.set(x, y);

            var drawn = false;
            if (!this.isDrawingPath) {
                this.brushPoints = 0;
                this.tangent = null;
                this.isDrawingPath = true;
                this._drawStamp(to, brush);
                drawn = true;
            } else {
                // interpolate along path
                var dist = Point.dist(from, to), d;
                // step should never be less than 1 px.
                var step = Math.max(1, brush.size * brush.spacing);
                for (d = (step-this.spentDist); d < dist; d+= step) {
                    this.brushPoints++; // for brush rotation
                    this._drawStamp(Point.interp(from, to, d/dist, tmp),
                                    brush);
                    drawn = true;
                }
                // what's left over?
                this.spentDist = dist - (d-step);
                this.lastPoint.set_from_point(to);

                if (!drawn) {
                    // XXX idle?
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
    Layer.Checkpoint = function(canvas, isThumbnail) {
        this.canvas = canvas;
        this.isThumbnail = !!isThumbnail;
    };
    Layer.Checkpoint.prototype = {};
    Layer.Checkpoint.prototype.toJSON = function() {
        // store at native canvas resolution, if that's not the same as
        // # of canvas CSS pixels
        var toDataURLHD = (this.canvas.toDataURLHD || this.canvas.toDataURL).
            bind(this.canvas);
        // dataURL might end up as image/png regardness of isThumbnail, but
        // that's ok.  lossy compression is only permissible for thumbnails.
        var dataURL = toDataURLHD(this.isThumbnail ? "image/jpeg" :
                                  "image/png");
        var result = {
            canvas: dataURL,
            // we need to store canvas width/height because it may not
            // match image width/height (when we use toDataURLHD)
            w: this.canvas.width,
            h: this.canvas.height
        };
        // don't waste space on isThumbnail field unless it's set.
        if (this.isThumbnail) { result.isThumbnail = true; }
        return result;
    };
    Layer.Checkpoint.fromJSON = function(str, callback) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        var image = document.createElement('img');
        // xxx can't load image from data: url synchronously
        image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = ('w' in json) ? json.w : image.width;
            canvas.height = ('h' in json) ? json.h : image.height;
            canvas.getContext('2d').drawImage(image, 0, 0,
                                              canvas.width, canvas.height);
            callback(new Layer.Checkpoint(canvas, json.isThumbnail));
        };
        image.src = json.canvas;
    };

    return Layer;
});
