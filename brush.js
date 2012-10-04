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
define(['domReady!', './src/brushdialog', './src/color', './src/hslcolor'], function(document, BrushDialog, Color, HSLColor) {
    'use strict';

    var brushpane = document.querySelector("#brushpane");
    var brushdialog = new BrushDialog(brushpane);
    brushdialog.open(HSLColor.from_color(Color.DARK_RED), null);
});
