/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, window:false */
define(['domReady!', './src/dom', './lib/hammer'], function(document, Dom, Hammer) {
    'use strict';
    Dom.insertMeta(document);
    if (document.body.classList.contains('dev')) {
        // show appcache debugging information.
        document.body.classList.add('appcache-allinfo');
    }
    var toolbar = document.getElementById('toolbar');
    var toolbarMode = 'no-mode';
    var updateSwatchOpacity, updateBrushColor;

    var appIframe = document.createElement('iframe');
    var toolbarPort = null;
    var sendToolbarEvent = function(msg) {
        if (!toolbarPort) { return; /* not loaded yet */ }
        toolbarPort.postMessage(JSON.stringify(msg));
    };

    // set up toolbar channel and message handler.
    // (do this before loading the child, to ensure childReady isn't lost)
    var size, opacity;
    var handleToolbarResponse = function(evt) {
        var msg = evt.data;
        if (typeof(msg)==='string') { msg = JSON.parse(msg); }

        switch (msg.type) {
        case 'toolbar-mode-switch':
            // gallery toolbar, drawing toolbar, etc.
            toolbar.classList.remove(toolbarMode);
            toolbarMode = msg.mode;
            toolbar.classList.add(toolbarMode);
            break;
        case 'color':
            // update color of swatch in toolbar
            var opacity = Math.max(0.3, msg.opacity); // always show some color
            updateSwatchOpacity(opacity);
            updateBrushColor('rgba('+msg.red+','+msg.green+','+
                             msg.blue+','+opacity+')');
            break;
        case 'brush':
            /* ignore for now, no buttons reflect brush state */
            break;
        case 'playing':
            toolbar.querySelector('.play').classList.add('playing');
            break;
        case 'stopped':
            toolbar.querySelector('.play').classList.remove('playing');
            break;
        default:
            console.warn("Unexpected parent toolbar message", evt);
        }
    };

    var handleMessage = function(evt) {
        var msg = evt.data;
        if (typeof(msg)==='string') { msg = JSON.parse(msg); }

        switch (msg.type) {
        case 'toolbar':
            // synthetic MessageChannel
            return toolbarPort.dispatchEvent({data:msg.msg});

        case 'hashchange':
            // update hash in location bar; will trigger onHashChange()
            if (msg.replace && window.history.replaceState) {
                window.history.replaceState(null, msg.title, msg.hash||'#');
            } else {
                window.location.hash = msg.hash;
            }
            break;
        case 'childReady':
            console.assert(evt.source===appIframe.contentWindow);
            document.body.classList.remove('splash');
            //console.log("Got toolbar port", evt);
            if (evt.ports && evt.ports.length>0) {
                // use real MessageChannel
                toolbarPort = evt.ports[0];
                toolbarPort.addEventListener('message', handleToolbarResponse,
                                             false);
                toolbarPort.start();
            } else {
                // synthetic MessageChannel
                console.log("Using emulated MessageChannel");
                toolbarPort = {
                    dispatchEvent: function(evt) {
                        handleToolbarResponse(evt);
                    },
                    postMessage: function(msg) {
                        var m = { type: 'toolbar', msg: msg };
                        evt.source.postMessage(JSON.stringify(m), evt.origin);
                    }
                };
            }
            break;
        default:
            console.warn("Unexpected parent message", evt);
            break;
        }
    };
    window.addEventListener('message', handleMessage, false);

    var onHashChange = function() {
        // change hash in child window to match parent hash
        appIframe.contentWindow.location.hash = document.location.hash;
    };
    window.addEventListener('hashchange', onHashChange, false);

    // child window.
    var appWrapper = document.getElementById('wrapper');
    appIframe.id = 'inner';
    appIframe.scrolling = 'no';
    appIframe.src='ncolors.html'+document.location.hash;
    appWrapper.appendChild(appIframe);

    // add toolbar buttons.
    var toolbarButtons = document.getElementById('toolbarButtons');

    var addButton = function(className, group, mode) {
        var parent;
        var span = document.createElement('span');
        span.classList.add('icon');
        span.classList.add(className);
        if (typeof(mode)==='string') { mode = [ mode ]; }
        mode.forEach(function(m) { span.classList.add('mode-'+m); });
        if (group) {
            parent = toolbarButtons.querySelector('.group.'+group);
            if (!parent) {
                parent = document.createElement('span');
                parent.classList.add('group');
                parent.classList.add(group);
                toolbarButtons.appendChild(parent);
            }
        } else {
            parent = toolbarButtons;
        }
        parent.appendChild(span);
        // use Hammer instead of 'click' handler for good response time
        // (see http://code.google.com/mobile/articles/fast_buttons.html )
        var h = new Hammer(span, { prevent_default: true,
                                   drag: false, transform: false });
        h.ontap = function() {
            sendToolbarEvent({ type: className+'Button' });
        };
        return span;
    };
    var undo = addButton('undo', 'left', 'drawing');
    var redo = addButton('redo', 'left', 'drawing');
    var play = addButton('play', 'left', 'drawing');

    var color = addButton('color', 'center', ['drawing','brushdialog']);
    var brush = addButton('brush', 'center', ['drawing','brushdialog']);

    var addSwatch = function(colorName) {
        var span = document.createElement('span');
        span.classList.add('swatch');
        span.classList.add(colorName);
        span.classList.add('mode-drawing');
        span.classList.add('mode-brushdialog');
        toolbarButtons.querySelector('.group.center').appendChild(span);
        return span;
    };
    var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo',
                  'violet', 'white', 'brown', 'black'];
    var color_buttons = colors.map(function(c) { return addSwatch(c); });
    color_buttons.forEach(function(cb, i) {
        var colorName = colors[i];
        var h = new Hammer(cb, { prevent_default: true,
                                 drag: false, transform: false });
        h.ontap = function() {
            sendToolbarEvent({ type:'swatchButton', color: colorName });
        };
    });

    updateSwatchOpacity = function(opacityValue) {
        // XXX this doesn't do anything at the moment, because we
        //     made the swatches opaque and removed the inner span.
        var swatches = document.querySelectorAll('.swatch > span');
        // swatches is a NodeList, not an Array, so we can't use forEach
        // directly (sigh)
        Array.prototype.forEach.call(swatches, function(s) {
            s.style.opacity = opacityValue;
        });
    };
    updateBrushColor = function(colorValue) {
        toolbarButtons.querySelector('.icon.color').style.color = colorValue;
    };

    var layer = addButton('layer', 'right', 'drawing');
    var save = addButton('save', 'right', 'drawing');
    layer.classList.add('dev-only');
    save.classList.add('dev-only');

    // allow dragging the toolbar left and right
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
});
