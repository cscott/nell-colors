/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./color','./coords'], function(Color, Coords) {
    'use strict';
    /** HSL Color wheel widget.
     */
    var ColorWheel = function(domElement, containerElement) {
        this.domElement = domElement;
        this.container = containerElement || domElement;
        this.hue = this.saturation = this.lightness = null;
        this.setHSL(0,0,0);
        // add event handlers.
        var addEvent = function(type, func, elem) {
            (elem || this.container).addEventListener(type, func, true);
        }.bind(this);
        var removeEvent = function(type, func, elem) {
            (elem || this.container).removeEventListener(type, func, true);
        }.bind(this);
        var handleMouseDown, handleMouseMove, handleMouseUp, handleMouseOut;
        handleMouseDown = function(event) {
            this._updateThumbFromEvent(event);
            this.domElement.querySelector('.color').focus();
            if (event.type==='mousedown') {
                addEvent('mousemove', handleMouseMove);
                addEvent('mouseup', handleMouseUp);
                addEvent('mouseout', handleMouseOut);
            } else {
                addEvent('touchmove', handleMouseMove);
                addEvent('touchend', handleMouseUp);
                addEvent('touchcancel', handleMouseUp);
                addEvent('touchleave', handleMouseUp);
                event.preventDefault();
            }
        }.bind(this);
        handleMouseMove = function(event) {
            this._updateThumbFromEvent(event);
        }.bind(this);
        handleMouseOut = function(event) {
            var related = event.relatedTarget, target = this;
            // For mousenter/leave call the handler if related is outside the
            // target.
            // NB: No relatedTarget if the mouse left/entered the browser window
            if (!related || (related !== target && !target.contains(related))) {
                // emualate mouseleave event
                handleMouseUp(event);
            }
        };
        handleMouseUp = function(event) {
            this._updateThumbFromEvent(event);
            if (event.type==='mouseup' || event.type==='mouseout') {
                removeEvent('mousemove', handleMouseMove);
                removeEvent('mouseup', handleMouseUp);
                removeEvent('mouseout', handleMouseOut);
            } else {
                removeEvent('touchmove', handleMouseMove);
                removeEvent('touchend', handleMouseUp);
                removeEvent('touchcancel', handleMouseUp);
                removeEvent('touchleave', handleMouseUp);
            }
        }.bind(this);
        addEvent('mousedown', handleMouseDown, this.domElement);
        addEvent('touchstart', handleMouseDown, this.domElement);

        var handleWheelKey = function(e) {
            var INCR = 2;
            e = e || document.parentWindow.event;
            var kc = e.keyCode != null ? e.keyCode : e.charCode;
            var h = this.hue;
            var s = this.saturation;
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
            e.stopPropagation(); e.preventDefault();
            if (h < 0) { h = 255; }
            if (h > 255) { h = 0; }
            s = Math.max(0, Math.min(s, 255));
            this.hue = h;
            this.saturation = s;
            this._updateThumbPosition();
            this._updateThumbColor();
            this.hsCallback(h,s); // let clients know hue/sat has been updated.
            return false;
        };
        addEvent('keypress', handleWheelKey, this.domElement);
    };
    ColorWheel.prototype = {};
    ColorWheel.prototype._pol2xy = function(theta, r, size) {
        if (!size) {
            size = this.domElement.querySelector('.color').clientWidth;
        }
        var theta_rad = 2*Math.PI*theta/256;
        var r_scaled = r*(size/2)/255;
        var x = Math.cos(theta_rad) * r_scaled;
        var y = -Math.sin(theta_rad) * r_scaled;
        return { x: x, y: y }; /* origin is center of wheel */
    };
    ColorWheel.prototype._updateThumbFromEvent = function(event) {
        if (event.touches) { // synthesize new event w/ first touch
            if (event.touches.length===0) { return; }
            // synthesize new event with data from first touch
            event = {
                type: event.type,
                pageX: event.touches[0].pageX,
                pageY: event.touches[0].pageY,
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY,
                target: event.touches[0].target || event.target ||
                    event.srcElement
            };
        }
        var inner = this.domElement.querySelector('.color');
        var coords = Coords.getRelativeEventPosition(event, inner);
        var ox = coords.x - inner.offsetWidth/2;
        var oy = coords.y - inner.offsetHeight/2;
        var x = ox / (inner.clientHeight/2);
        var y = oy / (inner.clientHeight/2);
        var theta = Math.atan2(-y,x)/(2*Math.PI), r = Math.sqrt(x*x + y*y);
        if (theta < 0) { theta += 1; }
        if (r > 1) { ox = oy = null; }
        // set hue/sat
        this.hue = Math.round(Math.min(theta*256, 255));
        this.saturation = Math.round(Math.min(r*255, 255));
        this._updateThumbPosition(ox, oy);
        this._updateThumbColor();
        // let clients know this has been updated.
        this.hsCallback(this.hue,this.saturation);
    };
    ColorWheel.prototype._updateThumbPosition = function(x, y) {
        var pos = { x: x, y: y };
        if (typeof(pos.x)!=='number') {
            pos = this._pol2xy(this.hue, this.saturation);
        }
        var thumb = this.domElement.querySelector('.thumb');
        var transform = Math.round(pos.x)+'px,'+Math.round(pos.y)+'px';
        // the '3d' is actually very important here: it enables
        // GPU acceleration of this transform on webkit
        thumb.style.WebkitTransform =
            'translate3d('+transform+',0)';
        thumb.style.MozTransform = thumb.style.transform =
            'translate('+transform+')';
    };
    ColorWheel.prototype._updateThumbColor = function() {
        var thumb = this.domElement.querySelector('.thumb');
        var color = Color.from_hls(this.hue*360/256, this.lightness/255,
                                   this.saturation/255, 255);
        thumb.style.color = color.to_string().substring(0, 7);
    };
    ColorWheel.prototype.setHSL = function(h, s, l) {
        var hsChanged = (this.hue!==h || this.saturation!==s);
        var lChanged = (this.lightness!==l);
        if (hsChanged) {
            this.hue = h;
            this.saturation = s;
            this._updateThumbPosition();
        }
        if (lChanged) {
            this.setLightness(l); // implicitly calls _updateThumbColor()
        } else if (hsChanged) {
            this._updateThumbColor();
        }
    };
    ColorWheel.prototype.setLightness = function(lightness/* [0,255] */) {
        if (lightness === this.lightness) { return; }
        this.lightness = lightness;
        var white = this.domElement.querySelector('.white');
        var black = this.domElement.querySelector('.black');
        lightness /= 255;
        if (lightness < 0.5) {
            white.style.opacity = 0;
            black.style.opacity = 1 - (lightness*2);
        } else {
            white.style.opacity = (lightness*2)-1;
            black.style.opacity = 0;
        }
        this._updateThumbColor();
    };
    ColorWheel.prototype.onResize = function() {
        this._updateThumbPosition();
    };
    ColorWheel.prototype.hsCallback = function(hue, saturation) {
        /* override to receive updates */
    };


    return ColorWheel;
});
