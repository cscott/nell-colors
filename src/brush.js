/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, Uint8Array:false, document:false */
define(['./color'], function(Color) {
    // Brush-related functions.
    // Ported from canvas.h of Colors! XO activity, GPL license.
    
    var BrushType = {
        HARD: 0,
        SOFT: 1,
        CURSOR: 2,
        NUM_BRUSHES: 3
    };
    Object.freeze(BrushType);

    var DIST_TABLE_WIDTH = 256; // width of distance lookup table
    var DIST_TABLE_CENTER = DIST_TABLE_WIDTH/2; // center of lookup table
    var BRUSH_TABLE_WIDTH = 256; // width of brush lookup table
    /* Height of 65 allows a brush size down to 1.0f */
    var BRUSH_TABLE_HEIGHT = 65;
    /* Scales down the brush size so we don't index out of range. */
    var EXTRA_BRUSH_SCALE = 1.023;


    /* Creates a simple sqrt-lookup table. */
    var create_distance_table = function() {
        var distance_tbl = new Uint8Array(DIST_TABLE_WIDTH * DIST_TABLE_WIDTH);
        var x, y, dx, dy, dist;
        for (x = 0; x < DIST_TABLE_WIDTH; x++) {
            for (y = 0; y < DIST_TABLE_WIDTH; y++) {
                dx = x - DIST_TABLE_CENTER;
                dy = y - DIST_TABLE_CENTER;
                dist = Math.sqrt(dx*dx + dy*dy);
                distance_tbl[x + y*DIST_TABLE_WIDTH] =
                    Math.floor(Math.min(255, dist * 255 / DIST_TABLE_CENTER));
            }
        }
        return distance_tbl;
    };
    var distance_tbl = create_distance_table(); // initialize table

    /** Calculates a gradient between 0 and 1 where the derivative at both
     * 0 and 1 is 0.  This function is used to calculate the falloff of the
     * brushes. */
    var smooth_step = function(a) {
        return (Math.sin((a*a - 0.5) * Math.PI) * 0.5) + 0.5;
    };

    var create_brush = function(brush_border, amp) {
        var intensity_tbl =
            new Uint8Array(BRUSH_TABLE_WIDTH * BRUSH_TABLE_HEIGHT);

        // Find at what range from brush center the brush intensity goes below
        // 2.
        var max_r = 0, i, f, f2;
        for (i=BRUSH_TABLE_WIDTH-1; i>=0; i--) {
            f = i / BRUSH_TABLE_WIDTH;
            f2 = 1 - (f - brush_border) / (1 - brush_border);
            if (Math.round(smooth_step(f2) * amp) >= 2) {
                max_r = i;
                break;
            }
        }
        // Calculate a scale factor so the brush optimally uses the area.
        var r = (max_r + 2) / BRUSH_TABLE_WIDTH / BRUSH_TABLE_WIDTH;
        var x, y, intensity_row = [];
        for (y = 0; y < BRUSH_TABLE_HEIGHT; y++) {
            // Each line in the brush table is calculated for a
            // specific brush size.  This has two functions:
            // 1. Be able to simulate the effect of resampling of the
            // "perfect" big brush to a smaller one to improve
            // precision
            // 2. Compensate for the need to scale small brushes to
            // avoid index out of range during rastering

            // Calculate scale for this width
            var brushscale = EXTRA_BRUSH_SCALE + y * 2 / 64;

            // Calculate brush
            for (i = 0; i < BRUSH_TABLE_WIDTH; i++) {
                // Apply the two different scales
                f = Math.min(i * r * brushscale, 1.0);

                if (f < brush_border) {
                    intensity_row[i] = Math.floor(amp);
                } else {
                    f2 = 1.0 - (f - brush_border) / (1.0 - brush_border);
                    // Make sure the border-falloff is smooth
                    f2 = smooth_step(f2) * amp;
                    intensity_row[i] = Math.round(f2);
                }
            }

            // Simulate the effect of resampling
            var blurradius = Math.round(y * BRUSH_TABLE_WIDTH /
                                        (brushscale * 64));
            var maxintensity = 0;
            for (x = 0; x < BRUSH_TABLE_WIDTH; x++) {
                var l = 0, x2;
                for (x2 = x - blurradius; x2 < x + blurradius + 1; x2++) {
                    i = Math.min(Math.max(x2, 0), BRUSH_TABLE_WIDTH-1);
                    if (i < BRUSH_TABLE_WIDTH) {
                        l += intensity_row[i];
                    }
                }
                var intensity = l / (blurradius * 2 + 1);
                if (intensity > maxintensity) {
                    maxintensity = intensity;
                }
                intensity_tbl[x + y*BRUSH_TABLE_WIDTH] = Math.floor(intensity);
            }
        }
        return { intensity_tbl: intensity_tbl };
    };
    var create_hard_brush = function() {
        return create_brush(0.8, 255);
    };
    var create_soft_brush = function() {
        return create_brush(0.0, 128);
    };
    var create_cursor = function() {
        return { intensity_tbl: null }; // XXX
    };

    var BrushControl = {
        NONE: 0,
        VARIABLE_OPACITY: 1,
        VARIABLE_SIZE: 2
    };
    Object.freeze(BrushControl);

    var Brush = function(color, type, size, control, opacity) {
        this.color = color || Color.WHITE;
        this.type = type || BrushType.HARD;
        this.size = size || 32;
        this.control = control || 0;
        this.opacity = opacity || 1.0;
    };
    Brush.brush_type = [];
    Brush.brush_type[BrushType.HARD] = create_hard_brush();
    Brush.brush_type[BrushType.SOFT] = create_soft_brush();
    Brush.brush_type[BrushType.CURSOR] = create_cursor();

    Brush.Type = BrushType;
    Brush.Control = BrushControl;

    Brush.prototype.toCanvas = function() {
        // XXX should we scale the canvas up based on the devicePixelRatio ?
        var brushwidth = this.size;
        if (brushwidth < 2) { brushwidth = 2; }
        var size = Math.ceil(brushwidth);

        var c = document.createElement('canvas');
        c.width = c.height = size;
        var context = c.getContext('2d');
        var data = context.createImageData(size, size);
        // now render to this canvas
        var halfwidth = brushwidth/2;
        var center = Math.floor(size/2); // don't center between pixels

        var db = (DIST_TABLE_WIDTH - 1) / brushwidth;

        // Select which line of the brush lookup table to use that
        // most closely matches the current brush width
        var brushidx = Math.floor(BRUSH_TABLE_HEIGHT / brushwidth);

        // Interpolate the distance table over the area.  For each
        // pixel find the distance, and look up the brush intensity
        // in the brush table.
        var x,y;
        for (x=0; x<size; x++) {
            for (y=0; y<size; y++) {
                // x0 and y0 range roughly from [-halfwidth, halfwidth]
                var x0 = x - center, y0 = y - center;
                var xb = (x0 * db) + DIST_TABLE_CENTER;
                var yb = (y0 * db) + DIST_TABLE_CENTER;
                xb = Math.max(0, Math.min(xb, DIST_TABLE_WIDTH-1));
                yb = Math.max(0, Math.min(yb, DIST_TABLE_WIDTH-1));

                // Find brush intensity and multiply that w/ incoming opacity
                var lookup = distance_tbl[Math.floor(xb) + Math.floor(yb)*DIST_TABLE_WIDTH];
                var intensity = Brush.brush_type[this.type].intensity_tbl[lookup+brushidx*BRUSH_TABLE_WIDTH];

                var base = (x + y*size)*4;
                data.data[base+0] = this.color.red; /* red */
                data.data[base+1] = this.color.green;   /* green */
                data.data[base+2] = this.color.blue;   /* blue */
                data.data[base+3] = intensity; /* opacity */
            }
        }
        // ok, put the data back
        context.putImageData(data, 0, 0);
        return c;
    };

    return Brush;
});
