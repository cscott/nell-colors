/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./src/dom', './hammer'], function(Dom, Hammer) {
    Dom.insertMeta(document);

    // add toolbar buttons.
    var toolbar_buttons = document.getElementById('toolbar_buttons');

    var addButton = function(className) {
        var span = document.createElement('span');
        span.className = 'icon '+className;
        toolbar_buttons.appendChild(span);
        return span;
    };
    var undo = addButton('undo');
    var redo = addButton('redo');
    var hard = addButton('hard');
    var soft = addButton('soft');

    var addSwatch = function(colorName) {
        var span = document.createElement('span');
        span.className = 'swatch '+colorName;
        var innerSpan = document.createElement('span');
        span.appendChild(innerSpan);
        toolbar_buttons.appendChild(span);
        return span;
    };
    var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo',
                  'violet', 'white', 'black'];
    var color_buttons = colors.map(function(c) { return addSwatch(c); });
    color_buttons.forEach(function(cb, i) {
        var colorName = colors[i];
        cb.addEventListener('click', function() {
            console.log(colorName, "button pressed");
        }, false);
    });

    var addRange = function(id, min, max, value, step) {
        var input = document.createElement('input');
        input.type = 'range';
        input.id = id;
        input.min = min;
        input.max = max;
        input.value = value;
        input.step = step;
        toolbar_buttons.appendChild(input);
        return input;
    };
    var size = addRange('size', 1, 40, 20, 1);
    var opacity = addRange('opacity', 0, 1, 1, 'any');

    // allow dragging the toolbar left and right
    var toolbar = document.getElementById('toolbar');
    var hammer = new Hammer(toolbar, {
        prevent_default: false,
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
