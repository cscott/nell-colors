/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false, document:false, window:false */
define(['domReady!', 'text!./brushdialog.html', './color', './colorwheel', './coords', './compat', './hslcolor', './iscroll', './slider'], function(document, innerhtml, Color, ColorWheel, Coords, Compat, HSLColor, iScroll, Slider) {
    var noDefault = function(f) {
        return function(event) {
            event.preventDefault(); /* don't change history on click */
            f(event);
        };
    };

    /* global var to ensure that multiple brush dialogs (if we ever do that)
     * have different <input> ids. */
    var cnt=0;

    var BrushDialog = function(brushpane) {
        this.id = (cnt++); /* unique for each BrushDialog */
        this.brushpane = brushpane;
        /* fill in the markup! */
        this.brushpane.innerHTML = innerhtml;

        var assignID = function(className) {
            var elem = brushpane.querySelector('input.'+className);
            elem.name = elem.id = className+'_'+this.id;
            return elem;
        }.bind(this);

        /* make input elements have unique ids */
        ['hue','saturation','lightness','opacity'].forEach(function(name) {
            ['color_','old_color_'].forEach(function(prefix) {
                assignID(prefix+name);
            }.bind(this));
        }.bind(this));

        var PAGES = ['brush', 'color'];
        PAGES.forEach(function(p) {
            brushpane.classList.remove(p);
            var e = brushpane.querySelector("."+p+"_select");
            e.addEventListener('click', noDefault(function(event) {
                PAGES.forEach(function(pp) { brushpane.classList.remove(pp); });
                brushpane.classList.add(p);
            }), false);
        });
        brushpane.classList.add(PAGES[0]); /* start on first pane */

        /* set up close button event handler */
        brushpane.querySelector(".closer")
            .addEventListener("click", noDefault(function(event) {
                this.close();
                this._invokeCallback();
            }), false);

        /* set up plus/minus button handlers */
        ['size','spacing'].forEach(function(type) {
            ['minus','plus'].forEach(function(dir) {
                var e = brushpane.querySelector('.'+type+' .'+dir);
                e.addEventListener("click", noDefault(function(event) {
                    Slider.increment('brush_'+type+'_'+this.id,
                                     (dir==='minus') ? -1 : 1);
                }.bind(this)));
            }.bind(this));
        }.bind(this));

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

        var colorFromInputs = this._colorFromInputs.bind(this);

        var updateColor = onAnim('updateColor', this._updateColor.bind(this));
        var updateOldColor = this._updateOldColor.bind(this);

        this.wheel = new ColorWheel(brushpane.querySelector('.wheel'),
                                    brushpane);
        this.wheel.hsCallback = function(hue, saturation) {
            var c = colorFromInputs();
            brushpane.querySelector('input.color_hue').value = hue;
            brushpane.querySelector('input.color_saturation').value= saturation;
            updateColor(new HSLColor(hue, saturation, c.lightness, c.opacity));
        }.bind(this);
        var wheel_setHSL = onAnim('wheel_setHSL', function(h, s, l) {
            this.wheel.setHSL(h, s, l);
        }.bind(this));
        var updateColorFromInputs = function() {
            var c = colorFromInputs();
            updateColor(c);
            wheel_setHSL(c.hue, c.saturation, c.lightness);
        };
        var updateOldColorFromInputs = function() {
            var c = colorFromInputs('old_color_');
            updateOldColor(c);
        };

        var setLightness = function(l) {
            brushpane.querySelector('input.color_lightness').value =
                Math.round(l);
            Slider.updateSlider('color_lightness_'+this.id);
            updateColorFromInputs();
        }.bind(this);
        var setHSLA = function(hslColor) {
            this._setInputs(hslColor);
            updateColorFromInputs();
        }.bind(this);
        ['white','black','old'].forEach(function(sw) {
            var e = brushpane.querySelector('.swatches > .'+sw);
            e.addEventListener("click", noDefault(function(event) {
                if (sw==='white') {
                    setLightness(255);
                } else if (sw==='black') {
                    setLightness(0);
                } else {
                    setHSLA(colorFromInputs('old_color_'));
                }
                event.target.focus();
            }));
        });

        // set up brush size/spacing sliders
        Slider.createSlider({
            inp: assignID('brush_spacing'),
            range: [5,300],
            inc: "1",
            clickJump: true,
            hideInput: true,
            callbacks: {
                update: []
            }
        });
        Slider.createSlider({
            inp: assignID('brush_size'),
            range: [1,128],
            inc: "1",
            clickJump: true,
            hideInput: true,
            callbacks: {
                update: []
            }
        });
        // set up lightness/opacity sliders
        var color_slider_callbacks = {};
        ['lightness', 'opacity'].forEach(function(id) {
            var elem = brushpane.querySelector('input.color_'+id);
            Slider.createSlider({
                inp: elem,
                range: [0, 255],
                inc: "1",
                clickJump: true,
                hideInput: true,
                callbacks: color_slider_callbacks
            });
        }.bind(this));
        // hook up update callback only after slider has been inited.
        // (otherwise we get a rogue update on the first animation frame)
        color_slider_callbacks.update = [updateColorFromInputs];

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
            if( kc === 37 || kc === 40 || kc === 46 || kc === 34) {
                // left, down, ins, page down
                brushscroll.scrollToPage('prev');
            } else if( kc === 39 || kc === 38 || kc === 45 || kc === 33) {
                // right, up, del, page up
                brushscroll.scrollToPage('next');
            } else {
                return true;
            }
            e.stopPropagation(); e.preventDefault();
            return false;
        }, true);

    };
    BrushDialog.prototype = {};
    BrushDialog.prototype._colorFromInputs = function(opt_prefix) {
        var prefix = opt_prefix || 'color_';
        var hsla = ['hue', 'saturation', 'lightness', 'opacity'];
        hsla = hsla.map(function(a) {
            var input = this.brushpane.querySelector('input.'+prefix+a);
            return parseInt(input.value, 10) || 0;
        }.bind(this));
        return new HSLColor(hsla[0], hsla[1], hsla[2], hsla[3]);
    };
    BrushDialog.prototype._setInputs = function(hslColor, opt_prefix) {
        var prefix = opt_prefix || 'color_';
        ['hue', 'saturation', 'lightness', 'opacity'].forEach(function(a) {
            var input = this.brushpane.querySelector('input.'+prefix+a);
            input.value = hslColor[a];
            Slider.updateSlider(prefix+a+'_'+this.id);
        }.bind(this));
    };
    BrushDialog.prototype._updateOldColor = function(hslColor) {
        var colorString = hslColor.rgbString();
        ['.swatches > .old'].forEach(function(sel) {
            var e = this.brushpane.querySelector(sel);
            e.style.color = colorString;
        }.bind(this));
    };
    BrushDialog.prototype._updateColor = function(hslColor) {
        var rgbString = hslColor.rgbString();
        var rgbaString = hslColor.rgbaString();
        ['.color_select > span',
         '.opacity_options .fd-slider-bar'].forEach(function(sel) {
            var e = this.brushpane.querySelector(sel);
            e.style.color = rgbString;
        }.bind(this));
        ['.swatches > .new'].forEach(function(sel) {
            var e = this.brushpane.querySelector(sel);
            e.style.color = rgbaString;
        }.bind(this));
        // saturated version of color
        var rgbSatString=new HSLColor(hslColor.hue, 255, 128, 255).rgbString();
        ['.lightness .fd-slider-inner'].forEach(function(sel) {
            var e = this.brushpane.querySelector(sel);
            e.style.color = rgbSatString;
        }.bind(this));
    };
    BrushDialog.prototype.open = function(hslColor, callback) {
        this.callback = callback;
        // set up color and oldcolor
        this._setInputs(hslColor);
        this._setInputs(hslColor, 'old_color_');
        this._updateColor(hslColor);
        this._updateOldColor(hslColor);
        this.wheel.setHSL(hslColor.hue, hslColor.saturation,
                          hslColor.lightness);
        // make visible
        this.brushpane.classList.add('visible');
    };
    BrushDialog.prototype.close = function() {
        /* this method does *not* invoke the callback */
        this.brushpane.classList.remove('visible');
    };
    BrushDialog.prototype._invokeCallback = function() {
        var color = this._colorFromInputs();
        if (this.callback) {
            this.callback.call(null, color);
        }
    };
    return BrushDialog;
});
