/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./src/dom', './src/touch', './raf'], function(Dom, Touch, requestAnimationFrame) {
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

    var finishPath = function(path) {
        console.log('path finished', path);
    };

    var paths = {};

    var animRequested = false;
    var refresh = function() {
        // go through and draw all the new stuff.
        context.beginPath();
        Object.getOwnPropertyNames(paths).forEach(function(id$) {
            var path = paths[id$], i;
            var start = path.lastUpdate, end = path.length-1;

            if (start===end) { return; }
            context.moveTo(path[start].x, path[start].y);
            for (i=start+1; i<=end; i++) {
                context.lineTo(path[i].x, path[i].y);
            }
            path.lastUpdate = end;
        });
        context.stroke();
        animRequested = false;
    };

    var handleTouchStart = function(pt) {
        var id$ = '$' + pt.id;
        if (id$ in paths) { return; }
        paths[id$] = [ pt ];
        paths[id$].lastUpdate = 0;
    };
    var handleTouchMove = function(pt) {
        var id$ = '$' + pt.id;
        console.assert(id$ in paths);
        var path = paths[id$];
        var last = path[path.length-1];
        if (pt.equals(last)) { return; }
        path.push(pt);
        if (!animRequested) {
            animRequested = true;
            requestAnimationFrame(refresh);
        }
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
                    delete paths[id];
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
