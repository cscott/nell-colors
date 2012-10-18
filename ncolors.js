/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, MessageChannel:false, window:false,
         setTimeout:false, clearTimeout:false, navigator:false */
define(['require', 'domReady!', /*'./src/audio-map.js',*/ './src/brush', './src/brushdialog', './src/color', './src/compat', './src/dom', './src/drawcommand', './src/drawing', 'json!./src/fontmetrics.json', './src/funf', './src/gallery', './lib/hammer', './src/layer', './src/lzw', './src/nodefault', './src/postmessage', './src/prandom!', './src/recog', './src/sound', './src/sync', './src/version', './lib/BlobBuilder', './lib/canvas-toBlob', './lib/FileSaver', 'font!custom,families:[Delius,DejaVu LGC Sans Book],urls:[fonts/style.css]'], function(require, document, /*audioMap,*/ Brush, BrushDialog, Color, Compat, Dom, DrawCommand, Drawing, FontMetrics, Funf, Gallery, Hammer, Layer, LZW, noDefault, postMessage, prandom, Recog, Sound, Sync, version, BlobBuilder, canvasToBlob, saveAs) {
    'use strict';
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

    // start up Funf logger
    var funf = new Funf('NellColors'+version);
    funf.record('startVersion', version);

    // transfer 'dev' tag from parent to this context
    if (window.parent.document.body.classList.contains('dev')) {
        document.body.classList.add('dev');
    } else {
        SHOW_FRAME_RATE = false;
    }
    // get 2d context for canvas.
    Dom.insertMeta(document);
    var drawingElem = document.getElementById('drawing');
    var drawing = new Drawing();
    drawing.placeholder = true;
    drawing.attachToContainer(drawingElem);
    var hammer = new Hammer(drawingElem, {
        prevent_default: true,
        drag_min_distance: 2
    });
    // brush dialog
    var brushdialog = new BrushDialog(document.getElementById('brushdialog'),
                                      true /* hide pane selector */);

    var maybeRequestAnim, removeRecogCanvas;
    var updateToolbarBrush, replaceDrawing, maybeSyncDrawing;
    var doTrash = null;

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
        toolbarPort.postMessage(JSON.stringify({type:'stopping'}));
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
                if (playbackInfo.speed === INSTANTANEOUS) {
                    toolbarPort.postMessage(JSON.stringify({type:'stopping'}));
                } else {
                    toolbarPort.postMessage(JSON.stringify({type:'playing'}));
                }
                // infrequent checkpoints during playback
                drawing.checkpointOften = false;
            }
            Compat.requestAnimationFrame(playback);
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
            Compat.requestAnimationFrame(playback);
        }
    };

    var isDragging = false;
    var lastpos = { x: null, y: null, time: 0 };
    hammer.ondrag = function(ev) {
        maybeHaltPlayback();
        if (!isDragging) {
            removeRecogCanvas();
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
            funf.record('stroke', {});
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
    var audio_snippets = {};
    ['A','B','C','D','E','F','G','H','I','J','K','L','M',
     'N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
        .forEach(function(id,n) {
        var audio = null;
        if (!/(iPhone|iPad).*Safari/.test(navigator.userAgent)) {
            // sadly, just creating audio tags slows down iphone/ipad by
            // a *lot*... and then they won't even play the audio! boo.
            // performance hit seems proportional to how many audio tags are
            // on the page, so we might be able to reenable this on iOS
            // using audio sprites (ie, a single audio file containing all
            // clips)
            // (and inlining the audio snippets with data: URLs breaks iOS
            // as well, so set audioMap to null if you re-enable this)
            audio = new Sound.Effect({ url:'audio/'+id,
                                       instances: 1,
                                       formats: ['webm'] });
        }
        audio_snippets[id] = audio;
        });

    removeRecogCanvas = function() {
        var lastRecogCanvas = drawingElem.querySelector('canvas.recogCanvas');
        if (lastRecogCanvas) {
            lastRecogCanvas.style.display = 'none';
        }
    };
    var handleRecog = function(model, prob, bbox) {
        if (prob < 400) { removeRecogCanvas(); return; }
        var letter = model.charAt(0);
        funf.record('recog', { model: model, prob: prob, bbox: bbox });

        // draw recognized letter on "recognition canvas"
        var w = bbox.br.x - bbox.tl.x, h = bbox.br.y - bbox.tl.y;
        var metrics = FontMetrics[letter];
        var c = drawingElem.querySelector('canvas.recogCanvas');
        if (!c) {
            // create & append canvas if not already present.
            c = document.createElement('canvas');
            c.className = 'recogCanvas';
            c.style.position='absolute';
            c.style.opacity = 0.75;
            if (document.body.classList.contains('dev')) {
                c.style.border="1px dashed #ccc";
            }
            drawingElem.appendChild(c);
        }
        c.style.display = 'block';
        // compute 'cover' scale
        var scale = Math.min(w/metrics.w, h/metrics.h);
        // make canvas the right size.
        c.width = Math.ceil(scale * metrics.fw);
        c.height = Math.ceil(scale * metrics.fh);
        c.style.width = c.width + 'px';
        c.style.height = c.height + 'px';
        var ctxt = c.getContext('2d');
        ctxt.clearRect(0,0,c.width,c.height);
        // draw the letter inside this box
        ctxt.font = FontMetrics.font;
        ctxt.textAlign = FontMetrics.textAlign;
        ctxt.textBaseline = FontMetrics.textBaseline;
        ctxt.translate(c.width/2, c.height/2);
        ctxt.scale(scale, scale);
        ctxt.translate(-metrics.cx, -metrics.cy);

        ctxt.strokeStyle='white';
        ctxt.lineWidth=FontMetrics.outerOutline;
        ctxt.strokeText(letter, 0, 0);

        ctxt.strokeStyle='black';
        ctxt.lineWidth=FontMetrics.innerOutline;
        ctxt.strokeText(letter, 0, 0);

        ctxt.fillStyle = drawing.brush.color.to_string().replace(/..$/,'');
        ctxt.fillText(letter, 0, 0);

        // position the canvas: align center w/ center of bbox
        var bbcx = (bbox.tl.x + bbox.br.x)/2;
        var bbcy = (bbox.tl.y + bbox.br.y)/2;
        c.style.left = Math.round(bbcx - (c.width/2)) + 'px';
        c.style.top  = Math.round(bbcy - (c.height/2)) + 'px';

        // say the letter name
        var audio = audio_snippets[letter.toUpperCase()];
        if (audio) {
            try {
                audio.play();
                // console.log(letter + ' played natively');
            } catch (e) {
                if (/(iPhone|iPad).*Safari/.test(navigator.userAgent)) {
                    // iOS won't let us load/play content w/o user interaction
                    // this is really annoying.
                } else {
                    console.log("Unexpected problem playing audio.", e);
                }
            }
        }
    };
    Recog.registerCallback(handleRecog);

    var updateColor = function(rgbColor, opacity) {
        var msg = {
            type: 'color',
            red: rgbColor.red,
            green: rgbColor.green,
            blue: rgbColor.blue,
            opacity: opacity
        };
        toolbarPort.postMessage(JSON.stringify(msg));
    };
    updateToolbarBrush = (function() {
        // don't post redundant updates (ie, while drawing!)
        var lastBrush = new Brush(), first = true;
        return function() {
            if (lastBrush.equals(drawing.brush) && !first) {
                return; // already up to date
            }
            lastBrush.set_from_brush(drawing.brush);
            first = false;
            updateColor(drawing.brush.color, drawing.brush.opacity);
            var msg = {
                type: 'brush',
                brush_type:  drawing.brush.type,
                size:  drawing.brush.size,
                opacity: drawing.brush.opacity,
                spacing: drawing.brush.spacing
            };
            toolbarPort.postMessage(JSON.stringify(msg));
            if (brushdialog.isOpen()) {
                brushdialog.updateBrush(drawing.brush,
                                        true/*preserve old color*/);
            }
            // XXX update undo/redo active as well.
        };
    }());
    brushdialog.colorCallback = function(hslColor) {
        updateColor(hslColor.rgbaColor(), hslColor.opacity/255);
    };

    var handleMaskClick = null;
    (function(mask) {
        mask.addEventListener('click', noDefault(function(event) {
            if (handleMaskClick) { handleMaskClick(); }
        }));
        // ignore double taps / long taps / right clicks
        mask.addEventListener('contextmenu', noDefault(), false);
        mask.addEventListener('dblclick', noDefault(), false);
    })(document.querySelector('#mask'));

    var handleBrushDialog = function(brush) {
        var caughtUp = (drawing.commands.last === drawing.commands.end);
        document.body.classList.remove('mask');
        handleMaskClick = null;
        toolbarPort.postMessage(JSON.stringify({
            type: 'toolbar-mode-switch',
            mode: 'drawing'
        }));

        if (caughtUp && brush.equals(drawing.brush)) { return; }

        var opts = {}, brush_change = false;
        ['type','size','opacity','spacing'].forEach(function(f) {
            if (brush[f] === drawing.brush[f]) { return; }
            opts[(f==='type') ? 'brush_type' : f] = brush[f];
            brush_change = true;
        });
        if (brush_change) {
            drawing.addCmd(DrawCommand.create_brush_change(opts));
        }
        if (!Color.equal(drawing.brush.color, brush.color)) {
            drawing.addCmd(DrawCommand.create_color_change(brush.color));
        }
        if (caughtUp) {
            drawing.setCmdPos(Drawing.END); // update drawing.brush
            updateToolbarBrush();
        }
    };
    var openOrSwitchBrushDialog = function(pane) {
        if (brushdialog.isOpen()) {
            if (brushdialog.currentPane() !== pane) {
                brushdialog.switchPane(pane);
            } else {
                brushdialog.close(true);
            }
        } else {
            brushdialog.open(drawing.brush, pane, handleBrushDialog);
            document.body.classList.add('mask');
            handleMaskClick = function() { brushdialog.close(true); };
            toolbarPort.postMessage(JSON.stringify({
                type: 'toolbar-mode-switch',
                mode: 'brushdialog'
            }));
        }
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
    var doSave = function(asJson) {
        var json = JSON.stringify(drawing, null, 1);
        var mimetype, filename;
        var blob, blobUrl;
        if (asJson) {
            mimetype = "text/plain;charset=ascii";
            filename = 'drawing.json';
            try {
                blob = new window.Blob([json], {type: mimetype});
            } catch (e) {
                var bb = new BlobBuilder();
                bb.append(json);
                blob = bb.getBlob(mimetype);
            }
            saveAs(blob, 'drawing.json');
        } else {
            // hack: encode json as a PNG so that we can export it from
            // android (!)
            mimetype = 'image/png';
            filename = 'drawing-json.png';
            var bytes = LZW.encode(json, true/* to utf8 */);
            // stick in an extra byte to indicate exact length
            bytes = String.fromCharCode((bytes.length+1) % 3) + bytes;
            var size = Math.ceil(Math.sqrt(bytes.length/3));
            var c = document.createElement('canvas');
            var ctxt = c.getContext('2d');
            var createImageData= ctxt.createImageDataHD || ctxt.createImageData;
            // some shenanigans to ensure that HD image has enough pixels.
            var idata = createImageData.call(ctxt, 100, 1);
            var scale = idata.width/100;
            c.width = Math.ceil(size/scale);
            c.height = Math.ceil(bytes.length/(3*scale*size));
            idata = createImageData.call(ctxt, c.width, c.height);
            console.assert(idata.width*idata.height*3 >= bytes.length);
            var i;
            for (i=0; i < bytes.length/3; i++) {
                idata.data[i*4+0] = bytes.charCodeAt(i*3+0) || 0;
                idata.data[i*4+1] = bytes.charCodeAt(i*3+1) || 0;
                idata.data[i*4+2] = bytes.charCodeAt(i*3+2) || 0;
                idata.data[i*4+3] = 255; // avoid problems w/ premult alpha
            }
            var putImageData = ctxt.putImageDataHD || ctxt.putImageData;
            putImageData.call(ctxt, idata, 0, 0);
            var toBlobHD = c.toBlob || c.toBlobHD;
            blob = toBlobHD.call(c, function(blob) {
                saveAs(blob, filename);
            }, mimetype);
        }
    };
    var doSave1 = function() {
        console.log('saving', drawing.uuid);
        Sync.save(drawing, function() {
            console.log('saved!', drawing.uuid);
            Sync.load(drawing.uuid, 'local', function(ndrawing) {
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
            var drawing_copy = drawing;
            var afterSave = function() {
                if (isDirty) {
                    // someone requested another save while we were busy, do it
                    isDirty = false;
                    Sync.save(drawing_copy, afterSave);
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
        funf.record('toolbar', msg);
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
            if (caughtUp && (!brushdialog.isOpen()) &&
                Color.equal(drawing.brush.color, color) &&
                drawing.brush.opacity===1) {
                break;
            }
            drawing.addCmd(DrawCommand.create_color_change(color));
            /* force color to be opaque, and respect current brush if
             * brush dialog is open. */
            var opts = {};
            if (brushdialog.isOpen()) {
                var brush = brushdialog.currentBrush();
                ['type','size','opacity','spacing'].forEach(function(f) {
                    opts[(f==='type') ? 'brush_type' : f] = brush[f];
                });
            }
            opts.opacity = 1; // force opaque
            drawing.addCmd(DrawCommand.create_brush_change(opts));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush immed.
                updateToolbarBrush();
            }
            break;

        case 'colorButton':
            openOrSwitchBrushDialog('color');
            break;
        case 'brushButton':
            openOrSwitchBrushDialog('brush');
            break;

        case 'playButton':
            if (playbackInfo.isPlaying &&
                playbackInfo.speed !== INSTANTANEOUS) {
                if (false) {
                    // old behavior: speed up playback
                    playbackInfo.speed *= 4;
                } else {
                    // new behavior: skip to end (if possible)
                    maybeHaltPlayback();
                }
            } else {
                startPlayback();
            }
            break;
        case 'saveButton':
            doSave('json');
            break;
        case 'trashButton':
            /* ignore; this button is meant to be dropped not clicked */
            break;
        case 'trashDrop':
            if (doTrash) { doTrash(msg.uuid); }
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
    var notifyParentHash = function(newHash, optReplace, optTitle) {
        var msg = {
            type: 'hashchange',
            hash: newHash
        };
        if (optReplace) {
            msg.replace = true;
            msg.title = optTitle;
        }
        postMessage(window.parent, JSON.stringify(msg), '*');
    };

    replaceDrawing = function(new_drawing, optForceSave) {
        console.assert(new_drawing.uuid);
        drawing.removeFromContainer(drawingElem);
        removeRecogCanvas();
        recog_timer_cancel();
        drawing = new_drawing;
        drawing.attachToContainer(drawingElem);
        if (document.location.hash !== ('#' + drawing.uuid)) {
            document.location.hash = '#' + drawing.uuid;
            notifyParentHash(document.location.hash);
        }
        if (drawing.initial_playback_speed) {
            playbackInfo.speed = drawing.initial_playback_speed;
        }
        // finally, update the toolbar opacity/size to match
        updateToolbarBrush();
        onWindowResize();
        document.getElementById("loading").style.display="none";
        toolbarPort.postMessage(JSON.stringify({
            type: 'toolbar-mode-switch',
            mode: 'drawing'
        }));
        funf.record('mode', {
            name: 'drawing',
            uuid: drawing.uuid,
            length: drawing.commands.length // identify new/existing drawings
        });
        // newly loaded sample drawings need to be saved w/ their new UUID
        if (optForceSave) {
            maybeSyncDrawing();
        }
    };

    var loadDrawing = function(uuid, callback) {
        var nd, gallery;
        document.getElementById("loading").style.display="block";
        toolbarPort.postMessage(JSON.stringify({
            type: 'toolbar-mode-switch',
            mode: 'loading'
        }));
        switch(uuid) {
        case 'castle':
        case 'intro':
        case 'lounge':
        case 'r':
        case 'roger':
            // special built-in drawings.
            require(['drw!samples/'+uuid+'.json'], function(new_drawing) {
                new_drawing.uuid = prandom.uuid();
                if (window.history.replaceState) {
                    window.history.replaceState(null, uuid, '#'+new_drawing.uuid);
                    notifyParentHash('#'+new_drawing.uuid, true, uuid);
                }
                callback(new_drawing, true/* force initial save */);
            });
            break;
        case '':
        case 'gallery':
            gallery = new Gallery(funf, toolbarPort);
            gallery.wait(function(uuid) {
                // hide the gallery and load the new drawing
                document.body.removeChild(gallery.domElement);
                doTrash = null;
                loadDrawing(uuid, callback);
            });
            doTrash = function(uuid) {
                gallery.trash(uuid);
            };
            document.body.appendChild(gallery.domElement);
            toolbarPort.postMessage(JSON.stringify({
                type: 'toolbar-mode-switch',
                mode: 'gallery'
            }));
            funf.record('mode', { name: 'gallery' });
            // discard old drawing (replace with blank placeholder)
            drawing.removeFromContainer(drawingElem);
            removeRecogCanvas();
            recog_timer_cancel();
            drawing = new Drawing();
            drawing.placeholder = true;
            drawing.attachToContainer(drawingElem);
            break;
        case 'new':
            nd = new Drawing();
            nd.uuid = prandom.uuid();
            callback(nd);
            break;
        default:
            Sync.exists(uuid, function(exists, where) {
                if (!exists) {
                    nd = new Drawing();
                    nd.uuid = uuid;
                    callback(nd);
                } else if (where==='local') {
                    Sync.load(uuid, 'local', callback);
                } else {
                    // load from network, but rename & save locally
                    Sync.load(uuid, 'remote', function(new_drawing) {
                        new_drawing.uuid = prandom.uuid();
                        if (window.history.replaceState) {
                            window.history.replaceState(null, uuid, '#'+new_drawing.uuid);
                            notifyParentHash('#'+new_drawing.uuid, true, uuid);
                        }
                        callback(new_drawing, true/* force initial save */);
                    });
                }
            });
            break;
        }
    };
    var onHashChange = function() {
        var uuid = document.location.hash.replace(/^#/,'');
        if (uuid === drawing.uuid) { return; /* already loaded */ }
        // Load new document.
        notifyParentHash(document.location.hash, true, uuid);
        Gallery.abort(); doTrash = null;
        loadDrawing(uuid, replaceDrawing);
    };
    window.addEventListener('hashchange', onHashChange, false);

    // load the requested doc (based on URL hash)
    loadDrawing(document.location.hash.replace(/^#/,''), replaceDrawing);
});
