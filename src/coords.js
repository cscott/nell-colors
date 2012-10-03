/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false, document:false, window:false */
define([], function() {
    'use strict';
    /** Utility functions to find absolute and relative coordinates for
     *  DOM elements and mouse/touch events.
     */

// return the absolute position of the given element on the page.
var getAbsolutePosition = function(element) {
     if (element.getBoundingClientRect) {
      // roughly, ".offset()" from zepto.js
      var obj = element.getBoundingClientRect();
      return {
        x: obj.left + document.body.scrollLeft,
        y: obj.top + document.body.scrollTop,
      };
     }
     // this technique is more error-prone: CSS transforms, etc, may cause
     // it to return incorrect results.
     var r = { x: element.offsetLeft, y: element.offsetTop };
     if (element.offsetParent) {
       var tmp = getAbsolutePosition(element.offsetParent);
       r.x += tmp.x;
       r.y += tmp.y;
     }
     return r;
};

/**
 * Retrieve the coordinates of the given event relative to a given widget.
 *
 * @param event
 *   A mouse- or touch-related DOM event.
 * @param reference
 *   A DOM element whose position we want to transform the mouse coordinates to.
 * @return
 *    A hash containing keys 'x' and 'y'.
 */
var getRelativeEventPosition = function(event, reference) {
     var x, y, pos;
     event = event || window.event;
     var el = event.target || event.srcElement;

     if (!window.opera && typeof event.offsetX !== 'undefined') {
       // Use offset coordinates and find common offsetParent
       pos = { x: event.offsetX, y: event.offsetY };

       // Send the coordinates upwards through the offsetParent chain.
       var e = el;
       while (e) {
         e.mouseX = pos.x;
         e.mouseY = pos.y;
         pos.x += e.offsetLeft;
         pos.y += e.offsetTop;
         e = e.offsetParent;
       }

       // Look for the coordinates starting from the reference element.
       e = reference;
       var offset = { x: 0, y: 0 };
       while (e) {
         if (typeof e.mouseX !== 'undefined') {
           x = e.mouseX - offset.x;
           y = e.mouseY - offset.y;
           break;
         }
         offset.x += e.offsetLeft;
         offset.y += e.offsetTop;
         e = e.offsetParent;
       }

       // Reset stored coordinates
       e = el;
       while (e) {
         e.mouseX = undefined;
         e.mouseY = undefined;
         e = e.offsetParent;
       }
     } else {
       // Use absolute coordinates
       pos = getAbsolutePosition(reference);
       x = event.pageX  - pos.x;
       y = event.pageY - pos.y;
     }
     return { x: x, y: y };
};

    return {
        getRelativeEventPosition: getRelativeEventPosition,
        getAbsolutePosition: getAbsolutePosition
    };
});
