/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, MessageChannel:false, window:false,
         setTimeout:false, clearTimeout:false */
define(['domReady!', './src/brush', './src/color', './src/compat', './src/dom', './src/drawcommand', './src/drawing', './src/layer', './hammer', './src/postmessage', './raf', './src/recog', 'json!./lounge.json', 'font!google,families:[Delius]'], function(document, Brush, Color, Compat, Dom, DrawCommand, Drawing, Layer, Hammer, postMessage, requestAnimationFrame, Recog, input_drawing) {
    'use strict';
    // Android browser doesn't support MessageChannel
    // -- however, it also has a losing canvas. so don't worry too much.
    var USE_MESSAGECHANNEL = (typeof(MessageChannel) !== 'undefined');
    var toolbarPort = null;

    // How long to allow between strokes of a letter
    var RECOG_TIMEOUT = 750;

    // get 2d context for canvas.
    Dom.insertMeta(document);
    var drawingElem = document.getElementById('drawing');
    var drawing = new Drawing(drawingElem);
    var hammer = new Hammer(drawingElem, {
        prevent_default: true,
        drag_min_distance: 2
    });

    if (input_drawing) {
        // load a drawing
        drawing.loadJSON(input_drawing);
    }

    var maybeRequestAnim, removeRecogCanvas;

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
        drawing.commands.recog = drawing.commands.end;
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
        drawing.setCmdPos(Drawing.END); // draw to end
        animRequested = false;
    };
    var playbackInfo = { isPlaying: false, lastFrameTime: 0, speed: 4 };
    var maybeHaltPlayback = function() {
        if (!playbackInfo.isPlaying) { return; }
        animRequested = false;
        playbackInfo.isPlaying = false;
        toolbarPort.postMessage(JSON.stringify({type:'stopped'}));
        drawing.setCmdPos(Drawing.END); // skip to the end of playback
        recog_reset();
    };
    var startPlayback = function() {
        playbackInfo.lastFrameTime = Date.now();
        playbackInfo.speed = 4;
        playbackInfo.isPlaying = true;
        drawing.setCmdPos(0);
        removeRecogCanvas();
        maybeRequestAnim();
        toolbarPort.postMessage(JSON.stringify({type:'playing'}));
    };
    var playback = function() {
        if (!playbackInfo.isPlaying) { return; }

        // play some frames.
        var curtime = Date.now();
        var timeDelta = curtime - playbackInfo.lastFrameTime;
        var isMore = drawing.setCmdTime(timeDelta * playbackInfo.speed);
        playbackInfo.lastFrameTime = curtime;

        // are we done, or do we need to schedule another animation frame?
        if (isMore) {
            requestAnimationFrame(playback);
        } else {
            animRequested = false;
            playbackInfo.isPlaying = false;
            toolbarPort.postMessage(JSON.stringify({type:'stopped'}));
        }
    };
    maybeRequestAnim = function() {
        if (!animRequested) {
            animRequested = true;
            requestAnimationFrame(playbackInfo.isPlaying ? playback : refresh);
        }
    };

    var isDragging = false;
    hammer.ondrag = function(ev) {
        maybeHaltPlayback();
        if (!isDragging) {
            // XXX fill in current layer here
            drawing.addCmd(DrawCommand.create_draw_start(0));
        }
        isDragging = true;
        drawing.addCmd(DrawCommand.create_draw(ev.position));
        maybeRequestAnim();
        // stroke in progress, don't try to recognize
        recog_timer_cancel();
    };
    hammer.ondragend = function(ev) {
        isDragging = false;
        drawing.addCmd(DrawCommand.create_draw_end());
        maybeRequestAnim();
        if (ev) {
            //console.log("Attempt recog from", commands.recog,
            //            "to", commands.length);
            Recog.attemptRecognition(drawing.commands,
                                     drawing.commands.recog,
                                     drawing.commands.end);
        }
        // start recog reset timer
        recog_timer_reset();
    };

    var lastRecogCanvas = null;
    removeRecogCanvas = function() {
        if (lastRecogCanvas) {
            drawingElem.removeChild(lastRecogCanvas);
            lastRecogCanvas = null;
        }
    };
    var handleRecog = function(model, prob, bbox) {
        if (prob < 400) { removeRecogCanvas(); return; }
        var r = window.devicePixelRatio || 1;
        var w = bbox.br.x - bbox.tl.x, h = bbox.br.y - bbox.tl.y;
        // offset by current brush width (this is a bit hackity)
        w += drawing.brush.size; h += drawing.brush.size;
        var c = document.createElement('canvas');
        c.style.border="1px dashed #ccc";
        c.style.position='absolute';
        c.style.top = (bbox.tl.y-(drawing.brush.size/2))+'px';
        c.style.left = (bbox.tl.x-(drawing.brush.size/2))+'px';
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
        ctxt.fillStyle = drawing.brush.color.to_string().replace(/..$/,'');
        ctxt.translate(c.width/2, c.height/2);
        // measure the expected width
        var metrics = ctxt.measureText(model.charAt(0));
        if (metrics.width < c.width) {
            ctxt.scale(c.width/metrics.width, 1); // scale up to fit
        }
        ctxt.fillText(model.charAt(0), 0, 0, c.width);
        removeRecogCanvas();
        lastRecogCanvas = c;
        drawingElem.appendChild(lastRecogCanvas);
        //console.log(model);
    };
    Recog.registerCallback(handleRecog);

    var updateToolbarBrush = function() {
        var msg = {
            type: 'brush',
            color: drawing.brush.color.to_string(),
            brush_type:  drawing.brush.type,
            size:  drawing.brush.size,
            opacity: drawing.brush.opacity,
            spacing: drawing.brush.spacing
        };
        toolbarPort.postMessage(JSON.stringify(msg));
    };

    var doUndo = function() {
        console.assert(!isDragging);
        drawing.undo();
        // update the toolbar opacity/size to match
        updateToolbarBrush();
        // stop recognition and cancel timer
        recog_reset();
    };
    var doRedo = function() {
        console.assert(!isDragging);
        drawing.redo();
        // update the toolbar opacity/size to match
        updateToolbarBrush();
        // don't repeat recognition (and cancel timer)
        recog_reset();
    };

    var onWindowResize = function(event) {
        var w = window.innerWidth, h = window.innerHeight;
        var r = window.devicePixelRatio || 1;
        //console.log("Resizing canvas", w, h, r);
        drawing.resize(w, h, r);
        // replay existing commands to restore canvas contents.
        if (playbackInfo.isPlaying) {
            drawing.setCmdPos(0); // restart playback from start
        } else {
            drawing.setCmdPos(Drawing.END); // refresh
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
            if (Color.equal(drawing.brush.color, color)) { break; }
            drawing.addCmd(DrawCommand.create_color_change(color));
            drawing.setCmdPos(Drawing.END); // update drawing.brush
            break;
        case 'undoButton':
            removeRecogCanvas();
            doUndo();
            break;
        case 'redoButton':
            removeRecogCanvas();
            doRedo();
            break;
        case 'hardButton':
            if (drawing.brush.type === Brush.Type.HARD) { break; }
            drawing.addCmd(DrawCommand.create_brush_change(
                Brush.Type.HARD, drawing.brush.size, drawing.brush.opacity,
                drawing.brush.spacing));
            drawing.setCmdPos(Drawing.END); // update drawing.brush
            break;
        case 'softButton':
            if (drawing.brush.type === Brush.Type.SOFT) { break; }
            drawing.addCmd(DrawCommand.create_brush_change(
                Brush.Type.SOFT, drawing.brush.size, drawing.brush.opacity,
                drawing.brush.spacing));
            drawing.setCmdPos(Drawing.END); // update drawing.brush
            break;
        case 'opacitySlider':
            if (drawing.brush.opacity === +msg.value) { break; }
            drawing.addCmd(DrawCommand.create_brush_change(
                drawing.brush.type, drawing.brush.size, +msg.value,
                drawing.brush.spacing));
            drawing.setCmdPos(Drawing.END); // update drawing.brush
            break;
        case 'sizeSlider':
            if (drawing.brush.size === +msg.value) { break; }
            drawing.addCmd(DrawCommand.create_brush_change(
                drawing.brush.type, +msg.value, drawing.brush.opacity,
                drawing.brush.spacing));
            drawing.setCmdPos(Drawing.END); // update drawing.brush
            break;
        case 'playButton':
            if (playbackInfo.isPlaying) {
                playbackInfo.speed *= 4;
            } else {
                startPlayback();
            }
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
