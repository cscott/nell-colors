// encapsulate Funf functionality
define([], function() {
    var DEBUG = false; // dump funf output to console

    var FUNF_ACTION_RECORD = 'edu.mit.media.funf.RECORD';
    var FUNF_ACTION_ARCHIVE = 'edu.mit.media.funf.ARCHIVE';
    var FUNF_DATABASE_NAME = 'mainPipeline';

    var Funf = function(appName) {
        console.assert(appName.indexOf('-') < 0,
                       "funf doesn't like hyphens in the appName");
        this.appName = appName;
    };
    Funf.prototype = {};
    Funf.prototype.record = function(name, value) {
        if (typeof value === 'object' /* includes arrays */) {
            // protect complex values from funf flattening
            value = JSON.stringify(value);
        }
        if (DEBUG) { console.log('FUNF '+name+' / '+value); }
        try {
            // send custom event; there's a Firefox add-on which will
            // turn this into an Android Intent:
            //     https://github.com/cscott/intent-addon
            var event = document.createEvent('CustomEvent');
            var o = { name: name, value: value, millis: Date.now() };
            var intent = {
                action: FUNF_ACTION_RECORD,
                method: 'sendBroadcast',
                extras: {
                    DATABASE_NAME: FUNF_DATABASE_NAME,
                    TIMESTAMP: Math.floor(Date.now()/1000),
                    NAME: this.appName,
                    VALUE: JSON.stringify(o)
                }
	    };
            event.initCustomEvent("intent-addon", true, true, intent);
	    document.documentElement.dispatchEvent(event);
        } catch(e) {
            console.log("Sending custom event failed: "+e);
        }
    };
    Funf.prototype.archive = function() {
        try {
            var event = document.createEvent('CustomEvent');
            var intent = {
                action: FUNF_ACTION_ARCHIVE,
                method: 'sendBroadcast',
                extras: {
                    DATABASE_NAME: FUNF_DATABASE_NAME
                }
	    };
            event.initCustomEvent("intent-addon", true, true, intent);
	    document.documentElement.dispatchEvent(event);
        } catch(e) {
            console.log("Sending custom event failed: "+e);
        }
    };
    return Funf;
});
