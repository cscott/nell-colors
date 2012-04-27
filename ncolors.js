/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, MessageChannel:false, window:false,
         setTimeout:false, clearTimeout:false, navigator:false */
define(['require', 'domReady!', './src/brush', './src/color', './src/compat', './src/dom', './src/drawcommand', './src/drawing', './src/layer', './hammer', './src/postmessage', './raf', './src/recog', './BlobBuilder', './FileSaver', 'font!google,families:[Delius]'], function(require, document, Brush, Color, Compat, Dom, DrawCommand, Drawing, Layer, Hammer, postMessage, requestAnimationFrame, Recog, BlobBuilder, saveAs) {
    'use strict';
    // Android browser doesn't support MessageChannel
    // -- however, it also has a losing canvas. so don't worry too much.
    var USE_MESSAGECHANNEL = (typeof(MessageChannel) !== 'undefined');
    var toolbarPort = null;

    // How long to allow between strokes of a letter
    var RECOG_TIMEOUT = 750;
    // show frame rate overlay
    var SHOW_FRAME_RATE = true;
    // limit touch event frequency (set to 0 to disable rate limiting)
    var TOUCH_EVENT_INTERVAL_MS = 25; /* 40 Hz */
    // (this isn't needed on iphone/ipad)
    if (/(iPhone|iPad).*Safari/.test(navigator.userAgent)) {
        TOUCH_EVENT_INTERVAL_MS = 0;
    }

    // get 2d context for canvas.
    Dom.insertMeta(document);
    var drawingElem = document.getElementById('drawing');
    var drawing = new Drawing();
    drawing.attachToContainer(drawingElem);
    var hammer = new Hammer(drawingElem, {
        prevent_default: true,
        drag_min_distance: 2
    });

    var maybeRequestAnim, removeRecogCanvas, maybeLoadAudio;

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

    var updateFrameRate = function() { };
    if (SHOW_FRAME_RATE) {
        updateFrameRate = (function() {
            var fr = document.getElementById('framerate');
            var num = fr.children[0];
            var frametimes = [Date.now()];
            fr.style.display = 'block'; // make visible
            return function() {
                // average last 20 frame times to smooth display
                frametimes.push(Date.now());
                while (frametimes.length > 20) {
                    frametimes.shift();
                }
                var elapsed =
                    (frametimes[frametimes.length-1] - frametimes[0]) /
                    (frametimes.length-1);
                var fps = 1000/elapsed;
                num.textContent = Math.round(fps);
            };
        })();
    }

    var animRequested = false;
    var refresh = function() {
        console.assert(animRequested);
        console.assert(drawing.commands.last !== drawing.commands.end);
        drawing.setCmdPos(Drawing.END); // draw to end
        updateFrameRate();
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
        updateFrameRate();
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
            console.assert(drawing.commands.last !== drawing.commands.end);
            animRequested = true;
            requestAnimationFrame(playbackInfo.isPlaying ? playback : refresh);
        }
    };

    var isDragging = false;
    var lastpos = { x: null, y: null, time: 0 };
    hammer.ondrag = function(ev) {
        maybeLoadAudio(); // partial workaround for iOS audio reluctance
        maybeHaltPlayback();
        if (!isDragging) {
            // XXX fill in current layer here
            drawing.addCmd(DrawCommand.create_draw_start(drawing.layers.current));
            lastpos.x = lastpos.y = null; // force emit next point
            lastpos.time = 0;
        }
        isDragging = true;
        if (ev.position.x === lastpos.x &&
            ev.position.y === lastpos.y) {
            // nothing to do here.
            return;
        }
        // rate limit touch updates -- this is needed for good performance
        // on Android/Xoom.
        var now = Date.now();
        if (now - lastpos.time < TOUCH_EVENT_INTERVAL_MS) {
            return;
        }
        lastpos.x = ev.position.x;
        lastpos.y = ev.position.y;
        lastpos.time = now;
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

    // generate <audio> elements for various snippets we might want to play
    var audio_snippets = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
                          'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    audio_snippets.forEach(function(id, n) {
        var audio = document.createElement('audio');
        audio.id = 'audio'+id;
        audio.preload = 'auto';
        var mp3src = document.createElement('source');
        mp3src.src = 'audio/'+id+'.mp3';
        mp3src.type = 'audio/mpeg';
        var oggsrc = document.createElement('source');
        oggsrc.src = 'audio/'+id+'.ogg';
        oggsrc.type = 'audio/ogg';
        audio.appendChild(mp3src);
        audio.appendChild(oggsrc);
        drawingElem.appendChild(audio);
        audio_snippets[id] = audio;
    });
    audio_snippets.loadQueue = [];
    maybeLoadAudio = function() {
        if (audio_snippets.loadQueue.length===0) { return; }
        var audio = audio_snippets.loadQueue.shift();
        /* --- sometimes we start to load audio but never finish =( */
        if (false) {
            console.log('started to load '+audio.id);
            audio.addEventListener('loadeddata', function() {
                console.log('finished loading '+audio.id);
            });
        }
        audio.load();
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
        var letter = model.charAt(0);
        //console.log(model);

        // draw recognized letter on "recognition canvas"
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
        c.style.opacity = 0.3;
        c.width = w*r;
        c.height = h*r;
        var ctxt = c.getContext('2d');
        // Patrick+Hand is a good alternative to Delius
        // 1.2 factor in font size is fudge factor to make letter fit
        // bounding box more tightly
        ctxt.font = (c.height*1.2)+"px Delius, sans-serif";
        ctxt.textAlign = "center";
        ctxt.textBaseline = "middle";
        ctxt.fillStyle = drawing.brush.color.to_string().replace(/..$/,'');
        ctxt.translate(c.width/2, c.height/2);
        // measure the expected width
        var metrics = ctxt.measureText(letter);
        if (metrics.width < c.width) {
            ctxt.scale(c.width/metrics.width, 1); // scale up to fit
        }
        ctxt.fillText(model.charAt(0), 0, 0, c.width);
        removeRecogCanvas();
        lastRecogCanvas = c;
        drawingElem.appendChild(lastRecogCanvas);

        // say the letter name
        var audio = audio_snippets[letter];
        if (audio) {
            try {
                if (!audio.paused) { audio.pause(); }
                audio.currentTime=0;
                audio.play();
                // console.log(letter + ' played natively');
            } catch (e) {
                if (/(iPhone|iPad).*Safari/.test(navigator.userAgent)) {
                    // iOS won't let us load/play content w/o user interaction
                    // this is really annoying.
                    if (!audio_snippets['done'+letter]) {
                        audio_snippets.loadQueue.push(audio);
                        audio_snippets['done'+letter] = true;
                    }
                } else {
                    console.log("Unexpected problem playing audio.", e);
                }
            }
        }
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
    var doSave = function() {
        var json = JSON.stringify(drawing, null, 1);
        var blob, blobUrl;
        try {
            blob = new window.Blob([json], {type:"text/plain;charset=ascii"});
        } catch (e) {
            var bb = new BlobBuilder();
            bb.append(json);
            blob = bb.getBlob("text/plain;charset=ascii");
        }
        saveAs(blob, 'drawing.json');
    };

    var onWindowResize = function(event) {
        var w = window.innerWidth, h = window.innerHeight;
        var r = window.devicePixelRatio || 1;
        //console.log("Resizing canvas", w, h, r);
        drawing.resize(w, h, r);
        // replay existing commands to restore canvas contents.
        if (!playbackInfo.isPlaying && drawing.checkpoints.length===0) {
            startPlayback();
            playbackInfo.speed *= 10;
        }
        if (playbackInfo.isPlaying) {
            drawing.setCmdPos(0); // restart playback from start
        } else {
            drawing.setCmdPos(Drawing.END); // refresh
        }
    };
    window.addEventListener('resize', onWindowResize, false);

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
        case 'saveButton':
            doSave();
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
    var finishUp = function() {
        // finally, update the toolbar opacity/size to match
        updateToolbarBrush();
        onWindowResize();
        document.getElementById("loading").style.display="none";
    };
    // load the requested doc
    switch(document.location.hash) {
    case '#lounge':
    case '#castle':
    case '#intro':
    case '#r':
    case '#roger':
        require(['drw!./'+document.location.hash.replace(/^#/,'')+'.json'],
                function(new_drawing) {
                    drawing.removeFromContainer(drawingElem);
                    drawing = new_drawing;
                    drawing.attachToContainer(drawingElem);
                    finishUp();
                    if (drawing.initial_playback_speed) {
                        playbackInfo.speed = drawing.initial_playback_speed;
                    }
                });
        break;
    default:
        // XXX load or create from local storage
        console.log("Unrecognized hash", document.location.hash);
        // FALL THROUGH
    case '':
    case '#':
        finishUp();
        break;
    }
});
