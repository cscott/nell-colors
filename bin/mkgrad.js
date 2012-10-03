#!/usr/bin/node
/** THIS SCRIPT generates the icons/color-wheel.svg file used in the
 *  brush dialog.
 */

/*------------------------------------------------------------------------*/

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}
function rgbstring(r, g, b) {
  return "rgb("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")";
}

var R = 256;
console.log('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"');
console.log('     viewBox="0 0 '+(2*R)+' '+(2*R)+'">');
console.log('<defs>');
var hue;
for (hue=0; hue<256; hue++) {
    var edge = rgbstring.apply(null, hslToRgb(hue/256, 1, 0.5));
    var middle=rgbstring.apply(null, hslToRgb(hue/256, 0.5, 0.5));
    var center=rgbstring.apply(null, hslToRgb(hue/256, 0, 0.5));
    console.log(' <radialGradient id="hue'+hue+'" cx="'+R+'" cy="'+R+'" r="'+R+'" fx="'+R+'" fy="'+R+'" gradientUnits="userSpaceOnUse">');
    console.log('  <stop offset="0%" style="stop-color:'+center+'" />');
    console.log('  <stop offset="50%" style="stop-color:'+middle+'" />');
    console.log('  <stop offset="100%" style="stop-color:'+edge+'" />');
    console.log(' </radialGradient>');
}
console.log('</defs>');
console.log('<g>');
for (hue=0; hue<256; hue++) {
    var x1 =  (Math.cos(2*Math.PI*(hue-0.75)/256) * R) + R;
    var y1 = -(Math.sin(2*Math.PI*(hue-0.75)/256) * R) + R;
    var x2 =  (Math.cos(2*Math.PI*(hue+0.75)/256) * R) + R;
    var y2 = -(Math.sin(2*Math.PI*(hue+0.75)/256) * R) + R;

    console.log('<path d="M'+R+','+R+' L'+x1+','+y1+' A'+R+','+R+' 0 0,0 '+x2+','+y2+' Z" fill="url(#hue'+hue+')" />');
}
console.log('</g>');
/*
console.log('<circle cx="'+R+'" cy="'+R+'" r="'+R+'" fill="black" opacity="0.2" />');
console.log('<circle cx="'+R+'" cy="'+R+'" r="'+R+'" fill="white" opacity="0" />');
*/
console.log('</svg>');
