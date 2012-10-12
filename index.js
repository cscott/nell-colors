/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, window:false */
define(['domReady!', './src/coords', './src/dom', './lib/hammer', './src/nodefault'], function(document, Coords, Dom, Hammer, noDefault) {
    'use strict';
    Dom.insertMeta(document);
    if (document.body.classList.contains('dev')) {
        // show appcache debugging information.
        document.body.classList.add('appcache-allinfo');
    }
    var toolbar = document.getElementById('toolbar');
    var toolbarMode = 'no-mode';
    var updateSwatchOpacity, updateBrushColor, sendToolbarEvent;
    var _makeSetter = function(param, func) {
        return function(newValue) {
            if (this[param] === newValue) { return; }
            this[param] = newValue;
            func.call(this, newValue);
        };
    };
    var _classSet = function(elem, className, isPresent) {
        if (isPresent) {
            elem.classList.add(className);
        } else {
            elem.classList.remove(className);
        }
    };
    var dragShadow = {
        shown: false,
        dragging: false,
        captureEvents: true,
        targetDropping: false,
        x: 0,
        y: 0,
        elem: document.createElement('div'),
        hammer: null,
        uuid: null,
        setVisible: _makeSetter('shown', function(isVisible) {
            _classSet(this.elem, 'visible', isVisible);
        }),
        setCapture: _makeSetter('captureEvents', function(captureEvents) {
            this.elem.style.pointerEvents = captureEvents ? null : 'none';
        }),
        setDragging: _makeSetter('isDragging', function(isDragging) {
            _classSet(this.elem, 'dragging', isDragging);
        }),
        setThumb: _makeSetter('thumb', function(newThumb) {
            this.elem.style.backgroundImage = newThumb ?
                ("url('"+newThumb+"')") : null;
        }),
        setTargetDropping: _makeSetter('targetDropping', function(isDropping) {
            _classSet(this.target.elem, 'dropping', isDropping);
        }),
        updateTarget: function() {
            var target = document.querySelector('.icon.trash');
            var tl = Coords.getAbsolutePosition(target);
            this.target = {
                elem: target,
                x: tl.x, y: tl.y,
                width: target.offsetWidth,
                height: target.offsetHeight
            };

            var wrapper = document.getElementById('wrapper');
            var offset = Coords.getAbsolutePosition(wrapper);
            this.source = {
                x: offset.x, y: offset.y,
                width: this.elem.offsetWidth,
                height: this.elem.offsetHeight
            };
        },
        move: function(x, y) {
            var t = Math.round(x)+'px,'+Math.round(y)+'px';
            this.elem.style.WebkitTransform = 'translate3d('+t+',0)';
            this.elem.style.MozTransform = this.elem.style.transform =
                'translate('+t+')';
            // figure out if the dragShadow overlaps trash can
            // (this.min.x < other.max.x && this.max.x > other.min.x) etc
            var overlaps =
                ((this.source.x+x < this.target.x+this.target.width) &&
                 (this.source.y+y < this.target.y+this.target.height) &&
                 (this.source.x+x+this.source.width > this.target.x) &&
                 (this.source.y+y+this.source.height > this.target.y));
            this.setTargetDropping(overlaps);
        },
        drop: function() {
            var onTarget = this.targetDropping;
            this.setVisible(false);
            this.setTargetDropping(false);
            this.setDragging(false);
            if (onTarget) {
                sendToolbarEvent({ type:'trashDrop', uuid: this.uuid });
            }
        }
    };

    var appIframe = document.createElement('iframe');
    var toolbarPort = null;
    sendToolbarEvent = function(msg) {
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
        case 'drag-shadow':
            if (dragShadow.isDragging && !msg.show) {
                // active drag moved off underlying element; ignore
                break;
            }
            dragShadow.updateTarget();
            dragShadow.uuid = msg.uuid;
            dragShadow.x = msg.x; dragShadow.y = msg.y;
            dragShadow.move(dragShadow.x, dragShadow.y);
            dragShadow.setDragging(!!msg.dragging);
            dragShadow.setCapture(!!msg.captureEvents);
            dragShadow.setThumb(msg.thumb || null);
            dragShadow.setVisible(!!msg.show);
            break;
        case 'drag-shadow-move':
            dragShadow.move(dragShadow.x + msg.x, dragShadow.y + msg.y);
            break;
        case 'drag-shadow-drop':
            dragShadow.drop();
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

    // add drag shadow
    appWrapper.appendChild(dragShadow.elem);
    dragShadow.elem.id = 'dragshadow';
    dragShadow.hammer = new Hammer(dragShadow.elem, {
        prevent_default: true,
        transform: false,
        tap_double: false
    });
    dragShadow.hammer.ondragstart = function(event) {
        dragShadow.setDragging(true);
    };
    dragShadow.hammer.ondrag = function(event) {
        dragShadow.move(dragShadow.x + event.distanceX,
                        dragShadow.y + event.distanceY);
    };
    dragShadow.hammer.ondragend = function(event) {
        dragShadow.drop();
    };

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

    // add gallery icons
    var trash = addButton('trash', 'right', 'gallery');
    trash.setAttribute('dropzone', 'move string:text/x-nell-colors');
    trash.addEventListener('dragenter', function(event) {
        var i; // look through the various items available to drop.
        for (i=0; i<event.dataTransfer.items.length; i++) {
            var item = event.dataTransfer.items[i];
            if (item.type === 'text/x-nell-colors') {
                event.preventDefault(); // allow this drop
                trash.classList.add('dropping');
                return;
            }
        }
    }, false);
    trash.addEventListener('dragover', noDefault(function(event) {
        event.dataTransfer.dropEffect = 'move';
    }), false);
    trash.addEventListener('dragleave', noDefault(function(event) {
        trash.classList.remove('dropping');
    }), false);
    trash.addEventListener('drop', function(event) {
        var i;
        trash.classList.remove('dropping');
        for (i=0; i<event.dataTransfer.items.length; i++) {
            var item = event.dataTransfer.items[i];
            if (item.type === 'text/x-nell-colors') {
                item.getAsString(function(uuid) {
                    sendToolbarEvent({ type:'trashDrop', uuid: uuid });
                });
                return;
            }
        }
    }, false);

});
