/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define([], function() {
    'use strict';

    /* Simple polyfill to fixup broken iOS postmessage */

    return function postMessage(target, message, origin, ports) {
        // workaround implementations that will not serialize objects
        try {
            target.postMessage(message, origin, ports);
        } catch (e) {
            // legacy webkit-proprietary order, needed for iOS 5
            // (also catches implementations which only allow string messages?)
            if (typeof(message)!=='string') {
                message = JSON.stringify(message);
            }
            target.postMessage(message, ports, origin);
        }
    };
});
