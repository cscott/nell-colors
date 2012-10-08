/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, MessageChannel:false, window:false,
         setTimeout:false, clearTimeout:false, navigator:false */
require.config({
    paths: {
        domReady: "../plugins/domReady",
        font: "../plugins/font",
        drw: "../plugins/drw",
        img: "../plugins/img",
        webfont: "../plugins/webfont",
        propertyParser: "../plugins/propertyParser",
        json: "../plugins/json",
        text: "../plugins/text"
    }
});
define(['domReady!', './src/brush', './src/brushdialog', './src/color'], function(document, Brush, BrushDialog, Color) {
    'use strict';

    var brushpane = document.querySelector("#brushpane");
    var brushdialog = new BrushDialog(brushpane);
    var open, closed;
    open = function() {
        brushdialog.open(new Brush(Color.DARK_RED, 'soft', 32, 0.75, 0.225),
                         'brush', closed);
    };
    closed = function(brush) {
        console.log('closed', brush);
        window.setTimeout(open, 3000);
    };
    open();
});
