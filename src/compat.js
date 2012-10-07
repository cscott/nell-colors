/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global
  define:true, console:false, require:false, module:false, window:false,
  Float64Array:false, Uint16Array:false,
  self:false, document:false, DomException:false
 */

// Compatibility thunks.  Hackity hackity.
define([], function() {
    // Because Safari 5.1 doesn't have Function.bind (sigh)
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP ? this :
                                     (oThis || window),
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
    // Android's embedded webkit doesn't have Object.freeze
    if (!Object.freeze) {
        Object.freeze = function(o) { return o; };
    }
    // Android non-Chrome doesn't have Web Workers
    var FakeWorker = function() {
        console.warn("Faking Web Worker creation.");
    };
    FakeWorker.prototype = {
        postMessage: function(msg) { },
        addEventListener: function(msg, func) { }
    };

    var Compat = {
        // Android non-Chrome browser doesn't have Web Workers
        Worker: typeof(Worker)==='undefined' ? FakeWorker : Worker,
        // Android Honeycomb doesn't have Uint8Array
        Uint8Array: typeof(Uint8Array)==='undefined' ? Array : Uint8Array,
        // iOS 5 doesn't have Float64Array
        Float64Array: typeof(Float64Array)==='undefined' ? Array : Float64Array
    };

    // robust poly fill for window.requestAnimationFrame
    if (typeof window !== 'undefined') {
        (function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            var x;
            for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame =
                    window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                console.log("Using requestAnimationFrame fallback.");
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                               timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
            }

            Compat.requestAnimationFrame =
                window.requestAnimationFrame.bind(window);
            Compat.cancelAnimationFrame =
                window.cancelAnimationFrame.bind(window);
        })();
    }

    // polyfill for classList
    /*
     * classList.js: Cross-browser full element.classList implementation.
     * 2011-06-15
     *
     * By Eli Grey, http://eligrey.com
     * Public Domain.
     * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     */

    /*global self, document, DOMException */

    /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

    if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {

        (function (view) {

            "use strict";

            if (!('HTMLElement' in view) && !('Element' in view)) return;

            var
	    classListProp = "classList"
	    , protoProp = "prototype"
	    , elemCtrProto = (view.HTMLElement || view.Element)[protoProp]
	    , objCtr = Object
	    , strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	    }
	    , arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
		i = 0
		, len = this.length
		;
		for (; i < len; i++) {
		    if (i in this && this[i] === item) {
			return i;
		    }
		}
		return -1;
	    }
	    // Vendors: please allow content code to instantiate DOMExceptions
	    , DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	    }
	    , checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
		    throw new DOMEx(
			"SYNTAX_ERR"
			, "An invalid or illegal string was specified"
		    );
		}
		if (/\s/.test(token)) {
		    throw new DOMEx(
			"INVALID_CHARACTER_ERR"
			, "String contains an invalid character"
		    );
		}
		return arrIndexOf.call(classList, token);
	    }
	    , ClassList = function (elem) {
		var
		trimmedClasses = strTrim.call(elem.className)
		, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
		, i = 0
		, len = classes.length
		;
		for (; i < len; i++) {
		    this.push(classes[i]);
		}
		this._updateClassName = function () {
		    elem.className = this.toString();
		};
	    }
	    , classListProto = ClassList[protoProp] = []
	    , classListGetter = function () {
		return new ClassList(this);
	    }
            ;
            // Most DOMException implementations don't allow calling DOMException's toString()
            // on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function (i) {
	        return this[i] || null;
            };
            classListProto.contains = function (token) {
	        token += "";
	        return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function (token) {
	        token += "";
	        if (checkTokenAndGetIndex(this, token) === -1) {
		    this.push(token);
		    this._updateClassName();
	        }
            };
            classListProto.remove = function (token) {
	        token += "";
	        var index = checkTokenAndGetIndex(this, token);
	        if (index !== -1) {
		    this.splice(index, 1);
		    this._updateClassName();
	        }
            };
            classListProto.toggle = function (token) {
	        token += "";
	        if (checkTokenAndGetIndex(this, token) === -1) {
		    this.add(token);
	        } else {
		    this.remove(token);
	        }
            };
            classListProto.toString = function () {
	        return this.join(" ");
            };

            if (objCtr.defineProperty) {
	        var classListPropDesc = {
		    get: classListGetter
		    , enumerable: true
		    , configurable: true
	        };
	        try {
		    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	        } catch (ex) { // IE 8 doesn't support enumerable:true
		    if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		    }
	        }
            } else if (objCtr[protoProp].__defineGetter__) {
	        elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }

        }(self));

    }

    return Compat;
});
