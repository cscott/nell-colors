/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./src/dom', './src/touch'], function(Dom, Touch) {
    // get 2d context for canvas.
    var canvasElem = Dom.initial_canvas;
    var context = canvasElem.getContext('2d');
    console.log(canvasElem.width, canvasElem.height);

    var setLineStyle = function(context) {
            /*
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 6;
        context.shadowColor = 'rgba(0,0,0,1)';
            */
        context.strokeStyle = 'rgba(0,0,0,1)';
        context.lineWidth = 4;
        context.lineCap = 'round';
        context.lineJoin = 'round';
    };

    var drawSegment = function(from, to) {
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
        context.fill();
    };
    var finishPath = function(path) {
        console.log('path finished', path);
    };

    var paths = {};
    var handleTouchStart = function(pt) {
                var id$ = '$' + pt.id;
                if (id$ in paths) { return; }
                paths[id$] = [ pt ];
    };
    var handleTouchMove = function(pt) {
                var id$ = '$' + pt.id;
                console.assert(id$ in paths);
                var path = paths[id$];
                var last = path[path.length-1];
                if (pt.equals(last)) { return; }
                path.push(pt);
                drawSegment(last, pt);
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
