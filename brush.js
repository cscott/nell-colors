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
define(['domReady!', './src/color', './src/colorwheel', './src/compat', './src/iscroll', './src/slider'], function(document, Color, ColorWheel, Compat, iScroll, Slider) {
    'use strict';


var rgbstring = function(color) {
  return "rgb("+Math.round(color.red)+","+Math.round(color.green)+","+Math.round(color.blue)+")";
};
var rgbastring = function(color) {
    return "rgba("+Math.round(color.red)+","+Math.round(color.green)+","+Math.round(color.blue)+","+(color.alpha/255)+")";
};

/* Memoize update function so that it is invoked later in a
 * requestAnimationFrame callback. */
var onAnim = (function() {
  var funcs = {};
  var lastArgs = {};
  var animateScheduled = false;
  var animate = function() {
    animateScheduled = false;
    Object.getOwnPropertyNames(funcs).forEach(function(name) {
      if (lastArgs[name]) {
        funcs[name].apply(null, lastArgs[name]);
        lastArgs[name] = null;
      }
    });
  };
  return function(name, f) {
    funcs[name] = f;
    return function() {
      lastArgs[name] = Array.prototype.slice.call(arguments);
      if (animateScheduled) { return; }
      Compat.requestAnimationFrame(animate);
      animateScheduled = true;
    };
  };
})();

var colorFromInputs = function(opt_prefix) {
    var prefix = opt_prefix || 'color_';
    var hlsa = ['hue','lightness','saturation','opacity'].map(function(id) {
        return parseInt(document.getElementById(prefix+id).value, 10) || 0;
    });
    return { h: hlsa[0], l: hlsa[1], s: hlsa[2], a: hlsa[3] };
};

function pageLoaded() {
  var brushpane = document.querySelector("#brushpane");
  var PAGES = ['color', 'brush'];
  PAGES.forEach(function(p) {
    var e = brushpane.querySelector("."+p+"_select");
    e.addEventListener('click', function(event) {
       PAGES.forEach(function(pp) { brushpane.classList.remove(pp); });
       brushpane.classList.add(p);
       event.preventDefault(); /* don't change history */
    }, false);
  });
  brushpane.querySelector(".closer").addEventListener("click",
    function(event) {
       brushpane.classList.remove('visible');
       event.preventDefault(); /* don't change history */
    }, false);
  ['size','spacing'].forEach(function(type) {
    ['minus','plus'].forEach(function(dir) {
       var e = brushpane.querySelector('.'+type+' .'+dir);
       e.addEventListener("click", function(event) {
         Slider.increment('brush_'+type, (dir==='minus')?-1:1);
         event.preventDefault();
       });
    });
  });

  var updateOldColor = function(hue, saturation, lightness, opacity) {
      var color = Color.from_hls(hue*360/256, lightness/255, saturation/255, opacity);
      ['.swatches > .old'].forEach(function(sel) {
          var e = brushpane.querySelector(sel);
          e.style.color = rgbastring(color);
      });
  };
  /* hue=[0,255], sat=[0,255], lightness=[0,255], opacity=[0,255] */
  var updateColor = onAnim('updateColor', function(hue, saturation, lightness, opacity) {
      var color = Color.from_hls(hue*360/256, lightness/255, saturation/255, opacity);
      ['.color_select > span','.opacity_options .fd-slider-bar'].forEach(function(sel) {
          var e = brushpane.querySelector(sel);
          e.style.color = rgbstring(color);
      });
      ['.swatches > .new'].forEach(function(sel) {
          var e = brushpane.querySelector(sel);
          e.style.color = rgbastring(color);
      });
      // saturated version of color
      ['.lightness .fd-slider-inner'].forEach(function(sel) {
          var e = brushpane.querySelector(sel);
          e.style.color = rgbstring(Color.from_hls(hue*360/256, 0.5, 1));
      });
  });

  var wheel = new ColorWheel(brushpane.querySelector('.wheel'), brushpane);
  wheel.hsCallback = function(hue, saturation) {
      var c = colorFromInputs();
      document.getElementById('color_hue').value = hue;
      document.getElementById('color_saturation').value = saturation;
      updateColor(hue, saturation, c.l, c.a);
  };
  var wheel_setHSL = onAnim('wheel_setHSL', function(h, s, l) {
      wheel.setHSL(h, s, l);
  });
  var updateColorFromInputs = window.updateColorFromInputs = function() {
      var c = colorFromInputs();
      updateColor(c.h, c.s, c.l, c.a);
      wheel_setHSL(c.h, c.s, c.l);
  };
  var updateOldColorFromInputs = function() {
      var c = colorFromInputs('old_color_');
      updateOldColor(c.h, c.s, c.l, c.a);
  };

  var setLightness = function(l) {
      document.getElementById('color_lightness').value=Math.round(l);
      Slider.updateSlider('color_lightness');
      updateColorFromInputs();
  };
  var setHSLA = function(h, s, l, a) {
    [['color_hue', h], ['color_saturation', s],
     ['color_lightness', l], ['color_opacity', a]].forEach(function(a) {
      document.getElementById(a[0]).value=a[1];
      Slider.updateSlider(a[0]);
    });
    updateColorFromInputs();
  };
  ['white','black','old'].forEach(function(sw) {
    var e = brushpane.querySelector('.swatches > .'+sw);
    e.addEventListener("click", function(event) {
        if (sw==='white') {
           setLightness(255);
        } else if (sw==='black') {
           setLightness(0);
        } else {
           var old = colorFromInputs('old_color_');
           setHSLA(old.h, old.s, old.l, old.a);
        }
        event.preventDefault();
    });
  });

  Slider.create();
  updateColorFromInputs();
  updateOldColorFromInputs();

  var updateBrush = function() {
    var scroll = this;
    console.log("Brush updated", scroll.currPageX);
  };
  var brushes = brushpane.querySelector('.shape > .scrollwrapper');
  var brushscroll = new iScroll(brushes, { vScroll: false, snap: 100, onAnimationEnd: updateBrush });
  /* listen to arrow key events on scroller */
  var shape = brushpane.querySelector('.shape');
  shape.addEventListener('keypress', function(e) {
    e = e || document.parentWindow.event;
    var kc = e.keyCode != null ? e.keyCode : e.charCode;
    if( kc == 37 || kc == 40 || kc == 46 || kc == 34) {
      // left, down, ins, page down
      brushscroll.scrollToPage('prev');
    } else if( kc == 39 || kc == 38 || kc == 45 || kc == 33) {
      // right, up, del, page up
      brushscroll.scrollToPage('next');
    } else return true;
    e.stopPropagation(); e.preventDefault();
    return false;
  }, true);
  brushpane.classList.add('visible');
}
// the domReady plugin ensures that we're running after the page has been
// loaded.
pageLoaded(); // the domReady plugin ensures that we're running
});
