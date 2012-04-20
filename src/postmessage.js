/* Simple polyfill to fixup broken iOS postmessage */
define([], function() {
    return function postMessage(target, message, origin, ports) {
        // workaround implementations that will not serialize objects
        try {
            target.postMessage(message, origin, ports);
        } catch (e) {
            // legacy webkit-proprietary order, needed for iOS 5
            // (also catches implementations which only allow string messages?)
            if (typeof(message)!=='string')
                message = JSON.stringify(message);
            target.postMessage(message, ports, origin);
        }
    };
});
