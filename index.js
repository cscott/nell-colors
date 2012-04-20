/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./src/dom', './hammer'], function(Dom, Hammer) {
    Dom.insertMeta(document);

    // allow dragging the toolbar left and right
    var toolbar = document.getElementById('toolbar');
    var toolbar_buttons = document.getElementById('toolbar_buttons');
    var hammer = new Hammer(toolbar, {
        prevent_default: true,
        drag_vertical: false,
        transform: false
    });
    var toolbar_offset = 0, toolbar_offset_start = 0;
    hammer.ondragstart = function(ev) {
        toolbar_offset_start = toolbar_offset;
    };
    hammer.ondrag = function(ev) {
        toolbar_offset = Math.min(0, toolbar_offset_start + ev.distanceX);
        toolbar_buttons.style.left = toolbar_offset+"px";
    };

    //console.log("in index.js");
});
