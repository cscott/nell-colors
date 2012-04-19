/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./src/dom', './src/touch', './src/brush', './src/point', './src/color', './raf'], function(Dom, Touch, Brush, Point, Color, requestAnimationFrame) {
    // get 2d context for canvas.
    var canvasElem = Dom.initial_canvas;
    var context = canvasElem.getContext('2d');
    console.log(canvasElem.width, canvasElem.height);

    var setLineStyle = function(context) {
        context.strokeStyle = 'rgba(0,0,0,1)';
        context.lineWidth = 4;
        context.lineCap = 'round';
        context.lineJoin = 'round';
    };
    var brush = new Brush(Color.RED, Brush.Type.SOFT);
    var brush_stamp = brush.toCanvas();
    var brush_spacing = 0.225; // of brush size
    var draw_stamp = function(pos) {
        var center = Math.floor(brush_stamp.width / 2);
        var x = Math.round(pos.x) - center, y = Math.round(pos.y) - center;
        context.drawImage(brush_stamp, x, y);
    };
    var draw_stamps = function(path, lastUpdate) {
        if (!('lastPoint' in path)) {
            path.lastPoint = path[0];
            draw_stamp(path.lastPoint);
        }

        var i, d;
        for (i=lastUpdate; i<path.length; i++) {
            var from = path.lastPoint;
            var to = path[i];
            // interpolate along path
            var dist = Point.dist(from, to);
            var step = brush.size * brush_spacing;//brush size could change
            if (dist < step) {
                // XXX support 'idle' mode
                continue;
            }
            for (d = step; d < dist; d+=step) {
                path.lastPoint = Point.interp(from, to, d/dist);
                draw_stamp(path.lastPoint);
            }
        }
    };

    var finishPath = function(path) {
        console.log('path finished', path);
    };

    var paths = { };
    var paths_done = [];

    var animRequested = false;
    var DRAW_LINE = false, DRAW_STAMPS = true;
    var refresh = function() {
        // go through and draw all the new stuff.
        paths_done.forEach(function(path) {
            draw_stamps(path, path.lastUpdate);
        });
        paths_done.length = 0;

        if (DRAW_LINE) { context.beginPath(); }
        Object.getOwnPropertyNames(paths).forEach(function(id$) {
            var path = paths[id$], i;
            var start = path.lastUpdate, end = path.length-1;

            if (DRAW_LINE && start!==end) {
                context.moveTo(path[start].x, path[start].y);
                for (i=start+1; i<=end; i++) {
                    context.lineTo(path[i].x, path[i].y);
                }
            }
            if (DRAW_STAMPS) {
                draw_stamps(path, start);
            }
            path.lastUpdate = end;
        });
        if (DRAW_LINE) { context.stroke(); }
        animRequested = false;
    };
    var maybeRequestAnim = function() {
        if (!animRequested) {
            animRequested = true;
            requestAnimationFrame(refresh);
        }
    };

    var handleTouchStart = function(pt) {
        var id$ = '$' + pt.id;
        if (id$ in paths) { return; }
        paths[id$] = [ pt ];
        paths[id$].lastUpdate = 0;
        maybeRequestAnim();
    };
    var handleTouchMove = function(pt) {
        var id$ = '$' + pt.id;
        console.assert(id$ in paths);
        var path = paths[id$];
        var last = path[path.length-1];
        if (pt.equals(last)) { return; }
        path.push(pt);
        maybeRequestAnim();
    };
    var handleTouch = function(event) {
        switch (event.type) {
        case 'start': // a new finger is down.
            event.globalPositions.forEach(handleTouchStart);
            break;
        case 'move': // some fingers have moved.
            event.globalPositions.forEach(handleTouchMove);
            break;
        case 'end': // some fingers have lifted
            var ended = {}, id;
            for (id in paths) {
                if (paths.hasOwnProperty(id)) {
                    ended[id] = true;
                }
            }
            event.globalPositions.forEach(function(pt) {
                var id$ = '$' + pt.id;
                handleTouchMove(pt);
                delete ended[id$];
            });
            // now which ones actually ended?
            for (id in ended) {
                if (ended.hasOwnProperty(id)) {
                    finishPath(paths[id]);
                    paths_done.push(paths[id]);
                    delete paths[id];
                    maybeRequestAnim();
                }
            }
            break;
        case 'cancel':
            // throw out entire path.
            paths = {};
            // XXX reset canvas
            break;
        }
    };

    Touch.addTouchEventHandler(canvasElem, handleTouch);
    setLineStyle(context);
    canvasElem.resizeHandler = function() {
        setLineStyle(context);
    };
});
