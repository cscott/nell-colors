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
    var BrushTypes = ['hard', 'medium', 'rough fine', 'rough coarse',
                      'soft', 'dots small', 'dots large', 'rect', 'hlines',
                      'sticks', 'splotch', 'splotches coarse'];
    // map name to index and vice versa
    BrushTypes.forEach(function(type, idx) {
        BrushTypes[type] = idx;
    });
    // default brush spacings
    var BrushSpacing = {
        hard: 0.22,
        medium: 0.06,
        'rough fine': 0.09,
        'rough coarse': 0.20,
        soft: 0.11,
        'dots small': 0.67,
        'dots large': 1.00,
        rect: 0.12,
        hlines: 0.10,
        sticks: 0.19,
        splotch: 0.25,
        'splotches coarse': 0.23
    };
    // per-stamp brush rotation, in radians
    // using rationals for rotation amount means period is infinite.
    var BrushRotation = {
        'rough fine': 0.5,
        'rough coarse': 0.5,
        sticks: 0.66,
        splotch: 0.6,
        'splotches coarse': 1.2
    };
    // brush rotation following path tangent
    var BrushFollowTangent = {
        rect: true,
        hlines: true
    };

    var NUM_BRUSHES = 0;
    if (brushesImg) {
        NUM_BRUSHES = brushesImg.width / brushesImg.height;
        //console.log('Loaded',NUM_BRUSHES,'brushes');
    }

    var Brush = function(color, type, size, opacity, spacing) {
        this.set(color, type, size, opacity, spacing);
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

    Brush.prototype.set = function(color, type, size, opacity, spacing) {
        this.color = color || Color.BLACK;
        this.type = type || 'hard';
        this.size = size || 32;
        this.opacity = (typeof(opacity)==='number') ? opacity : 1.0;
        this.spacing = spacing || 0.225; // fraction of brush size
        return this; // fluent api
    };

    Brush.prototype.set_from_brush = function(brush) {
        return this.set(brush.color, brush.type, brush.size, brush.opacity,
                        brush.spacing);
    };

    Brush.prototype.setToDefaultSpacing = function() {
        this.spacing = BrushSpacing[this.type] || 0.05;
        return this; // fluent api
    };

    Brush.prototype.rotationIncrement = function() {
        return BrushRotation[this.type] || 0;
    };

    Brush.prototype.followsTangent = function() {
        return !!(BrushFollowTangent[this.type]);
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
