/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, MessageChannel:false, window:false,
         setTimeout:false, clearTimeout:false, navigator:false */
define(['require', 'domReady!', /*'./audio-map.js',*/ './src/brush', './src/color', './src/compat', './src/dom', './src/drawcommand', './src/drawing', './src/layer', './hammer', './src/postmessage', './src/prandom!', './raf', './src/recog', './src/sync', './BlobBuilder', './FileSaver', 'font!google,families:[Delius]'], function(require, document, /*audioMap_,*/ Brush, Color, Compat, Dom, DrawCommand, Drawing, Layer, Hammer, postMessage, prandom, requestAnimationFrame, Recog, Sync, BlobBuilder, saveAs) {
    'use strict';
    // inlining the audio snippets with data: URLs seems to break iOS =(
    var audioMap = (typeof audioMap_ === 'undefined') ? false : audioMap_;
    // Android browser doesn't support MessageChannel
    // -- however, it also has a losing canvas. so don't worry too much.
    var USE_MESSAGECHANNEL = (typeof(MessageChannel) !== 'undefined');
    var toolbarPort = null;

    // How long to allow between strokes of a letter
    var RECOG_TIMEOUT = 750;
    // minimum frame rate during replay
    var MAX_FRAME_TIME_MS = 1000 / 30 /* Hz */;
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
    var updateToolbarBrush, replaceDrawing, maybeSyncDrawing;

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
    var INSTANTANEOUS = 0; // special speed value
    var playbackInfo = {
        isPlaying: false,
        lastFrameTime: 0,
        speed: INSTANTANEOUS
    };
    var maybeHaltPlayback = function() {
        if (!playbackInfo.isPlaying) { return; }
        playbackInfo.speed = INSTANTANEOUS;
        recog_reset();
    };
    var startPlayback = function() {
        if (!playbackInfo.isPlaying) {
            playbackInfo.lastFrameTime = Date.now();
            playbackInfo.speed = 4;
        }
        drawing.setCmdPos(Drawing.START);
        removeRecogCanvas();
        maybeRequestAnim();
    };
    var playback = function() {
        console.assert(drawing.commands.last !== drawing.commands.end);
        console.assert(animRequested);

        var curtime = Date.now();
        var isMore;
        updateFrameRate();

        if (playbackInfo.speed === INSTANTANEOUS) {
            // play back as much as possible
            isMore = drawing.setCmdPos(Drawing.END,
                                       MAX_FRAME_TIME_MS);
        } else {
            // play some frames.
            var timeDelta = curtime - playbackInfo.lastFrameTime;
            // have mercy on slow CPUs: even if we get stuck behind the
            // refresh rate curve, don't try to play back too much to keep up
            timeDelta = Math.min(100/*10Hz*/, timeDelta);
            isMore = drawing.setCmdTime(timeDelta * playbackInfo.speed,
                                        MAX_FRAME_TIME_MS);
        }
        playbackInfo.lastFrameTime = curtime;

        // are we done, or do we need to schedule another animation frame?
        if (isMore) {
            if (!playbackInfo.isPlaying) {
                playbackInfo.isPlaying = true;
                toolbarPort.postMessage(JSON.stringify({type:'playing'}));
                // infrequent checkpoints during playback
                drawing.checkpointOften = false;
            }
            requestAnimationFrame(playback);
        } else {
            if (playbackInfo.isPlaying) {
                playbackInfo.isPlaying = false;
                playbackInfo.speed = INSTANTANEOUS;
                toolbarPort.postMessage(JSON.stringify({type:'stopped'}));
                // frequent checkpoints for editing
                drawing.checkpointOften = true;
                drawing.addCheckpoint(true);
            }
            animRequested = false;
            updateToolbarBrush();
        }
    };
    maybeRequestAnim = function() {
        if (!animRequested) {
            console.assert(drawing.commands.last !== drawing.commands.end);
            animRequested = true;
            requestAnimationFrame(playback);
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
        // save
        maybeSyncDrawing();
    };

    // generate <audio> elements for various snippets we might want to play
    var audio_snippets = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
                          'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    audio_snippets.forEach(function(id, n) {
        var audio = document.createElement('audio');
        audio.id = 'audio'+id;
        audio.preload = 'auto';
        var mp3src = document.createElement('source');
        if (audioMap) {
            mp3src.src = 'data:audio/mpeg;base64,'+audioMap['audio/'+id+'.mp3'];
        } else {
            mp3src.src = 'audio/'+id+'.mp3';
        }
        mp3src.type = 'audio/mpeg';
        var oggsrc = document.createElement('source');
        if (audioMap) {
            oggsrc.src = 'data:audio/ogg;base64,'+audioMap['audio/'+id+'.ogg'];
        } else {
            oggsrc.src = 'audio/'+id+'.ogg';
        }
        oggsrc.type = 'audio/ogg';
        audio.appendChild(mp3src);
        audio.appendChild(oggsrc);
        drawingElem.appendChild(audio);
        audio_snippets[id] = audio;
    });
    audioMap = null; // free memory (but requirejs still holds a reference)
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

    updateToolbarBrush = function() {
        var msg = {
            type: 'brush',
            color: drawing.brush.color.to_string(),
            brush_type:  drawing.brush.type,
            size:  drawing.brush.size,
            opacity: drawing.brush.opacity,
            spacing: drawing.brush.spacing
        };
        toolbarPort.postMessage(JSON.stringify(msg));
        // XXX update undo/redo active as well.
    };

    var doUndo = function() {
        console.assert(!isDragging);
        var isMore = drawing.undo(MAX_FRAME_TIME_MS);
        if (isMore) {
            maybeRequestAnim();
        } else {
            // update the toolbar opacity/size to match
            updateToolbarBrush();
        }
        // stop recognition and cancel timer
        recog_reset();
        maybeSyncDrawing();
    };
    var doRedo = function() {
        console.assert(!isDragging);
        var isMore = drawing.redo(MAX_FRAME_TIME_MS);
        if (isMore) {
            maybeRequestAnim();
        } else {
            // update the toolbar opacity/size to match
            updateToolbarBrush();
        }
        // don't repeat recognition (and cancel timer)
        recog_reset();
        maybeSyncDrawing();
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
    var doSave1 = function() {
        console.log('saving', drawing.uuid);
        Sync.save(drawing, function() {
            console.log('saved!', drawing.uuid);
            Sync.load(drawing.uuid, function(ndrawing) {
                console.log('loaded', ndrawing.uuid);
                replaceDrawing(ndrawing);
            });
        });
    };
    maybeSyncDrawing = function() {
        var isSaving = false, isDirty = false;
        return function() {
            if (isSaving) {
                // can't save now, queue it for later.
                isDirty = true;
                return;
            }
            // ok, save now!
            isSaving = true;
            isDirty = true;
            var afterSave = function() {
                if (isDirty) {
                    // someone requested another save while we were busy, do it
                    isDirty = false;
                    Sync.save(drawing, afterSave);
                } else {
                    // we're all caught up!
                    isSaving = false;
                }
            };
            afterSave();
        };
    }();

    var onWindowResize = function(event) {
        var w = window.innerWidth, h = window.innerHeight;
        var r = window.devicePixelRatio || 1;
        //console.log("Resizing canvas", w, h, r);
        var oldpos = drawing.commands.last;
        drawing.resize(w, h, r);
        // try to restore the old position
        var isMore = drawing.setCmdPos(oldpos, MAX_FRAME_TIME_MS);
        // if we were unsuccessful, maybe schedule some future playback time
        if (isMore) {
            maybeRequestAnim();
        }
    };
    window.addEventListener('resize', onWindowResize, false);

    // create a channel to listen to toolbar messages.
    var handleToolbarMessage = function(evt) {
        if (isDragging) { hammer.ondragend(); }
        var msg = JSON.parse(evt.data);
        if (msg.type !== 'playButton') { maybeHaltPlayback(); }
        var caughtUp = (drawing.commands.last === drawing.commands.end);
        switch(msg.type) {
        case 'undoButton':
            removeRecogCanvas();
            doUndo();
            break;
        case 'redoButton':
            removeRecogCanvas();
            doRedo();
            break;
        case 'swatchButton':
            var color = Color.from_string(msg.color);
            if (caughtUp && Color.equal(drawing.brush.color, color)) {
                break;
            }
            drawing.addCmd(DrawCommand.create_color_change(color));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush immed.
            }
            break;
        case 'hardButton':
            if (caughtUp && drawing.brush.type === 'hard') {
                break;
            }
            drawing.addCmd(DrawCommand.create_brush_change({
                brush_type: 'hard'
            }));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush
            }
            break;
        case 'softButton':
            if (caughtUp && drawing.brush.type === 'soft') {
                break;
            }
            drawing.addCmd(DrawCommand.create_brush_change({
                brush_type: 'soft'
            }));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush
            }
            break;
        case 'opacitySlider':
            if (caughtUp && drawing.brush.opacity === +msg.value) {
                break;
            }
            drawing.addCmd(DrawCommand.create_brush_change({
                opacity: +msg.value
            }));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush
            }
            break;
        case 'sizeSlider':
            if (caughtUp && drawing.brush.size === +msg.value) {
                break;
            }
            drawing.addCmd(DrawCommand.create_brush_change({
                size: +msg.value
            }));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush
            }
            break;
        case 'playButton':
            if (playbackInfo.isPlaying &&
                playbackInfo.speed !== INSTANTANEOUS) {
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
    replaceDrawing = function(new_drawing) {
        console.assert(new_drawing.uuid);
        drawing.removeFromContainer(drawingElem);
        drawing = new_drawing;
        drawing.attachToContainer(drawingElem);
        if (document.location.hash !== ('#' + drawing.uuid)) {
            document.location.hash = '#' + drawing.uuid;
            postMessage(window.parent, JSON.stringify({
                type: 'hashchange',
                hash: document.location.hash
            }), '*');
        }
        finishUp();
        if (drawing.initial_playback_speed) {
            playbackInfo.speed = drawing.initial_playback_speed;
        }
    };
    var loadDrawing = function(uuid, callback) {
        var nd;
        switch(uuid) {
        case 'lounge':
        case 'castle':
        case 'intro':
        case 'r':
        case 'roger':
            // special built-in drawings.
            require(['drw!./'+uuid+'.json'], function(new_drawing) {
                new_drawing.uuid = uuid;
                callback(new_drawing);
            });
            break;
        case 'new':
        case '':
            nd = new Drawing();
            nd.uuid = prandom.uuid();
            callback(nd);
            break;
        default:
            Sync.exists(uuid, function(exists) {
                if (exists) {
                    Sync.load(uuid, callback);
                } else {
                    // XXX attempt to load from network?
                    nd = new Drawing();
                    nd.uuid = uuid;
                    callback(nd);
                }
            });
            break;
        }
    };
    var onHashChange = function() {
        var uuid = document.location.hash.replace(/^#/,'');
        if (!uuid) { uuid = prandom.uuid(); }
        if (uuid === drawing.uuid) { return; /* already loaded */ }
        // Load new document.
        loadDrawing(uuid, replaceDrawing);
    };
    window.addEventListener('hashchange', onHashChange, false);

    // load the requested doc (based on URL hash)
    loadDrawing(document.location.hash.replace(/^#/,''), replaceDrawing);
});
