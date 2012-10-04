/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false */
define(['./color'], function(Color) {
    'use strict';

    /* Colors natively stored as hue, saturation, lightness and opacity
     * in the range [0, 255].
     */

    var clamp = function(x) {
        return (x<0) ? 0 : (x>255) ? 255 : x;
    };
    var max = Math.max;
    var min = Math.min;

    /* hue=[0,255], sat=[0,255], lightness=[0,255], opacity=[0,255] */
    var HSLColor = function(hue, saturation, lightness, opacity) {
        this.hue = clamp(hue);
        this.saturation = clamp(saturation);
        this.lightness = clamp(lightness);
        this.opacity = clamp(opacity);
    };
    HSLColor.prototype.copy = function() {
        return new HSLColor(this.hue, this.saturation,
                            this.lightness, this.opacity);
    };
    HSLColor.prototype.shade = function(factor) {
        var s = clamp(this.saturation * factor);
        var l = clamp(this.lightness * factor);
        return new HSLColor(this.hue, s, l, this.opacity);
    };
    HSLColor.prototype.lighten = function() {
        return this.shade(1.3);
    };
    HSLColor.prototype.darken = function() {
        return this.shade(0.7);
    };
    HSLColor.prototype.rgbaColor = function() {
        return Color.from_hls(this.hue*360/256, this.lightness/255,
                              this.saturation/255, this.opacity);
    };
    HSLColor.prototype.rgbString = function() {
        var color = this.rgbaColor();
        return "rgb("+Math.round(color.red)+","+Math.round(color.green)+","+
            Math.round(color.blue)+")";
    };
    HSLColor.prototype.rgbaString = function() {
        var color = this.rgbaColor();
        return "rgba("+Math.round(color.red)+","+Math.round(color.green)+","+
            Math.round(color.blue)+","+(color.alpha/255)+")";
    };

    HSLColor.from_color = function(color) {
        var hls = color.to_hls();
        return new HSLColor(hls[0]*256/360, hls[2]*255, hls[1]*255,
                            color.alpha);
    };
    HSLColor.from_rgba = function(r, g, b, a) {
        return HSLColor.from_color(new Color(r, g, b, a));
    };
    HSLColor.equal = function(a, b) {
        if (a === b) { return true; }
        return (a.hue        === b.hue &&
                a.saturation === b.saturation &&
                a.lightness  === b.lightness &&
                a.opacity    === b.opacity);
    };

    return HSLColor;
});
