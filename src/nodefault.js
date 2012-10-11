/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, window:false */
define([], function() {

    /** Simple utility function to ensure that preventDefault() is called
     *  in an event handler. */

    var noDefault = function(f) {
        return function(event) {
            event.preventDefault(); /* don't change history on click */
            return f ? f.apply(this, arguments) /* pass along args */ : false;
        };
    };

    return noDefault;
});
