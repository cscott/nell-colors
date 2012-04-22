define(['./drawcommand.js', './hand/features.js','./hand/hmm.js', 'json!./hand/8s2a256-64-16d.json'], function(DrawCommand, Features, HMM, hmmdef) {
    /* Handwriting recognition! */
    var config = { };
    var recog = HMM.make_recog(hmmdef, config);
    console.log("Handwriting model loaded.");
    hmmdef = null; // free memory

    var extractDataSet = function(commands, start, end) {
        var i, cmd;
        var strokes = [];
        var currentStroke = [];
        for (i=start; i<end; i++) {
            cmd = commands[i];
            switch (cmd.type) {
            case DrawCommand.Type.DRAW:
                // canvas x/y is upside-down wrt training data y
                currentStroke.push([cmd.pos.x, -cmd.pos.y]);
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
        if (strokes.length===0) return null; // no character here.
        var data_set = { strokes: strokes, ppmm: {x:1, y:1} };
        Features.normalize(data_set);
        Features.smooth(data_set);
        Features.singleStroke(data_set);
        Features.equidist(data_set);
        if (data_set.strokes[0].length===0) return null; // no character data
        Features.features(data_set);
        if (data_set.features.length===0) return null; // no features
        Features.delta_and_accel(data_set);
        return data_set;
    };
    var attemptRecognition = function(commands, start, end) {
        if (typeof(start)!=='number') start=0;
        if (typeof(end)  !=='number') end = commands.length;
        var data_set = extractDataSet(commands, start, end);
        if (!data_set) return null; // no character here to look at
        // XXX do recog in a web worker?
        var model = recog(data_set);
        console.log("Recognized", model[0], "prob", model[1]);
        return { model: model[0], prob: model[1] };
    };
    return {
        attemptRecognition: attemptRecognition
    };
});
