/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, MessageChannel:false, window:false */
define(['domReady!', './src/brush', './src/color', './src/dom', './src/drawcommand', './src/layer', './hammer', './src/postmessage', './raf'], function(document, Brush, Color, Dom, DrawCommand, Layer, Hammer, postMessage, requestAnimationFrame) {
    // Because Safari 5.1 doesn't have Function.bind (sigh)
    // (xxx this is a lame implementation that only allows 1 arg to bind)
    if (typeof(Function.prototype.bind) === 'undefined') {
        Function.prototype.bind = function(context) {
            var oldRef = this;
            return function() {
                return oldRef.apply(context || null, Array.prototype.slice.call(arguments));
            };
        };
    }

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
    // hack in a brush change and color change
    var brush = new Brush(Color.BLACK, Brush.Type.SOFT, 20, 0.7, 0.2);
    commands.push(DrawCommand.create_color_change(brush.color));
    commands.push(DrawCommand.create_brush_change(brush.type, brush.size,
                                                  brush.opacity,brush.spacing));

    var animRequested = false;
    var refresh = function() {
        while (commands.last < commands.length) {
            layer.execCommand(commands[commands.last++]);
        }
        animRequested = false;
    };
    var maybeRequestAnim = function() {
        if (!animRequested) {
            animRequested = true;
            requestAnimationFrame(refresh);
        }
    };

    var isDragging = false;
    hammer.ondrag = function(ev) {
        isDragging = true;
        commands.push(DrawCommand.create_draw(ev.position));
        redoList.length = 0;
        maybeRequestAnim();
    };
    hammer.ondragend = function(ev) {
        isDragging = false;
        commands.push(DrawCommand.create_draw_end());
        redoList.length = 0;
        maybeRequestAnim();
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
        // XXX update the toolbar opacity/size to match
    };
    var redo = function() {
        if (redoList.length===0) { return; /* nothing to redo */ }
        redoList.pop().forEach(function(cmd) {
            commands.push(cmd);
        });
        refresh();
        // reset current brush from layer
        brush = layer.currentBrush();
        // XXX update the toolbar opacity/size to match
    };

    var onWindowResize = function(event) {
        var w = window.innerWidth, h = window.innerHeight;
        var r = window.devicePixelRatio || 1;
        //console.log("Resizing canvas", w, h, r);
        layer.resize(w, h, r);
        // replay existing commands to restore canvas contents.
        commands.last = 0;
        refresh();
    };
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();

    document.getElementById("loading").style.display="none";
    /*
    document.getElementById("loading").innerHTML = "Resized "+window.innerWidth+"x"+window.innerHeight+" "+window.devicePixelRatio;
    */

    // create a channel to listen to toolbar messages.
    var toolbarChannel = new MessageChannel();
    var handleToolbarMessage = function(evt) {
        if (isDragging) { hammer.ondragend(); }
        var msg = JSON.parse(evt.data);
        switch(msg.type) {
        case 'swatchButton':
            var color = Color.from_string(msg.color);
            commands.push(DrawCommand.create_color_change(color));
            break;
        case 'undoButton':
            undo();
            break;
        case 'redoButton':
            redo();
            break;
        case 'hardButton':
            brush.type = Brush.Type.HARD;
            commands.push(DrawCommand.create_brush_change(
                brush.type, brush.size, brush.opacity,brush.spacing));
            break;
        case 'softButton':
            brush.type = Brush.Type.SOFT;
            commands.push(DrawCommand.create_brush_change(
                brush.type, brush.size, brush.opacity,brush.spacing));
            break;
        case 'opacitySlider':
            brush.opacity = +msg.value;
            commands.push(DrawCommand.create_brush_change(
                brush.type, brush.size, brush.opacity,brush.spacing));
            break;
        case 'sizeSlider':
            brush.size = +msg.value;
            commands.push(DrawCommand.create_brush_change(
                brush.type, brush.size, brush.opacity,brush.spacing));
            break;
        default:
            console.warn("Unhandled toolbar message", evt);
            break;
        }
    };
    toolbarChannel.port2.addEventListener('message', handleToolbarMessage,
                                          false);
    toolbarChannel.port2.start();

    // listen to other messages from our parent
    var handleMessage = function(evt) {
        console.warn("Child got message", evt.data, "from", evt.origin);
    };
    window.addEventListener('message', handleMessage, false);

    // Notify our parent that we're ready to rock!
    var msg = { type: 'childReady' };
    postMessage(window.parent, JSON.stringify(msg), '*', [toolbarChannel.port1]);
});
