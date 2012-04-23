/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global
  define:true, console:false, require:false, module:false, window:false,
  Float64Array:false, Uint16Array:false
 */

// Compatibility thunks.  Hackity hackity.
define([], function() {
    // Because Safari 5.1 doesn't have Function.bind (sigh)
    // (xxx this is a lame implementation that only allows 1 arg to bind)
    if (typeof(Function.prototype.bind) === 'undefined') {
        Function.prototype.bind = function(context) {
            var oldRef = this;
            return function() {
                return oldRef.apply(context || null, Array.prototype.slice.call(arguments));
            };
        };
    }

    return {
        // Android Honeycomb doesn't have Uint8Array
        Uint8Array: typeof(Uint8Array)==='undefined' ? Array : Uint8Array,
        // iOS 5 doesn't have Float64Array
        Float64Array: typeof(Float64Array)==='undefined' ? Array : Float64Array,
    };
});
