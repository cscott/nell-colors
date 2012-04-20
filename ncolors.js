/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./src/brush', './src/color', './src/dom', './src/drawcommand', './src/layer', './hammer', './raf'], function(Brush, Color, Dom, DrawCommand, Layer, Hammer, requestAnimationFrame) {

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
    // hack in a brush change
    commands.push(DrawCommand.create_brush_change(Brush.Type.SOFT, 20,
                                                  0.7, 0.2));

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
        i--;
        while (i >= 0 && commands[i].type === DrawCommand.Type.DRAW) {
            i--;
        }
        i++;
        // i should now point to the first DRAW command.
        console.log(commands, i);
        redoList.push(commands.slice(i));
        commands.length = i;
        // now redraw w/o those commands.
        layer.clear();
        commands.last = 0;
        refresh();
    };
    var redo = function() {
        if (redoList.length===0) { return; /* nothing to redo */ }
        redoList.pop().forEach(function(cmd) {
            commands.push(cmd);
        });
        refresh();
    };
    // expose these so we can manually trigger them from the debugging console
    window.doUndo = undo;
    window.doRedo = redo;

    var onWindowResize = function(event) {
        var w = window.innerWidth, h = window.innerHeight;
        var r = window.devicePixelRatio || 1;
        console.log("Resizing canvas", w, h, r);
        layer.resize(w, h, r);
        // replay existing commands to restore canvas contents.
        commands.last = 0;
        refresh();
    };
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
});
