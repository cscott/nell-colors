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
define(['domReady!', './src/color', './src/compat', './src/dom', './src/iscroll', './src/slider'], function(document, Color, Compat, Dom, iScroll, Slider) {
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

function getAbsolutePosition(element) {
     if (element.getBoundingClientRect) {
      // roughly, ".offset()" from zepto.js
      var obj = element.getBoundingClientRect();
      return {
        x: obj.left + document.body.scrollLeft,
        y: obj.top + document.body.scrollTop,
      };
     }
     var r = { x: element.offsetLeft, y: element.offsetTop };
     if (element.offsetParent) {
       var tmp = getAbsolutePosition(element.offsetParent);
       r.x += tmp.x;
       r.y += tmp.y;
     }
     return r;
};
/**
 * Retrieve the coordinates of the given event relative to the center
 * of the widget.
 *
 * @param event
 *   A mouse-related DOM event.
 * @param reference
 *   A DOM element whose position we want to transform the mouse coordinates to.
 * @return
 *    A hash containing keys 'x' and 'y'.
 */
function getRelativeCoordinates(event, reference) {
     var x, y;
     event = event || window.event;
     var el = event.target || event.srcElement;

     if (!window.opera && typeof event.offsetX != 'undefined') {
       // Use offset coordinates and find common offsetParent
       var pos = { x: event.offsetX, y: event.offsetY };

       // Send the coordinates upwards through the offsetParent chain.
       var e = el;
       while (e) {
         e.mouseX = pos.x;
         e.mouseY = pos.y;
         pos.x += e.offsetLeft;
         pos.y += e.offsetTop;
         e = e.offsetParent;
       }

       // Look for the coordinates starting from the reference element.
       var e = reference;
       var offset = { x: 0, y: 0 }
       while (e) {
         if (typeof e.mouseX != 'undefined') {
           x = e.mouseX - offset.x;
           y = e.mouseY - offset.y;
           break;
         }
         offset.x += e.offsetLeft;
         offset.y += e.offsetTop;
         e = e.offsetParent;
       }

       // Reset stored coordinates
       e = el;
       while (e) {
         e.mouseX = undefined;
         e.mouseY = undefined;
         e = e.offsetParent;
       }
     }
     else {
       // Use absolute coordinates
       var pos = getAbsolutePosition(reference);
       x = event.pageX  - pos.x;
       y = event.pageY - pos.y;
     }
     // Subtract distance to middle
     return { x: x, y: y };
}

var pol2xy = function(theta, r, size) {
  if (!size) {
    size = document.querySelector('#brushpane .wheel > .color').clientWidth;
  }
  var theta_rad = 2*Math.PI*theta/256;
  var r_scaled = r*(size/2)/255;
  var x = Math.cos(theta_rad) * r_scaled;
  var y = -Math.sin(theta_rad) * r_scaled;
  return [x + (size/2), y + (size/2)];
};
var _drawWheel = onAnim('_drawWheel', function(lightness) {
  var color = document.querySelector('#brushpane .wheel > .color');
  var white = color.querySelector('.white');
  var black = color.querySelector('.black');
  lightness /= 255;
  if (lightness < 0.5) {
    white.style.opacity = 0;
    black.style.opacity = 1 - (lightness*2);
  } else {
    white.style.opacity = (lightness*2)-1;
    black.style.opacity = 0;
  }
});
var drawWheel = (function() {
  var lastLightness = null;
  return function() {
    var lightness = parseInt(document.getElementById('color_lightness').value,
                             10) || 0;
    if (lightness === lastLightness) { return; }
    lastLightness = lightness;
    _drawWheel(lightness);
  };
})();
var updateColorFromInputs = window.updateColorFromInputs = function() {
  var hsla = ["color_hue", "color_saturation", "color_lightness", "brush_opacity"].map(function(id) {
    return parseInt(document.getElementById(id).value, 10) || 0;
  });
  updateColor.apply(null, hsla);
  drawWheel();
};
function updateOldColorFromInputs() {
  var hsla = ["color_hue", "color_saturation", "color_lightness", "brush_opacity"].map(function(id) {
    return parseInt(document.getElementById('old_'+id).value, 10) || 0;
  });
  updateOldColor.apply(null, hsla);
}
function updateOldColor(hue, saturation, lightness, opacity) {
  var color = Color.from_hls(hue*360/256, lightness/255, saturation/255, opacity);
  ['.swatches > .old'].forEach(function(sel) {
      var e = document.querySelector('#brushpane '+sel);
      e.style.color = rgbastring(color);
  });
}
/* hue=[0,255], sat=[0,255], lightness=[0,255], opacity=[0,255] */
var updateColor = onAnim('updateColor', function(hue, saturation, lightness, opacity) {
  var color = Color.from_hls(hue*360/256, lightness/255, saturation/255, opacity);
  ['.color_select > span','.opacity_options .fd-slider-bar','.wheel > .thumb'].forEach(function(sel) {
      var e = document.querySelector('#brushpane '+sel);
      e.style.color = rgbstring(color);
  });
  ['.swatches > .new'].forEach(function(sel) {
      var e = document.querySelector('#brushpane '+sel);
      e.style.color = rgbastring(color);
  });
  // saturated version of color
  ['.lightness .fd-slider-inner'].forEach(function(sel) {
      var e = document.querySelector('#brushpane '+sel);
      e.style.color = rgbstring(Color.from_hls(hue*360/256, 0.5, 1));
  });
});
function pageLoaded() {
  var brushpane = document.querySelector("#brushpane");
  var PAGES = ['color', 'brush'];
  PAGES.forEach(function(p) {
    var e = document.querySelector("#brushpane ."+p+"_select");
    e.addEventListener('click', function(event) {
       PAGES.forEach(function(pp) { brushpane.classList.remove(pp); });
       brushpane.classList.add(p);
       event.preventDefault(); /* don't change history */
    }, false);
  });
  document.querySelector("#brushpane .closer").addEventListener("click",
    function(event) {
       brushpane.classList.remove('visible');
       event.preventDefault(); /* don't change history */
    }, false);
  ['size','spacing'].forEach(function(type) {
    ['minus','plus'].forEach(function(dir) {
       var e = document.querySelector('#brushpane .'+type+' .'+dir);
       e.addEventListener("click", function(event) {
         Slider.increment('brush_'+type, (dir==='minus')?-1:1);
         event.preventDefault();
       });
    });
  });
  var setLightness = function(l) {
      document.getElementById('color_lightness').value=Math.round(l);
      Slider.updateSlider('color_lightness');
      updateColorFromInputs();
  };
  var setHSLA = function(h, s, l, a) {
    [['color_hue', h], ['color_saturation', s],
     ['color_lightness', l], ['brush_opacity', a]].forEach(function(a) {
      document.getElementById(a[0]).value=a[1];
      Slider.updateSlider(a[0]);
    });
    updateThumb();
    updateColorFromInputs();
  };
  ['white','black','old'].forEach(function(sw) {
    var e = document.querySelector('#brushpane .swatches > .'+sw);
    e.addEventListener("click", function(event) {
        if (sw==='white') {
           setLightness(255);
        } else if (sw==='black') {
           setLightness(0);
        } else {
           var oldhsla = ['color_hue', 'color_saturation',
                          'color_lightness', 'brush_opacity'].map(function(id){
             return parseInt(document.getElementById('old_'+id).value, 10) || 0;
           });
           setHSLA.apply(null, oldhsla);
        }
        event.preventDefault();
    });
  });
  var wheel = document.querySelector('#brushpane .wheel > .color');
  var updateThumbFromEvent = function(event) {
    if (event.touches) { // synthesize new event w/ first touch
      if (event.touches.length===0) { return; }
      // synthesize new event with data from first touch
      event = {
        type: event.type,
        pageX: event.touches[0].pageX,
        pageY: event.touches[0].pageY,
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
        target: event.touches[0].target || event.target || event.srcElement
      };
    }
    var coords = getRelativeCoordinates(event, wheel);
    var ox = coords.x, oy = coords.y;
    var x = (ox - (wheel.offsetWidth/2)) / (wheel.clientHeight/2);
    var y = (oy - (wheel.offsetHeight/2)) / (wheel.clientHeight/2);
    var theta = Math.atan2(-y,x)/(2*Math.PI), r = Math.sqrt(x*x + y*y);
    if (theta < 0) { theta += 1; }
    if (r > 1) { ox = oy = null; }
    // set hue/sat
    var h = Math.min(theta*256, 255), s = Math.min(r*255, 255);
    document.getElementById('color_hue').value=Math.round(h);
    document.getElementById('color_saturation').value=Math.round(s);
    updateThumb(h, s, ox, oy);
    updateColorFromInputs();
  };
  var updateThumb = onAnim('updateThumb', function(h, s, x, y) {
    if (typeof(h)!=='number') {
      h = parseInt(document.getElementById('color_hue').value, 10) || 0;
      s = parseInt(document.getElementById('color_saturation').value, 10) || 0;
    }
    if (typeof(x)!=='number') {
      var xy = pol2xy(h, s);
      x = xy[0], y = xy[1];
    }
    var thumb = document.querySelector('#brushpane .wheel > .thumb');
    var transform = Math.round(x)+'px,'+Math.round(y)+'px';
    // the '3d' is actually very important here: it enables
    // GPU acceleration of this transform on webkit
    thumb.style.WebkitTransform =
            'translate3d('+transform+',0)';
    thumb.style.MozTransform = thumb.style.transform =
            'translate('+transform;+')';
  });
  var handleMouseDown = function(event) {
    updateThumbFromEvent(event);
    if (event.type==='mousedown') {
      brushpane.addEventListener('mousemove', handleMouseMove, true);
      brushpane.addEventListener('mouseup', handleMouseUp, true);
      brushpane.addEventListener('mouseout', handleMouseOut, true);
    } else {
      brushpane.addEventListener('touchmove', handleMouseMove, true);
      brushpane.addEventListener('touchend', handleMouseUp, true);
      brushpane.addEventListener('touchcancel', handleMouseUp, true);
      brushpane.addEventListener('touchleave', handleMouseUp, true);
      event.preventDefault();
    }
  }
  var handleMouseMove = function(event) {
    updateThumbFromEvent(event);
  }
  var handleMouseOut = function(event) {
    var related = event.relatedTarget, target = this;
    // For mousenter/leave call the handler if related is outside the target.
    // NB: No relatedTarget if the mouse left/entered the browser window
    if (!related || (related !== target && !target.contains(related))) {
      // emualate mouseleave event
      handleMouseUp(event);
    }
  };
  var handleMouseUp = function(event) {
    updateThumbFromEvent(event);
    if (event.type==='mouseup' || event.type==='mouseout') {
      brushpane.removeEventListener('mousemove', handleMouseMove, true);
      brushpane.removeEventListener('mouseup', handleMouseUp, true);
      brushpane.removeEventListener('mouseout', handleMouseOut, true);
    } else {
      brushpane.removeEventListener('touchmove', handleMouseMove, true);
      brushpane.removeEventListener('touchend', handleMouseUp, true);
      brushpane.removeEventListener('touchcancel', handleMouseUp, true);
      brushpane.removeEventListener('touchleave', handleMouseUp, true);
    }
  };
  wheel.addEventListener('mousedown', handleMouseDown, true);
  wheel.addEventListener('touchstart', handleMouseDown, true);
  var handleWheelKey = function(e) {
    var INCR = 2;
    e = e || document.parentWindow.event;
    var kc = e.keyCode != null ? e.keyCode : e.charCode;
    var h = parseInt(document.getElementById('color_hue').value, 10) || 0;
    var s = parseInt(document.getElementById('color_saturation').value, 10)|| 0;
    switch (kc) {
    case 37: /* left */
      h-= INCR; break;
    case 39: /* right */
      h+= INCR; break;
    case 38: /* up */
    case 33: /* page up */
      s+= INCR; break;
    case 40: /* down */
    case 34: /* page down */
      s-= INCR; break;
    default:
      return true;
    }
    if (h < 0) h = 255; if (h > 255) h = 0;
    if (s < 0) s = 0;   if (s > 255) s = 255;
    document.getElementById('color_hue').value=Math.round(h);
    document.getElementById('color_saturation').value=Math.round(s);
    updateThumb();
    updateColorFromInputs();
    e.stopPropagation(); e.preventDefault();
    return false;
  };
  wheel.addEventListener('keypress', handleWheelKey, true);

  Slider.create();
  updateThumb();
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
