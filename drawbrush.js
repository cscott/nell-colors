// reworked version of colors brush code -- try to generate a brush image
// from first principles.  (Then we'll use the GPU to scale up/down the
// canonical brush image.)
define(['domReady!','./BlobBuilder', './canvas-toBlob', './FileSaver'], function(document, BlobBuilder, _, saveAs) {
    // brush is actually 2*HALF_BRUSH_SIZE + 1 pixels square.
    // use odd number of pixels so that center is squarely on a pixel.
    var HALF_BRUSH_SIZE = 64;

    var make_brush = function(brush_border, amp, half_brush_size) {
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = 2*half_brush_size + 1;
        canvas.style.width = canvas.style.height = canvas.width+'px';
        canvas.style.border = '1px solid black';
        var context = canvas.getContext('2d');
        var data = context.createImageData(canvas.width, canvas.height);

        var EXTRA_BRUSH_SCALE = 1.023;

        var smooth_step = function(a) {
            return (Math.sin((a*a - 0.5) * Math.PI) * 0.5) + 0.5;
        };

        var f = function(x) {
            var f2 = 1 - (x - brush_border) / (1 - brush_border);
            return smooth_step(f2) * amp;
        };

        var x,y;
        for (x=-half_brush_size; x<=half_brush_size; x++) {
            var nx = x+half_brush_size;
            for (y=-half_brush_size; y<=half_brush_size; y++) {
                var ny = y+half_brush_size;
                var dist = Math.sqrt(x*x + y*y);
                var dist01 = dist / half_brush_size;
                var alpha = 0;
                if (dist01 < brush_border) {
                    alpha = amp;
                } else if (dist01 <= 1) {
                    alpha = f(dist01);
                }
                //console.log(x, y, dist, dist01, alpha);

                var base = (nx + ny*canvas.width) * 4;
                data.data[base+0] = 0; // red
                data.data[base+1] = 0; // green
                data.data[base+2] = 0; // blue
                data.data[base+3] = Math.round(alpha); // alpha
            }
        }
        context.putImageData(data, 0, 0);
        return canvas;
    };
    var addCanvas = function(canvas) {
        var a = document.createElement('a');
        a.appendChild(canvas);
        if (false) {
            a.href = canvas.toDataURL('image/png');
        } else {
            a.href='#';
            a.addEventListener('click', function() {
                canvas.toBlob(function(blob) {
                    saveAs(blob, 'brush.png');
                }, 'image/png');
            });
        }
        document.body.appendChild(a);
    };

    var hard, medium, soft;
    // hard brush
    addCanvas(hard = make_brush(0.8, 255, HALF_BRUSH_SIZE));
    // medium brush (from brushes, not in colors)
    addCanvas(medium = make_brush(0.8, 128, HALF_BRUSH_SIZE));
    // soft brush
    addCanvas(soft = make_brush(0.0, 128, HALF_BRUSH_SIZE));

    // scale down to 2px brush
    var SMALL=1;
    var canvas = document.createElement('canvas');
    canvas.style.width = canvas.style.height = (2*HALF_BRUSH_SIZE+1)+'px';
    canvas.style.border = '1px solid red';
    canvas.width = canvas.height = (2*SMALL+1);
    var ctxt = canvas.getContext('2d');
    ctxt.translate(SMALL+.5, SMALL+.5);
    var scale = ((2*SMALL+1)*1.023)/(2*HALF_BRUSH_SIZE+1);
    ctxt.scale(scale, scale);
    ctxt.drawImage(hard, -HALF_BRUSH_SIZE-.5, -HALF_BRUSH_SIZE-.5);
    addCanvas(canvas);
});
