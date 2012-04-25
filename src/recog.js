/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, setTimeout:false, clearTimeout:false,
         Worker:false */
define(['./compat', './drawcommand', './hand/features',], function(Compat, DrawCommand, Features, HMM, hmmdef) {
    'use strict';

    var extractDataSet = function(commands, start, end) {
        var i, cmd;
        var strokes = [];
        var currentStroke = [];
        var bbox = null, pt;
        for (i=start; i<end; i++) {
            cmd = commands[i];
            switch (cmd.type) {
            case DrawCommand.Type.DRAW:
                // canvas x/y is upside-down wrt training data y
                currentStroke.push([cmd.pos.x, -cmd.pos.y]);
                if (bbox) {
                    bbox.unionPt(cmd.pos);
                } else {
                    pt = new Features.Point(cmd.pos.x, cmd.pos.y);
                    bbox = new Features.Box(pt.clone(), pt.clone());
                }
                break;
            case DrawCommand.Type.DRAW_END:
                if (currentStroke.length > 0) {
                    strokes.push(currentStroke);
                    currentStroke = [];
                }
                break;
            default:
                /* ignore this draw command */
                break;
            }
        }
        if (strokes.length===0) { return null; /* no character here. */ }
        var data_set = { strokes: strokes, ppmm: {x:1, y:1}, bbox: bbox };
        Features.normalize(data_set);
        Features.smooth(data_set);
        Features.singleStroke(data_set);
        Features.equidist(data_set);
        if (data_set.strokes[0].length===0) { return null;/*no character data*/}
        Features.features(data_set);
        if (data_set.features.length===0) { return null; /* no features */ }
        Features.delta_and_accel(data_set);
        return data_set;
    };
    // callback infra
    var recogCallback = null;
    var registerCallback = function(callback) {
        console.assert(recogCallback === null);
        recogCallback = callback;
    };
    // Make a web worker
    var worker = new Compat.Worker('src/worker.js'); // XXX make location relative.
    var nextRecogAttempt = null, recogPending = true;
    var maybeMakeRecogAttempt = function() {
        if (recogPending || nextRecogAttempt===null) { return; }
        var message = { type: 'recog', data_set: nextRecogAttempt };
        worker.postMessage(JSON.stringify(message));
        nextRecogAttempt = null;
        recogPending = true;
    };
    worker.addEventListener('message', function(evt) {
        var data = JSON.parse(evt.data);
        switch (data.type) {
        case 'debug':
            console.log.apply(console, data.args);
            break;
        case 'ready': // worker is ready
            recogPending = false;
            maybeMakeRecogAttempt();
            break;
        case 'recog': // recognition results
            /*
            console.log("Got result: "+data.model,
                        "prob", data.prob, "bbox", data.bbox);
            */
            recogPending = false;
            maybeMakeRecogAttempt();
            if (recogCallback) {
                recogCallback(data.model, data.prob, data.bbox);
            }
            break;
        default:
            console.error("Unexpected message from worker", evt);
            break;
        }
    });
    // start web worker.
    worker.postMessage(JSON.stringify({type:'start'}));

    var attemptRecognition = function(commands, start, end) {
        if (typeof(start)!=='number') { start=0; }
        if (typeof(end)  !=='number') { end = commands.length; }
        var data_set = extractDataSet(commands, start, end);
        if (!data_set) { return; /* no character here to look at */ }
        // do recog in a web worker?
        nextRecogAttempt = data_set;
        maybeMakeRecogAttempt();
        return;
    };
    return {
        attemptRecognition: attemptRecognition,
        registerCallback: registerCallback
    };
});
