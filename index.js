/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, window:false, MessageChannel:false */
define(['domReady!', './src/dom', './hammer'], function(document, Dom, Hammer) {
    Dom.insertMeta(document);

    var appIframe = document.createElement('iframe');
    var toolbarPort = null;
    var sendToolbarEvent = function(msg) {
        if (!toolbarPort) { return; /* not loaded yet */ }
        toolbarPort.postMessage(JSON.stringify(msg));
    };

    // set up toolbar channel and message handler.
    // (do this before loading the child, to ensure childReady isn't lost)
    var handleMessage = function(evt) {
        var msg = evt.data;
        if (typeof(msg)==='string') { msg = JSON.parse(msg); }

        switch (msg.type) {
        case 'childReady':
            console.assert(evt.source===appIframe.contentWindow);
            //console.log("Got toolbar port");
            toolbarPort = evt.ports[0];
            toolbarPort.start();
            break;
        default:
            console.warn("Unexpected message", evt);
            break;
        }
    };
    window.addEventListener('message', handleMessage, false);

    // child window.
    var appWrapper = document.getElementById('wrapper');
    var loading = document.getElementById('loading');
    appWrapper.removeChild(loading);
    appIframe.appendChild(loading);
    appIframe.id = 'inner';
    appIframe.scrolling = 'no';
    appIframe.src='ncolors.html';
    appWrapper.appendChild(appIframe);

    // add toolbar buttons.
    var toolbarButtons = document.getElementById('toolbarButtons');

    var addButton = function(className) {
        var span = document.createElement('span');
        span.className = 'icon '+className;
        toolbarButtons.appendChild(span);
        // use Hammer instead of 'click' handler for good response time
        // (see http://code.google.com/mobile/articles/fast_buttons.html )
        var h = new Hammer(span, { prevent_default: true,
                                   drag: false, transform: false });
        h.ontap = function() {
            sendToolbarEvent({ type: className+'Button' });
        };
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
        toolbarButtons.appendChild(span);
        return span;
    };
    var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo',
                  'violet', 'white', 'black'];
    var color_buttons = colors.map(function(c) { return addSwatch(c); });
    color_buttons.forEach(function(cb, i) {
        var colorName = colors[i];
        var h = new Hammer(cb, { prevent_default: true,
                                 drag: false, transform: false });
        h.ontap = function() {
            sendToolbarEvent({ type:'swatchButton', color: colorName });
        };
    });

    var addRange = function(id, min, max, value, step) {
        var input = document.createElement('input');
        input.type = 'range';
        input.id = id;
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        toolbarButtons.appendChild(input);

        input.addEventListener('change', function() {
            sendToolbarEvent({ type: id+'Slider', value: input.value });
        }, false);

        return input;
    };
    var size = addRange('size', 1, 40, 20, 1);
    var opacity = addRange('opacity', 0, 1, 0.7, 'any');
    var updateSwatchOpacity = function() {
        var swatches = document.querySelectorAll('.swatch > span');
        // swatches is a NodeList, not an Array, so we can't use forEach
        // directly (sigh)
        Array.prototype.forEach.call(swatches, function(s) {
            s.style.opacity = opacity.value;
        });
    };
    opacity.addEventListener('change', updateSwatchOpacity, false);
    updateSwatchOpacity();

    // allow dragging the toolbar left and right
    var toolbar = document.getElementById('toolbar');
    if (false) { // temporarily disable
    var hammer = new Hammer(toolbar, {
        prevent_default: false,
        drag_vertical: false,
        transform: false
    });
    var toolbarOffset = 0, toolbarOffsetStart = 0;
    hammer.ondragstart = function(ev) {
        toolbarOffsetStart = toolbarOffset;
    };
    hammer.ondrag = function(ev) {
        toolbarOffset = Math.min(0, toolbarOffsetStart + ev.distanceX);
        toolbarButtons.style.left = toolbarOffset+"px";
    };
    }

    //console.log("in index.js");
    //console.log(MessageChannel);
});
