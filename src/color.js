/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false */
'use strict';
/** @namespace */
define(['./color-x11'], function(X11) {
    /**
     * @short_description: Color management and manipulation.
     *
     * #Color is a simple type for representing colors in Jutter.
     *
     * A #Color is expressed as a 4-tuple of values ranging from
     * zero to 255, one for each color channel plus one for the alpha.
     *
     * The alpha channel is fully opaque at 255 and fully transparent at 0.
     */

    var clamp = function(x) {
        return (x<0) ? 0 : (x>255) ? 255 : x;
    };
    var max = Math.max;
    var min = Math.min;

    /** Creates a new #Color with the given values.
     *  red: red component of the color, between 0 and 255
     *  green: green component of the color, between 0 and 255
     *  blue: blue component of the color, between 0 and 255
     *  alpha: alpha component of the color, between 0 and 255
     */
    var Color = function(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    };
    Color.prototype = {
        copy: function() {
            return new Color(this.red, this.green, this.blue, this.alpha);
        },
        set: function(r, g, b, a) {
            this.red =   r;
            this.green = g;
            this.blue =  b;
            this.alpha = a;
        },
        set_from_color: function(c) {
            this.set(c.red, c.green, c.blue, c.alpha);
        },
        /**
         * Returns a textual specification of @color in the hexadecimal form
         * <literal>&num;rrggbbaa</literal>, where <literal>r</literal>,
         * <literal>g</literal>, <literal>b</literal> and <literal>a</literal> are
         * hexadecimal digits representing the red, green, blue and alpha components
         * respectively.
         */
        to_string: function() {
            function x2(n) {
                var s = n.toString(16);
                while (s.length < 2) {
                    s = '0' + s;
                }
                return s;
            }
            return '#'+x2(this.red)+x2(this.green)+x2(this.blue)+x2(this.alpha);
        },
        /**
         * Converts @color to the HLS format.  Returns
         * [@hue, @luminance, @saturation].
         *
         * The @hue value is in the 0 .. 360 range. The @luminance and
         * @saturation values are in the 0 .. 1 range.
         */
        to_hls: function() {
            var r = this.red/255.0;
            var g = this.green/255.0;
            var b = this.blue/255.0;

            var maxc = max(max(r, g), b);
            var minc = min(min(r, g), b);

            var l = (maxc + minc) / 2;
            var s = 0;
            var h = 0;

            if (maxc !== minc) {
                if (l <= 0.5) {
                    s = (maxc - minc) / (maxc + minc);
                } else {
                    s = (maxc - minc) / (2.0 - maxc - minc);
                }

                var delta = maxc - minc;

                if (r === maxc) {
                    h = (g - b) / delta;
                } else if (g === maxc) {
                    h = 2 + (b - r) / delta;
                } else if (b === maxc) {
                    h = 4 + (r - g) / delta;
                }

                h *= 60;

                if (h < 0) {
                    h += 360;
                }
            }

            return [h,l,s];
        },
        /**
         * Converts @color into a packed 32 bit integer, containing
         * all the four 8 bit channels used by #ClutterColor.
         *
         * Return value: a packed color
         */
        to_pixel: function() {
            return this.alpha |
                (this.blue << 8) |
                (this.green << 16) |
                (this.red << 24);
        },
        add: function(b) {
            return Color.add(this, b);
        },
        subtract: function(b) {
            return Color.subtract(this, b);
        },
        /**
         * Lightens @color by a fixed amount, and returns the changed color.
         */
        lighten: function() {
            return this.shade(1.3);
        },
        /**
         * Darkens @color by a fixed amount, and returns the changed color.
         */
        darken: function() {
            return this.shade(0.7);
        },
        shade: function(factor) {
            var i;
            var hls = this.to_hls();
            hls[1] *= factor;
            hls[2] *= factor;
            for (i=1; i<3; i++) {
                hls[i] = (hls[i] > 1) ? 1 : (hls[i] < 0) ? 0 : hls[i];
            }
            return Color.from_hls(hls[0], hls[1], hls[2], this.alpha);
        },
    };
    /** Make X11-style named color table. */
    var _x11_color_table = X11.make_color_table(Color);
    var _color_re = /\(\s*([\-+]?\d*\.?\d+)\s*(%\s*)?,\s*([\-+]?\d*\.?\d+)\s*(%\s*)?,\s*([\-+]?\d*\.?\d+)\s*(%\s*)?(,\s*([\-+]?\d*\.?\d+)\s*(%\s*)?)?\)/;
    var parse_rgba = function(str, has_alpha) {
        var m = str.trim().match(_color_re);
        if (!m) { return null; }
        var red = parseFloat(m[1]);
        if (m[2]) { red = (red/100) * 255; }
        var green = parseFloat(m[3]);
        if (m[4]) { green = (green/100) * 255; }
        var blue = parseFloat(m[5]);
        if (m[6]) { blue = (blue/100) * 255; }
        var alpha = 255;
        if (has_alpha) {
            if (!m[7]) { return null; }
            alpha = parseFloat(m[8]);
            if (m[9]) { alpha = alpha/100; }
            alpha *= 255;
        }
        return new Color(clamp(Math.round(red)),
                         clamp(Math.round(green)),
                         clamp(Math.round(blue)),
                         clamp(Math.round(alpha)));
    };
    var parse_hsla = function(str, has_alpha) {
        var m = str.trim().match(_color_re);
        if (!m) { return null; }

        var h = parseFloat(m[1]);
        if (m[2]) { h = (h/100) * 360; }
        h = (h < 0) ? 0 : (h>360) ? 360 : h;

        var l = parseFloat(m[3]);
        if (m[4]) { l = l/100; }
        l = (l < 0) ? 0 : (l > 1) ? 1 : l;

        var s = parseFloat(m[5]);
        if (m[6]) { s = s/100; }
        s = (s < 0) ? 0 : (s > 1) ? 1 : s;

        var alpha = 255;
        if (has_alpha) {
            if (!m[7]) { return null; }
            alpha = parseFloat(m[8]);
            if (m[9]) { alpha = alpha/100; }
            alpha *= 255;
        }
        alpha = clamp(Math.round(alpha));

        return Color.from_hls(h, l, s, alpha);
    };
    var parse_hex_color = function(str) {
        var red, green, blue, alpha;
        var r = parseInt(str, 16);
        if (r !== r) { return null; /* NaN */ }
        if (str.length === 8) {
            /* rrggbbaa */
            return Color.from_pixel(r);
        } else if (str.length === 6) {
            /* rrggbb */
            return Color.from_pixel((r<<8)|0xFF);
        } else if (str.length === 4) {
            /* rgba */
            red = (r>>12) & 0xF;
            green=(r>> 8) & 0xF;
            blue =(r>> 4) & 0xF;
            alpha=(r    ) & 0xF;
            return new Color(red*0x11, green*0x11, blue*0x11, alpha*0x11);
        } else if (str.length === 3) {
            /* rgb */
            red = (r>> 8) & 0xF;
            green=(r>> 4) & 0xF;
            blue =(r    ) & 0xF;
            return new Color(red*0x11, green*0x11, blue*0x11, 255);
        }
        return null; /* can't parse it */
    };

    /**
     * @str: a string specifiying a color
     *
     * Parses a string definition of a color, filling the
     * <structfield>red</structfield>, <structfield>green</structfield>,
     * <structfield>blue</structfield> and <structfield>alpha</structfield>
     * channels of @color.
     *
     * The format of @str can be either one of:
     *
     * <itemizedlist>
     * <listitem>
     *   <para>a standard name (as taken from the X11 rgb.txt file)</para>
     * </listitem>
     * <listitem>
     *   <para>an hexadecimal value in the form: <literal>&num;rgb</literal>,
     *   <literal>&num;rrggbb</literal>, <literal>&num;rgba</literal> or
     *   <literal>&num;rrggbbaa</literal></para>
     * </listitem>
     * <listitem>
     *   <para>a RGB color in the form: <literal>rgb(r, g, b)</literal></para>
     * </listitem>
     * <listitem>
     *   <para>a RGB color in the form: <literal>rgba(r, g, b, a)</literal></para>
     * </listitem>
     * <listitem>
     *   <para>a HSL color in the form: <literal>hsl(h, s, l)</literal></para>
     * </listitem>
     * <listitem>
     *   <para>a HSL color in the form: <literal>hsla(h, s, l, a)</literal></para>
     * </listitem>
     * </itemizedlist>
     *
     * where 'r', 'g', 'b' and 'a' are (respectively) the red, green, blue color
     * intensities and the opacity. The 'h', 's' and 'l' are (respectively) the
     * hue, saturation and luminance values.
     *
     * In the rgb() and rgba() formats, the 'r', 'g', and 'b' values are either
     * integers between 0 and 255, or percentage values in the range between 0%
     * and 100%; the percentages require the '%' character. The 'a' value, if
     * specified, can only be a floating point value between 0.0 and 1.0.
     *
     * In the hls() and hlsa() formats, the 'h' value (hue) it's an angle between
     * 0 and 360.0 degrees; the 'l' and 's' values (luminance and saturation) are
     * a floating point value between 0.0 and 1.0. The 'a' value, if specified,
     * can only be a floating point value between 0.0 and 1.0.
     *
     * Whitespace inside the definitions is ignored; no leading whitespace
     * is allowed.
     *
     * If the alpha component is not specified then it is assumed to be set to
     * be fully opaque.
     *
     * Return value: the parsed color, or null if parsing failed.
     */
    Color.from_string = function(str) {
        if (str.substr(0,3)==='rgb') {
            if (str.substr(0,4)==='rgba') {
                return parse_rgba(str.substr(4), true);
            }
            return parse_rgba(str.substr(3), false);
        }
        if (str.substr(0,3)==='hsl') {
            if (str.substr(0,4)==='hsla') {
                return parse_hsla(str.substr(4), true);
            }
            return parse_hsla(str.substr(3), false);
        }
        if (str.substr(0,1)==='#') {
            return parse_hex_color(str.substr(1));
        }
        // X11-style named colors
        if (str in _x11_color_table) {
            return _x11_color_table[str];
        }
        // can't parse / color not found.
        return null;
    };
    /**
     * @pixel: a 32 bit packed integer containing a color
     *
     * Converts @pixel from the packed representation of a four 8 bit channel
     * color to a #ClutterColor.
     */
    Color.from_pixel = function(pixel) {
        return new Color((pixel>>24) & 0xFF,
                         (pixel>>16) & 0xFF,
                         (pixel>> 8) & 0xFF,
                         (pixel    ) & 0xFF);
    };
    /**
     * @hue: hue value, in the 0 .. 360 range
     * @luminance: luminance value, in the 0 .. 1 range
     * @saturation: saturation value, in the 0 .. 1 range
     * @alpha: alpha value, in the 0...255 range
     *
     * Converts a color expressed in HLS (hue, luminance and saturation)
     * values into a #Color.
     */
    Color.from_hls = function(hue, luminance, saturation, alpha) {
        if (alpha === undefined) {
            alpha = 255;
        }

        hue /= 360.0;

        if (saturation === 0) {
            var l = luminance * 255;
            return new Color(l, l, l, alpha);
        }

        var tmp2;
        if (luminance <= 0.5) {
            tmp2 = luminance * (1.0 + saturation);
        } else {
            tmp2 = luminance + saturation - (luminance * saturation);
        }

        var tmp1 = 2.0 * luminance - tmp2;

        var tmp3 = [
            hue + 1.0 / 3.0,
            hue,
            hue - 1.0 / 3.0 ];
        var clr = [0,0,0];

        var i;
        for (i = 0; i < 3; i++) {
            if (tmp3[i] < 0) {
                tmp3[i] += 1.0;
            }

            if (tmp3[i] > 1) {
                tmp3[i] -= 1.0;
            }


            if (6.0 * tmp3[i] < 1.0) {
                clr[i] = tmp1 + (tmp2 - tmp1) * tmp3[i] * 6.0;
            } else if (2.0 * tmp3[i] < 1.0) {
                clr[i] = tmp2;
            } else if (3.0 * tmp3[i] < 2.0) {
                clr[i] = (tmp1 + (tmp2 - tmp1) * ((2.0 / 3.0) - tmp3[i]) * 6.0);
            } else {
                clr[i] = tmp1;
            }
        }

        return new Color(Math.round(clr[0]*255),
                         Math.round(clr[1]*255),
                         Math.round(clr[2]*255),
                         alpha);
    };
    /**
     * Compares two #Color<!-- -->s and checks if they are the same.
     *
     * Return value: %TRUE if the two colors are the same.
     */
    Color.equal = function(a, b) {
        if (a === b) { return true; }

        return (a.red   === b.red   &&
                a.green === b.green &&
                a.blue  === b.blue  &&
                a.alpha === b.alpha);
    };
    /**
     * Adds @a to @b and returns the resulting color.
     *
     * The alpha channel of @result is set as as the maximum value
     * between the alpha channels of @a and @b.
     */
    Color.add = function(a, b) {
        return new Color(clamp(a.red + b.red),
                         clamp(a.green + b.green),
                         clamp(a.blue + b.blue),
                         max(a.alpha, b.alpha));
    };
    /**
     * Subtracts @b from @a and returns the resulting color.
     *
     * This function assumes that the components of @a are greater than the
     * components of @b; the result is, otherwise, undefined.
     *
     * The alpha channel of @result is set as the minimum value
     * between the alpha channels of @a and @b.
     */
    Color.subtract = function(a, b) {
        return new Color(clamp(a.red - b.red),
                         clamp(a.green - b.green),
                         clamp(a.blue - b.blue),
                         min(a.alpha, b.alpha));
    };
    /**
     * @initial: the initial #Color
     * @finalc: the final #Color
     * @progress: the interpolation progress
     *
     * Interpolates between @initial and @final #Color<!-- -->s
     * using @progress
     */
    Color.interpolate = function(initial, finalc, progress) {
        return new Color(
            initial.red   + (finalc.red   - initial.red)   * progress,
            initial.green + (finalc.green - initial.green) * progress,
            initial.blue  + (finalc.blue  - initial.blue)  * progress,
            initial.alpha + (finalc.alpha - initial.alpha) * progress);
    };

    /** Named colors, for accessing global colors defined by Jutter. */
    Color.WHITE = Color.from_string("#ffffffff");
    Color.BLACK = Color.from_string("#000000ff");
    Color.RED = Color.from_string("#ff0000ff");
    Color.DARK_RED = Color.from_string("#800000ff");
    Color.GREEN = Color.from_string("#00ff00ff");
    Color.DARK_GREEN = Color.from_string("#008000ff");
    Color.BLUE = Color.from_string("#0000ffff");
    Color.DARK_BLUE = Color.from_string("#000080ff");
    Color.CYAN = Color.from_string("#00ffffff");
    Color.DARK_CYAN = Color.from_string("#008080ff");
    Color.MAGENTA = Color.from_string("#ff00ffff");
    Color.DARK_MAGENTA = Color.from_string("#800080ff");
    Color.YELLOW = Color.from_string("#ffff00ff");
    Color.DARK_YELLOW = Color.from_string("#808000ff");
    Color.GRAY = Color.from_string("#a0a0a4ff");
    Color.DARK_GRAY = Color.from_string("#808080ff");
    Color.LIGHT_GRAY = Color.from_string("#c0c0c0ff");
    Color.BUTTER = Color.from_string("#edd400ff");
    Color.BUTTER_LIGHT = Color.from_string("#fce94fff");
    Color.BUTTER_DARK = Color.from_string("#c4a000ff");
    Color.ORANGE = Color.from_string("#f57900ff");
    Color.ORANGE_LIGHT = Color.from_string("#fcaf3fff");
    Color.ORANGE_DARK = Color.from_string("#ce5c00ff");
    Color.CHOCOLATE = Color.from_string("#c17d11ff");
    Color.CHOCOLATE_LIGHT = Color.from_string("#e9b96eff");
    Color.CHOCOLATE_DARK = Color.from_string("#8f5902ff");
    Color.CHAMELEON = Color.from_string("#73d216ff");
    Color.CHAMELEON_LIGHT = Color.from_string("#8ae234ff");
    Color.CHAMELEON_DARK = Color.from_string("#4e9a06ff");
    Color.SKY_BLUE = Color.from_string("#3465a4ff");
    Color.SKY_BLUE_LIGHT = Color.from_string("#729fcfff");
    Color.SKY_BLUE_DARK = Color.from_string("#204a87ff");
    Color.PLUM = Color.from_string("#75507bff");
    Color.PLUM_LIGHT = Color.from_string("#ad7fa8ff");
    Color.PLUM_DARK = Color.from_string("#5c3566ff");
    Color.SCARLET_RED = Color.from_string("#cc0000ff");
    Color.SCARLET_RED_LIGHT = Color.from_string("#ef2929ff");
    Color.SCARLET_RED_DARK = Color.from_string("#a40000ff");
    Color.ALUMINIUM_1 = Color.from_string("#eeeeecff");
    Color.ALUMINIUM_2 = Color.from_string("#d3d7cfff");
    Color.ALUMINIUM_3 = Color.from_string("#babdb6ff");
    Color.ALUMINIUM_4 = Color.from_string("#888a85ff");
    Color.ALUMINIUM_5 = Color.from_string("#555753ff");
    Color.ALUMINIUM_6 = Color.from_string("#2e3436ff");
    Color.TRANSPARENT = Color.from_string("#00000000");

    return Color;
});
