/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false, document:false, window:false */
define(['domReady!', 'text!./brushdialog.html', './brush', './color', './colorwheel', './coords', './compat', './drawcommand', './hslcolor', './iscroll', './layer', './slider'], function(document, innerhtml, Brush, Color, ColorWheel, Coords, Compat, DrawCommand, HSLColor, iScroll, Layer, Slider) {
    var noDefault = function(f) {
        return function(event) {
            event.preventDefault(); /* don't change history on click */
            f(event);
        };
    };

    var BrushPreview = function(domElement) {
        this.domElement = domElement;
        this.width = this.domElement.clientWidth;
        this.height= this.domElement.clientHeight;
        this.layer = new Layer();
        this.layer.resize(this.width, this.height,
                          window.devicePixelRatio || 1);
        this.domElement.appendChild(this.layer.domElement);
        this.lastBrush = new Brush(Color.BLACK/* ensure we do first update */);
        this.setFromBrush(this.lastBrush);
    };
    BrushPreview.prototype.setFromBrush = function(brush) {
        this.type = brush.type;
        this.size = Math.round(brush.size);
        this.spacing = Math.round(brush.spacing*100);
        this.opacity = brush.opacity*255;
    };
    BrushPreview.prototype.toBrush = function(rgbColor) {
        return new Brush(rgbColor, this.type, this.size,
                         this.opacity/255, this.spacing/100);
    };
    BrushPreview.prototype.update = function() {
        /* don't let preview opacity go below 20/255 */
        var brush = new Brush(Color.WHITE, this.type, this.size,
                              Math.max(20, this.opacity)/255, this.spacing/100);
        if (brush.equals(this.lastBrush)) { return; /* unneeded update */ }
        this.lastBrush = brush;
        this.layer.clear();
        // draw a sine wave with NUM_POINTS points
        var NUM_POINTS = 30;
        var minx = brush.size/2; /* half maximum brush size */
        var maxx = this.width - minx;
        var miny = brush.size/2; /* again, half max brush size */
        var maxy = this.height - miny;
        var i, theta, pos = { x:0, y:0 };
        this.layer.execCommand(DrawCommand.create_draw_start(), brush);
        for (i=0; i<NUM_POINTS; i++) {
            // stroke looks nicer if we trim edges of sine wave cycle
            theta = (i/(NUM_POINTS-1)) * 0.8 + 0.1;
            pos.x = minx + i*(maxx-minx)/(NUM_POINTS-1);
            pos.y = miny + (0.5 + Math.sin(2*Math.PI*theta)/2) * (maxy-miny);
            this.layer.execCommand(DrawCommand.create_draw(pos), brush);
        }
        this.layer.execCommand(DrawCommand.create_draw_end(), brush);
    };

    /* global var to ensure that multiple brush dialogs (if we ever do that)
     * have different <input> ids. */
    var cnt=0;

    var BrushDialog = function(brushpane, hidePaneSwitcher) {
        this.id = (cnt++); /* unique for each BrushDialog */
        this.brushpane = brushpane;
        /* fill in the markup! */
        this.brushpane.innerHTML = innerhtml;
        /* hide pane switcher if requested */
        if (hidePaneSwitcher) {
            brushpane.querySelector('.page_select').style.display='none';
        }
        /* brush preview */
        var preview = this.preview =
            new BrushPreview(brushpane.querySelector('.stroke'));

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
            var e = brushpane.querySelector("."+p+"_select");
            e.addEventListener('click',
                               noDefault(this.switchPane.bind(this, p)),
                               false);
        }.bind(this));
        this.switchPane(PAGES[0]); /* start on first pane */

        /* set up close button event handler */
        brushpane.querySelector(".closer")
            .addEventListener("click", noDefault(function(event) {
                this.close();
                this._invokeCallback();
            }.bind(this)), false);

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
        var preview_update = onAnim('preview_update', function() {
            preview.update();
        });
        var updateColorFromInputs = function() {
            var c = colorFromInputs();
            updateColor(c);
            wheel_setHSL(c.hue, c.saturation, c.lightness);
            if (preview.opacity !== c.opacity) {
                preview.opacity = c.opacity;
                preview_update();
            }
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
        var spacing_callbacks = {};
        Slider.createSlider({
            inp: assignID('brush_spacing'),
            range: [5,200],
            inc: "1",
            clickJump: true,
            hideInput: true,
            callbacks: spacing_callbacks
        });
        spacing_callbacks.update = [function() {
            var input = brushpane.querySelector('input.brush_spacing');
            preview.spacing = parseInt(input.value, 10) || 5;
            brushpane.querySelector('.spacing .caption').
                setAttribute('data-amount', preview.spacing);
            preview_update();
        }];
        var size_callbacks = {};
        Slider.createSlider({
            inp: assignID('brush_size'),
            range: [1,129],
            inc: "1",
            clickJump: true,
            hideInput: true,
            callbacks: size_callbacks
        });
        size_callbacks.update = [function() {
            var input = brushpane.querySelector('input.brush_size');
            preview.size = parseInt(input.value, 10) || 1;
            brushpane.querySelector('.size .caption').
                setAttribute('data-amount', preview.size);
            preview_update();
        }];
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

        var updateBrushType = function() {
            var scroll = this;
            var brush = preview.toBrush();
            brush.type = Brush.Types[scroll.currPageX];
            if (brush.type === preview.type) {
                return; // break cycle
            }
            brush.setToDefaultSpacing();
            preview.setFromBrush(brush);
            preview_update();
        };
        var brushes = brushpane.querySelector('.shape > .scrollwrapper');
        var brushHeight = brushes.querySelector('.allbrushes').offsetHeight;
        var brushscroll = this.brushscroll = new iScroll(brushes, {
            vScroll: false, snap: brushHeight,
            onAnimationEnd: updateBrushType
        });
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
        /* override preview.setFromBrush method to ensure that iScroll and
         * sliders are kept in sync */
        preview.setFromBrush = (function(super_setFromBrush) {
            var id = this.id;
            return function(brush) {
                super_setFromBrush.call(this, brush);
                // update iScroll window
                brushscroll.scrollToPage(Brush.Types[this.type]);
                // update brush property sliders
                [['size', this.size], ['spacing', this.spacing]].
                    forEach(function(a) {
                        var input =
                            brushpane.querySelector('input.brush_'+a[0]);
                        input.value = a[1];
                        Slider.updateSlider('brush_'+a[0]+'_'+id);
                        var caption =
                            brushpane.querySelector('.'+a[0]+' .caption');
                        caption.setAttribute('data-amount', a[1]);
                    });
            };
        }.bind(this))(preview.setFromBrush);
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
        ['.swatches > .old > span'].forEach(function(sel) {
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
        ['.swatches > .new > span'].forEach(function(sel) {
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
    BrushDialog.prototype.open = function(brush, firstPane, callback) {
        this.callback = callback;
        // set up brush (and adjust sliders)
        this.preview.setFromBrush(brush);
        this.preview.update();
        // set up color and oldcolor
        var hslColor = HSLColor.from_color(brush.color);
        hslColor.opacity = this.preview.opacity; /* brush.color is opaque */
        this._setInputs(hslColor);
        this._setInputs(hslColor, 'old_color_');
        this._updateColor(hslColor);
        this._updateOldColor(hslColor);
        this.wheel.setHSL(hslColor.hue, hslColor.saturation,
                          hslColor.lightness);
        // bind to window.resize
        this._resize = this.onResize.bind(this);
        window.addEventListener('resize', this._resize, false);
        this.onResize();
        // switch panes (if necessary)
        // then make visible (after brush pane switch has been processed)
        var panes = this.brushpane.querySelector('.panes');
        var makeVisible = function() {
            this.brushpane.classList.add('visible');
            ['transitionend','oTransitionEnd','webkitTransitionEnd'].
                forEach(function(evname) {
                    panes.removeEventListener(evname, makeVisible, true);
                });
        }.bind(this);
        if (this.switchPane(firstPane)) {
            // wait for pane transition to end before making visible
            ['transitionend','oTransitionEnd','webkitTransitionEnd'].
                forEach(function(evname) {
                    panes.addEventListener(evname, makeVisible, true);
                });
        } else {
            makeVisible();
        }
    };
    BrushDialog.prototype.switchPane = function(whichPane) {
        // normalize arg; 'brush' is default pane.
        whichPane = (whichPane==='color') ? whichPane : 'brush';
        if (this.brushpane.classList.contains(whichPane)) {
            return false; // no change made
        }
        var classList = this.brushpane.classList;
        ['color', 'brush'].forEach(function(pane) {
            if (pane===whichPane) {
                classList.add(pane);
            } else {
                classList.remove(pane);
            }
        });
        return true; // change made
    };
    BrushDialog.prototype.onResize = function() {
        // adjust iScroll paging
        var brushHeight =
            this.brushpane.querySelector('.allbrushes').offsetHeight;
        this.brushscroll.options.snap = brushHeight;
        this.brushscroll.refresh();
        this.brushscroll.scrollToPage(Brush.Types[this.preview.type],
                                      this.brushscroll.currPageY, 0);
        // adjust colorwheel thumb
        this.wheel.onResize();
    };
    BrushDialog.prototype.close = function() {
        window.removeEventListener('resize', this._resize, false);
        /* this method does *not* invoke the callback */
        /* ie, it's more akin to 'cancel' */
        this.brushpane.classList.remove('visible');
    };
    BrushDialog.prototype._invokeCallback = function() {
        var hslColor = this._colorFromInputs();
        // convert the color to rgb and make opaque (by adding to opaque black)
        var rgbColor = hslColor.rgbaColor().add(Color.BLACK);
        var brush = this.preview.toBrush(rgbColor);
        if (this.callback) {
            this.callback.call(null, brush);
        }
    };
    return BrushDialog;
});
