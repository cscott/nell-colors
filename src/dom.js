/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false, document:false, window:false */
define([], function() {
    'use strict';
    /** Export a limited set of functions for working with the DOM.
     *  These can be reimplemented for a standalone application.
     */

    var insertMeta = function(document) {
        var elements = [
            [ ["charset", "UTF-8" ]],
            [ ["name", "viewport"],
              ["content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" ]],
            [ ["name", "apple-mobile-web-app-capable"],
              ["content", "yes" ]],
            [ ["name", "apple-mobile-web-app-status-bar-style"],
              ["content", "black"]]
        ];
        var m = document.getElementsByTagName("meta");
        var i, j, k;
        for (i=0; i<elements.length; i++) {
            var e = elements[i];
            // does this already exist?
            var exist = false;
            for (j=0; j<m.length && !exist; j++) {
                var mm = m[j];
                var match = true;
                for (k=0; k<e.length && match; k++) {
                    var a = e[k][0];
                    var v = e[k][1];
                    if (mm.getAttribute(a) !== v) {
                        match = false;
                    }
                }
                if (match) { exist=true; }
            }
            if (exist) { continue; }
            var meta = document.createElement("meta");
            for (k=0; k<e.length; k++) {
                meta.setAttribute(e[k][0], e[k][1]);
            }
            document.head.appendChild(meta);
        }
    };
    var setTitle = function(window, new_title) {
        window.document.title = new_title;
    };
    var insertCanvas = function(window) {
        var doc = window.document;
        var canvas = document.createElement("canvas");
        canvas.id="ncolors";
        canvas.style.position="absolute";
        canvas.style.left="0px";
        canvas.style.top="0px";
        canvas.style.right="0px";
        canvas.style.bottom="0px";
        document.body.appendChild(canvas);
        var onWindowResize = function(event) {
            var w = window.innerWidth, h = window.innerHeight;
            var r = window.devicePixelRatio || 1;
            // XXX force aspect ratio?
            canvas.width = w * r;
            canvas.height = h * r;
            console.log("Resizing canvas", w, h, r);
            if (canvas.resizeHandler) {
                canvas.resizeHandler();
            }
        };
        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
        return canvas;
    };

    // Create initial stage.
    var init = function(window) {
        insertMeta(window.document);
        setTitle(window, "Nell's Colors");
        return insertCanvas(window);
    };
    var new_window = function(parent_window) {
        var nw = parent_window.open("", "_blank");
        insertMeta(nw);
        setTitle(nw, "Nell's Colors");
        return insertCanvas(nw);
    };

    return {
        //initial_canvas: init(window),
        insertMeta: insertMeta,
        new_canvas: function() { return new_window(window); },
        set_title: function(canvas, new_title) {
            canvas.ownerDocument.title = new_title;
        },
        get_title: function(canvas) {
            return canvas.ownerDocument.title;
        }
    };
});
