/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, MessageChannel:false, window:false,
         setTimeout:false, clearTimeout:false */
define(['domReady!', './src/brush', './src/color', './src/compat', './src/dom', './src/drawcommand', './src/layer', './hammer', './src/postmessage', './raf', './src/recog', 'font!google,families:[Delius]'], function(document, Brush, Color, Compat, Dom, DrawCommand, Layer, Hammer, postMessage, requestAnimationFrame, Recog) {
    'use strict';
    // Android browser doesn't support MessageChannel
    // -- however, it also has a losing canvas. so don't worry too much.
    var USE_MESSAGECHANNEL = (typeof(MessageChannel) !== 'undefined');
    var toolbarPort = null;

    // How long to allow between strokes of a letter
    var RECOG_TIMEOUT = 750;

    // get 2d context for canvas.
    Dom.insertMeta(document);
    var layer = new Layer();
    document.body.appendChild(layer.domElement);
    var hammer = new Hammer(layer.domElement, {
        prevent_default: true,
        drag_min_distance: 2
    });

    var commands = [], redoList = [];
    commands.last = 0; // exclusive
    commands.isPlaying = false;
    // hack in a brush change and color change
    var brush = new Brush(Color.BLACK, Brush.Type.SOFT, 20, 0.7, 0.2);
    commands.push(DrawCommand.create_color_change(brush.color));
    commands.push(DrawCommand.create_brush_change(brush.type, brush.size,
                                                  brush.opacity,brush.spacing));
    commands.recog = commands.length; // where to start looking for a letter

    var recog_timer_id = null;
    // cancel any running recog timer (ie, if stroke in progress)
    var recog_timer_cancel = function() {
        if (recog_timer_id) {
            clearTimeout(recog_timer_id);
            recog_timer_id = null;
        }
    };
    // ignore all strokes to date; start recognition with next stroke.
    var recog_reset = function() {
        commands.recog = commands.length;
        recog_timer_cancel();
    };
    // timeout function to call recog_reset automatically after a delay
    var recog_timer = function() {
        recog_timer_id = null;
        recog_reset();
    };
    // manually start/reset the recog_timer (ie, stroke ended)
    var recog_timer_reset = function() {
        if (recog_timer_id) {
            clearTimeout(recog_timer_id);
        }
        recog_timer_id = setTimeout(recog_timer, RECOG_TIMEOUT);
    };

    var animRequested = false;
    var refresh = function() {
        while (commands.last < commands.length) {
            layer.execCommand(commands[commands.last++]);
        }
        animRequested = false;
    };
    var maybeHaltPlayback = function() {
        if (!commands.isPlaying) { return; }
        animRequested = false;
        commands.isPlaying = false;
        toolbarPort.postMessage(JSON.stringify({type:'stopped'}));
        commands.last = commands.playback.pos;
        refresh();
        recog_reset();
    };
    var playback = function() {
        if (!commands.isPlaying) { return; }

        // play some frames.
        var curtime = Date.now();
        var timeIncrement = curtime - commands.playback.time;
        while (commands.playback.pos < commands.length && timeIncrement > 0) {
            layer.execCommand(commands[commands.playback.pos++]);
            if (commands.playback.pos < commands.length) {
                var c1 = commands[commands.playback.pos-1];
                var c2 = commands[commands.playback.pos];
                if (c1.type===DrawCommand.Type.DRAW &&
                    c2.type===DrawCommand.Type.DRAW) {
                    timeIncrement -=
                        (c2.time - c1.time) / commands.playback.speed;
                }
            }
        }
        commands.playback.time = curtime;

        // are we done, or do we need to schedule another animation frame?
        if (commands.playback.pos < commands.length) {
            requestAnimationFrame(playback);
        } else {
            animRequested = false;
            commands.isPlaying = false;
            toolbarPort.postMessage(JSON.stringify({type:'stopped'}));
        }
    };
    var maybeRequestAnim = function() {
        if (!animRequested) {
            animRequested = true;
            requestAnimationFrame(commands.isPlaying ? playback : refresh);
        }
    };

    var isDragging = false;
    hammer.ondrag = function(ev) {
        maybeHaltPlayback();
        isDragging = true;
        commands.push(DrawCommand.create_draw(ev.position));
        redoList.length = 0;
        maybeRequestAnim();
        // stroke in progress, don't try to recognize
        recog_timer_cancel();
    };
    hammer.ondragend = function(ev) {
        isDragging = false;
        commands.push(DrawCommand.create_draw_end());
        redoList.length = 0;
        maybeRequestAnim();
        if (ev) {
            //console.log("Attempt recog from", commands.recog,
            //            "to", commands.length);
            Recog.attemptRecognition(commands, commands.recog,
                                     commands.length);
        }
        // start recog reset timer
        recog_timer_reset();
    };

    var lastRecogCanvas = null;
    var removeRecogCanvas = function() {
        if (lastRecogCanvas) {
            layer.domElement.removeChild(lastRecogCanvas);
            lastRecogCanvas = null;
        }
    };
    var handleRecog = function(model, prob, bbox) {
        if (prob < 400) { removeRecogCanvas(); return; }
        var r = window.devicePixelRatio || 1;
        var w = bbox.br.x - bbox.tl.x, h = bbox.br.y - bbox.tl.y;
        // offset by current brush width (this is a bit hackity)
        w += brush.size; h += brush.size;
        var c = document.createElement('canvas');
        c.style.border="1px dashed #ccc";
        c.style.position='absolute';
        c.style.top = (bbox.tl.y-(brush.size/2))+'px';
        c.style.left = (bbox.tl.x-(brush.size/2))+'px';
        c.style.width = w+'px';
        c.style.height = h+'px';
        c.style.opacity = 0.25;
        c.width = w*r;
        c.height = h*r;
        var ctxt = c.getContext('2d');
        // Patrick+Hand is a good alternative to Delius
        ctxt.font = (c.height*1.2)+"px Delius"; // 1.2 is fudge factor
        ctxt.textAlign = "center";
        ctxt.textBaseline = "middle";
        ctxt.fillStyle = brush.color.to_string().replace(/..$/,'');
        ctxt.translate(c.width/2, c.height/2);
        // measure the expected width
        var metrics = ctxt.measureText(model.charAt(0));
        if (metrics.width < c.width) {
            ctxt.scale(c.width/metrics.width, 1); // scale up to fit
        }
        ctxt.fillText(model.charAt(0), 0, 0, c.width);
        removeRecogCanvas();
        lastRecogCanvas = c;
        layer.domElement.appendChild(lastRecogCanvas);
        //console.log(model);
    };
    Recog.registerCallback(handleRecog);

    var updateToolbarBrush = function() {
        var msg = {
            type: 'brush',
            color: brush.color.to_string(),
            brush_type:  brush.type,
            size:  brush.size,
            opacity: brush.opacity,
            spacing: brush.spacing
        };
        toolbarPort.postMessage(JSON.stringify(msg));
    };

    var undo = function() {
        console.assert(!isDragging);
        if (commands.length===0) { return; /* nothing to undo */ }
        var i = commands.length-1;
        while (i >= 0 && commands[i].type !== DrawCommand.Type.DRAW_END) {
            i--;
        }
        if (i<0) { return; /* nothing but color changes to undo */ }
        i--;
        while (i >= 0 && commands[i].type === DrawCommand.Type.DRAW) {
            i--;
        }
        i++;
        // i should now point to the first DRAW command.
        redoList.push(commands.slice(i));
        commands.length = i;
        // now redraw w/o those commands.
        layer.clear();
        commands.last = 0;
        refresh();
        // reset current brush from layer
        brush = layer.currentBrush();
        // update the toolbar opacity/size to match
        updateToolbarBrush();
        // stop recognition and cancel timer
        recog_reset();
    };
    var redo = function() {
        if (redoList.length===0) { return; /* nothing to redo */ }
        redoList.pop().forEach(function(cmd) {
            commands.push(cmd);
        });
        refresh();
        // reset current brush from layer
        brush = layer.currentBrush();
        // update the toolbar opacity/size to match
        updateToolbarBrush();
        // don't repeat recognition (and cancel timer)
        recog_reset();
    };

    var onWindowResize = function(event) {
        var w = window.innerWidth, h = window.innerHeight;
        var r = window.devicePixelRatio || 1;
        //console.log("Resizing canvas", w, h, r);
        layer.resize(w, h, r);
        // replay existing commands to restore canvas contents.
        if (commands.isPlaying) {
            commands.playback.pos = 0;
        } else {
            commands.last = 0;
            refresh();
        }
    };
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();

    document.getElementById("loading").style.display="none";
    /*
    document.getElementById("loading").innerHTML = "Resized "+window.innerWidth+"x"+window.innerHeight+" "+window.devicePixelRatio;
    */

    // create a channel to listen to toolbar messages.
    var handleToolbarMessage = function(evt) {
        if (isDragging) { hammer.ondragend(); }
        var msg = JSON.parse(evt.data);
        if (msg.type !== 'playButton') { maybeHaltPlayback(); }
        switch(msg.type) {
        case 'swatchButton':
            var color = Color.from_string(msg.color);
            if (Color.equal(brush.color, color)) { break; }
            brush.color = color;
            commands.push(DrawCommand.create_color_change(brush.color));
            break;
        case 'undoButton':
            removeRecogCanvas();
            undo();
            break;
        case 'redoButton':
            removeRecogCanvas();
            redo();
            break;
        case 'hardButton':
            if (brush.type === Brush.Type.HARD) { break; }
            brush.type = Brush.Type.HARD;
            commands.push(DrawCommand.create_brush_change(
                brush.type, brush.size, brush.opacity,brush.spacing));
            break;
        case 'softButton':
            if (brush.type === Brush.Type.SOFT) { break; }
            brush.type = Brush.Type.SOFT;
            commands.push(DrawCommand.create_brush_change(
                brush.type, brush.size, brush.opacity,brush.spacing));
            break;
        case 'opacitySlider':
            if (brush.opacity === +msg.value) { break; }
            brush.opacity = +msg.value;
            commands.push(DrawCommand.create_brush_change(
                brush.type, brush.size, brush.opacity,brush.spacing));
            break;
        case 'sizeSlider':
            if (brush.size === +msg.value) { break; }
            brush.size = +msg.value;
            commands.push(DrawCommand.create_brush_change(
                brush.type, brush.size, brush.opacity,brush.spacing));
            break;
        case 'playButton':
            if (commands.isPlaying) {
                commands.playback.speed *= 4;
                break;
            }
            commands.isPlaying = true;
            commands.playback = { pos:0, time:Date.now(), speed:4 };
            layer.clear();
            removeRecogCanvas();
            maybeRequestAnim();
            toolbarPort.postMessage(JSON.stringify({type:'playing'}));
            break;
        default:
            console.warn("Unexpected child toolbar message", evt);
            break;
        }
    };

    // listen to other messages from our parent
    var handleMessage = function(evt) {
        var msg = evt.data;
        if (typeof(msg)==='string') { msg = JSON.parse(msg); }
        switch (msg.type) {
        case 'toolbar':
            // synthetic MessageChannel
            return toolbarPort.dispatchEvent({data:msg.msg});
        default:
            console.warn("Unexpected child message", evt);
            break;
        }
    };
    window.addEventListener('message', handleMessage, false);

    // Notify our parent that we're ready to rock!
    var msg = { type: 'childReady' };
    if (USE_MESSAGECHANNEL) {
        var toolbarChannel = new MessageChannel();
        toolbarPort = toolbarChannel.port1;
        toolbarPort.addEventListener('message', handleToolbarMessage,
                                     false);
        toolbarPort.start();
        postMessage(window.parent, JSON.stringify(msg), '*',
                    [toolbarChannel.port2]);
    } else {
        toolbarPort = {
            dispatchEvent: function(evt) {
                handleToolbarMessage(evt);
            },
            postMessage: function(msg) {
                var m = { type: 'toolbar', msg: msg };
                postMessage(window.parent, JSON.stringify(m), '*');
            }
        };
        postMessage(window.parent, JSON.stringify(msg), '*');
    }
    // finally, update the toolbar opacity/size to match
    updateToolbarBrush();
});
