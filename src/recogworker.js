/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, postMessage:false */
define(['./hand/hmm', 'json!./hand/8s2a256-64-16t.json'], function(HMM, hmmdef) {
    'use strict';
    /* Handwriting recognition! */
    var config = { };
    var recog = HMM.make_recog(hmmdef, config);
    //console.log("Handwriting model loaded.");
    hmmdef = null; // free memory

    var handleRecog = function(data_set, postMessage) {
        var results = recog(data_set);
        var message = {
            type: 'recog',
            bbox: data_set.bbox, // pass back orig. bounding box of this match
            model: results[0],
            prob: results[1]
        };
        //console.log("Recognized", message.model, "prob", message.prob);
        postMessage(JSON.stringify(message));
    };

    var startup = function(addEventListener, postMessage) {
        addEventListener('message', function(evt) {
            var data = JSON.parse(evt.data);
            switch (data.type) {
            case 'start':
                /* this is the startup message; ignore it. */
                break;
            case 'recog':
                // recognition request
                handleRecog(data.data_set, postMessage);
                break;
            default:
                console.error("Unexpected worker message", evt);
                break;
            }
        });
    };
    return {
        startup: startup
    };
});
