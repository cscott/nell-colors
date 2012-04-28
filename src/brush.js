/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['img!../brushes/brush-tile-129.png', './color'], function(brushesImg, Color) {
    'use strict';
    // Brush-related functions.
    // Inspired by canvas.h of Colors! XO activity, GPL license.
    
    // names/indexes of brushes in brushesImg
    var BrushTypes = {
        hard: 0,
        medium: 1,
        'rough fine': 2,
        'rough coarse': 3,
        soft: 4,
        'dots small': 5,
        'dots large': 6,
        rect: 7,
        splotch: 8,
        'splotches coarse': 9
    };
    var NUM_BRUSHES = 0;
    if (brushesImg) {
        NUM_BRUSHES = brushesImg.width / brushesImg.height;
        //console.log('Loaded',NUM_BRUSHES,'brushes');
    }

    var Brush = function(color, type, size, opacity, spacing) {
        this.color = color || Color.BLACK;
        this.type = type || 'hard';
        this.size = size || 32;
        this.opacity = opacity || 1.0;
        this.spacing = spacing || 0.225; // fraction of brush size
    };
    Brush.prototype = {};

    Brush.Types = BrushTypes;

    Brush.fromJSON = function(str) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        var color = new Color();
        color.set_from_color(json.color);
        // legacy brush compatibility (Colors! brushes)
        var type = (json.type===0)?'hard':(json.type===1)?'soft':json.type;
        return new Brush(color, json.type, json.size, json.opacity,
                         json.spacing);
    };

    Brush.prototype.equals = function(b) {
        if (this===b) { return true; }
        return Color.equal(this.color, b.color) &&
            this.type === b.type &&
            this.size === b.size &&
            this.opacity === b.opacity &&
            this.spacing === b.spacing;
    };

    Brush.prototype.clone = function() {
        return new Brush(this.color, this.type, this.size, this.opacity,
                         this.spacing);
    };

    Brush.prototype.toCanvas = function() {
        // XXX should we scale the canvas up based on the devicePixelRatio ?
        // (currently we scale up in layer.js, should be refactored)
        var HALF_MASTER_BRUSH_SIZE = Math.floor(brushesImg.height/2);
        var half_width = Math.min(Math.max(1, Math.ceil(this.size / 2)),
                                  HALF_MASTER_BRUSH_SIZE);
        var canvas_size = (half_width*2) + 1;
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = canvas_size;
        var context = canvas.getContext('2d');
        // fill with brush color
        context.fillStyle = this.color.to_string().replace(/..$/,'');
        context.fillRect(0,0,canvas.width,canvas.height);
        // now scale & draw the brush image.
        // (use exact floating-point this.size)
        context.translate(half_width+0.5, half_width+0.5);
        var scale = Math.max(2,this.size+1) / brushesImg.height;
        context.scale(scale, scale);
        // offset image to match which brush is selected
        var offset = 0;
        if (Brush.Types.hasOwnProperty(this.type)) {
            offset = Brush.Types[this.type];
        } else { console.warn("Unknown brush type", this.type); }
        offset *= brushesImg.height;
        // mix with brush color fill
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(brushesImg,
                          -HALF_MASTER_BRUSH_SIZE-0.5 - offset,
                          -HALF_MASTER_BRUSH_SIZE-0.5);
        return canvas;
    };

    return Brush;
});
