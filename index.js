/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, window:false */
define(['domReady!', './src/dom', './src/nodefault'], function(document, Dom, noDefault) {
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
    var size, opacity, setPlayClass;
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
            setPlayClass('playing');
            break;
        case 'stopping':
            setPlayClass('stopping');
            break;
        case 'stopped':
            setPlayClass('stopped');
            break;
        default:
            console.warn("Unexpected parent toolbar message", evt);
        }
    };
    setPlayClass = function(className) {
        var play = toolbar.querySelector('.play');
        ['playing','stopping','stopped'].forEach(function(cn) {
            if (className===cn) {
                play.classList.add(cn);
            } else {
                play.classList.remove(cn);
            }
        });
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
        var a = document.createElement('a');
        a.href='#';
        a.classList.add('icon');
        a.classList.add(className);
        if (typeof(mode)==='string') { mode = [ mode ]; }
        mode.forEach(function(m) { a.classList.add('mode-'+m); });
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
        parent.appendChild(a);
        // use standard 'click' event to get nice feedback on android
        // even if button response is fractionally slower.
        // use noDefault() so that we don't navigate to the href!
        a.addEventListener('click', noDefault(function(event) {
            sendToolbarEvent({ type: className+'Button' });
        }), false);
        // disable the context menu and other default handlers for href anchors
        ['dblclick','contextmenu'].forEach(function(evname) {
            a.addEventListener(evname, noDefault(), false);
        });
        return a;
    };
    var undo = addButton('undo', 'left', 'drawing');
    var redo = addButton('redo', 'left', 'drawing');
    var play = addButton('play', 'left', 'drawing');

    var color = addButton('color', 'center', ['drawing','brushdialog']);
    var brush = addButton('brush', 'center', ['drawing','brushdialog']);

    var addSwatch = function(colorName) {
        var a = document.createElement('a');
        a.href='#';
        a.classList.add('swatch');
        a.classList.add(colorName);
        a.classList.add('mode-drawing');
        a.classList.add('mode-brushdialog');
        toolbarButtons.querySelector('.group.center').appendChild(a);
        return a;
    };
    var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo',
                  'violet', 'white', 'brown', 'black'];
    var color_buttons = colors.map(function(c) { return addSwatch(c); });
    color_buttons.forEach(function(cb, i) {
        var colorName = colors[i];
        cb.addEventListener('click', noDefault(function(event) {
            sendToolbarEvent({ type:'swatchButton', color: colorName });
        }), false);
        cb.addEventListener('contextmenu', noDefault(), false);
        cb.addEventListener('dblclick', noDefault(), false);
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

});
