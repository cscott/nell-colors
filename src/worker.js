/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global importScripts:false, require:false, console:true,
         addEventListener:false, postMessage:false */

// This module contains just the require.js thunks to use AMD w/in the web
// worker environment.
importScripts('../require.js');
require.config({
    paths: {
        json: "../plugins/json",
        text: "../plugins/text"
    }
});
// compatibility thunk
console = {
    assert: function(condition, message) {
        if (!condition) { throw new Error(message); }
    },
    log: function(varargs) {
        var message = {
            type: "debug",
            args: Array.prototype.slice.call(arguments, 0)
        };
        postMessage(JSON.stringify(message));
    }
};
console.warn = console.log;
console.error = console.log;

require(['./recogworker'], function(RecogWorker) {
    RecogWorker.startup(addEventListener, postMessage);
    postMessage(JSON.stringify({type:'ready'}));
});
