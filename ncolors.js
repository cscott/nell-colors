
/**
 * @license RequireJS domReady 1.0.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint strict: false, plusplus: false */
/*global require: false, define: false, requirejs: false,
  window: false, clearInterval: false, document: false,
  self: false, setInterval: false */


define('domReady',[],function () {
    var isBrowser = typeof window !== "undefined" && window.document,
        isPageLoaded = !isBrowser,
        doc = isBrowser ? document : null,
        readyCalls = [],
        readyLoaderCalls = [],
        //Bind to a specific implementation, but if not there, try a
        //a generic one under the "require" name.
        req = requirejs || require || {},
        oldResourcesReady = req.resourcesReady,
        scrollIntervalId;

    function runCallbacks(callbacks) {
        for (var i = 0, callback; (callback = callbacks[i]); i++) {
            callback(doc);
        }
    }

    function callReady() {
        var callbacks = readyCalls,
            loaderCallbacks = readyLoaderCalls;

        if (isPageLoaded) {
            //Call the DOM ready callbacks
            if (callbacks.length) {
                readyCalls = [];
                runCallbacks(callbacks);
            }

            //Now handle DOM ready + loader ready callbacks.
            if (req.resourcesDone && loaderCallbacks.length) {
                readyLoaderCalls = [];
                runCallbacks(loaderCallbacks);
            }
        }
    }

    /**
     * Add a method to require to get callbacks if there are loader resources still
     * being loaded. If so, then hold off calling "withResources" callbacks.
     *
     * @param {Boolean} isReady: pass true if all resources have been loaded.
     */
    if ('resourcesReady' in req) {
        req.resourcesReady = function (isReady) {
            //Call the old function if it is around.
            if (oldResourcesReady) {
                oldResourcesReady(isReady);
            }

            if (isReady) {
                callReady();
            }
        };
    }

    /**
     * Sets the page as loaded.
     */
    function pageLoaded() {
        if (!isPageLoaded) {
            isPageLoaded = true;
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
            }

            callReady();
        }
    }

    if (isBrowser) {
        if (document.addEventListener) {
            //Standards. Hooray! Assumption here that if standards based,
            //it knows about DOMContentLoaded.
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", pageLoaded);

            //DOMContentLoaded approximation, as found by Diego Perini:
            //http://javascript.nwbox.com/IEContentLoaded/
            if (self === self.top) {
                scrollIntervalId = setInterval(function () {
                    try {
                        //From this ticket:
                        //http://bugs.dojotoolkit.org/ticket/11106,
                        //In IE HTML Application (HTA), such as in a selenium test,
                        //javascript in the iframe can't see anything outside
                        //of it, so self===self.top is true, but the iframe is
                        //not the top window and doScroll will be available
                        //before document.body is set. Test document.body
                        //before trying the doScroll trick.
                        if (document.body) {
                            document.documentElement.doScroll("left");
                            pageLoaded();
                        }
                    } catch (e) {}
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners.
        if (document.readyState === "complete") {
            pageLoaded();
        }
    }

    /** START OF PUBLIC API **/

    /**
     * Registers a callback for DOM ready. If DOM is already ready, the
     * callback is called immediately.
     * @param {Function} callback
     */
    function domReady(callback) {
        if (isPageLoaded) {
            callback(doc);
        } else {
            readyCalls.push(callback);
        }
        return domReady;
    }

    /**
     * Callback that waits for DOM ready as well as any outstanding
     * loader resources. Useful when there are implicit dependencies.
     * This method should be avoided, and always use explicit
     * dependency resolution, with just regular DOM ready callbacks.
     * The callback passed to this method will be called immediately
     * if the DOM and loader are already ready.
     * @param {Function} callback
     */
    domReady.withResources = function (callback) {
        if (isPageLoaded && req.resourcesDone) {
            callback(doc);
        } else {
            readyLoaderCalls.push(callback);
        }
        return domReady;
    };

    domReady.version = '1.0.0';

    /**
     * Loader Plugin API method
     */
    domReady.load = function (name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        } else {
            domReady(onLoad);
        }
    };

    /** END OF PUBLIC API **/

    return domReady;
});

/**
 * RequireJS plugin for loading image elements.
 * Author: C. Scott Ananian
 */
define('img',[], function() {
    return {
        load : function(name, req, onLoad, config) {
            // recurse to load the json file containing the drawing data
            if (config.isBuild || typeof document==='undefined') {
                // indicate that this plugin can't be inlined
                // XXX: improve plugin to convert to data:urls during
                //      optimization.
                onLoad(null);
            } else {
                var image = document.createElement('img');
                image.addEventListener('load', function() {
                    onLoad(image);
                });
                image.src = req.toUrl(name);
            };
        }
    };
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false */
/** @namespace */
define('src/color-x11',[], function() {
    
    var make_color_table = function(Color) {
        return {
            "snow":              new Color(255, 250, 250, 255),
            "ghost white":       new Color(248, 248, 255, 255),
            "GhostWhite":        new Color(248, 248, 255, 255),
            "white smoke":       new Color(245, 245, 245, 255),
            "WhiteSmoke":        new Color(245, 245, 245, 255),
            "gainsboro":         new Color(220, 220, 220, 255),
            "floral white":      new Color(255, 250, 240, 255),
            "FloralWhite":       new Color(255, 250, 240, 255),
            "old lace":          new Color(253, 245, 230, 255),
            "OldLace":           new Color(253, 245, 230, 255),
            "linen":             new Color(250, 240, 230, 255),
            "antique white":     new Color(250, 235, 215, 255),
            "AntiqueWhite":      new Color(250, 235, 215, 255),
            "papaya whip":       new Color(255, 239, 213, 255),
            "PapayaWhip":        new Color(255, 239, 213, 255),
            "blanched almond":   new Color(255, 235, 205, 255),
            "BlanchedAlmond":    new Color(255, 235, 205, 255),
            "bisque":            new Color(255, 228, 196, 255),
            "peach puff":        new Color(255, 218, 185, 255),
            "PeachPuff":         new Color(255, 218, 185, 255),
            "navajo white":      new Color(255, 222, 173, 255),
            "NavajoWhite":       new Color(255, 222, 173, 255),
            "moccasin":          new Color(255, 228, 181, 255),
            "cornsilk":          new Color(255, 248, 220, 255),
            "ivory":             new Color(255, 255, 240, 255),
            "lemon chiffon":     new Color(255, 250, 205, 255),
            "LemonChiffon":      new Color(255, 250, 205, 255),
            "seashell":          new Color(255, 245, 238, 255),
            "honeydew":          new Color(240, 255, 240, 255),
            "mint cream":        new Color(245, 255, 250, 255),
            "MintCream":         new Color(245, 255, 250, 255),
            "azure":             new Color(240, 255, 255, 255),
            "alice blue":        new Color(240, 248, 255, 255),
            "AliceBlue":         new Color(240, 248, 255, 255),
            "lavender":          new Color(230, 230, 250, 255),
            "lavender blush":    new Color(255, 240, 245, 255),
            "LavenderBlush":     new Color(255, 240, 245, 255),
            "misty rose":        new Color(255, 228, 225, 255),
            "MistyRose":         new Color(255, 228, 225, 255),
            "white":             new Color(255, 255, 255, 255),
            "black":             new Color(0, 0, 0, 255),
            "dark slate gray":   new Color(47, 79, 79, 255),
            "DarkSlateGray":     new Color(47, 79, 79, 255),
            "dark slate grey":   new Color(47, 79, 79, 255),
            "DarkSlateGrey":     new Color(47, 79, 79, 255),
            "dim gray":          new Color(105, 105, 105, 255),
            "DimGray":           new Color(105, 105, 105, 255),
            "dim grey":          new Color(105, 105, 105, 255),
            "DimGrey":           new Color(105, 105, 105, 255),
            "slate gray":        new Color(112, 128, 144, 255),
            "SlateGray":         new Color(112, 128, 144, 255),
            "slate grey":        new Color(112, 128, 144, 255),
            "SlateGrey":         new Color(112, 128, 144, 255),
            "light slate gray":  new Color(119, 136, 153, 255),
            "LightSlateGray":    new Color(119, 136, 153, 255),
            "light slate grey":  new Color(119, 136, 153, 255),
            "LightSlateGrey":    new Color(119, 136, 153, 255),
            "gray":              new Color(190, 190, 190, 255),
            "grey":              new Color(190, 190, 190, 255),
            "light grey":        new Color(211, 211, 211, 255),
            "LightGrey":         new Color(211, 211, 211, 255),
            "light gray":        new Color(211, 211, 211, 255),
            "LightGray":         new Color(211, 211, 211, 255),
            "midnight blue":     new Color(25, 25, 112, 255),
            "MidnightBlue":      new Color(25, 25, 112, 255),
            "navy":              new Color(0, 0, 128, 255),
            "navy blue":         new Color(0, 0, 128, 255),
            "NavyBlue":          new Color(0, 0, 128, 255),
            "cornflower blue":   new Color(100, 149, 237, 255),
            "CornflowerBlue":    new Color(100, 149, 237, 255),
            "dark slate blue":   new Color(72, 61, 139, 255),
            "DarkSlateBlue":     new Color(72, 61, 139, 255),
            "slate blue":        new Color(106, 90, 205, 255),
            "SlateBlue":         new Color(106, 90, 205, 255),
            "medium slate blue": new Color(123, 104, 238, 255),
            "MediumSlateBlue":   new Color(123, 104, 238, 255),
            "light slate blue":  new Color(132, 112, 255, 255),
            "LightSlateBlue":    new Color(132, 112, 255, 255),
            "medium blue":       new Color(0, 0, 205, 255),
            "MediumBlue":        new Color(0, 0, 205, 255),
            "royal blue":        new Color(65, 105, 225, 255),
            "RoyalBlue":         new Color(65, 105, 225, 255),
            "blue":              new Color(0, 0, 255, 255),
            "dodger blue":       new Color(30, 144, 255, 255),
            "DodgerBlue":        new Color(30, 144, 255, 255),
            "deep sky blue":     new Color(0, 191, 255, 255),
            "DeepSkyBlue":       new Color(0, 191, 255, 255),
            "sky blue":          new Color(135, 206, 235, 255),
            "SkyBlue":           new Color(135, 206, 235, 255),
            "light sky blue":    new Color(135, 206, 250, 255),
            "LightSkyBlue":      new Color(135, 206, 250, 255),
            "steel blue":        new Color(70, 130, 180, 255),
            "SteelBlue":         new Color(70, 130, 180, 255),
            "light steel blue":  new Color(176, 196, 222, 255),
            "LightSteelBlue":    new Color(176, 196, 222, 255),
            "light blue":        new Color(173, 216, 230, 255),
            "LightBlue":         new Color(173, 216, 230, 255),
            "powder blue":       new Color(176, 224, 230, 255),
            "PowderBlue":        new Color(176, 224, 230, 255),
            "pale turquoise":    new Color(175, 238, 238, 255),
            "PaleTurquoise":     new Color(175, 238, 238, 255),
            "dark turquoise":    new Color(0, 206, 209, 255),
            "DarkTurquoise":     new Color(0, 206, 209, 255),
            "medium turquoise":  new Color(72, 209, 204, 255),
            "MediumTurquoise":   new Color(72, 209, 204, 255),
            "turquoise":         new Color(64, 224, 208, 255),
            "cyan":              new Color(0, 255, 255, 255),
            "light cyan":        new Color(224, 255, 255, 255),
            "LightCyan":         new Color(224, 255, 255, 255),
            "cadet blue":        new Color(95, 158, 160, 255),
            "CadetBlue":         new Color(95, 158, 160, 255),
            "medium aquamarine": new Color(102, 205, 170, 255),
            "MediumAquamarine":  new Color(102, 205, 170, 255),
            "aquamarine":        new Color(127, 255, 212, 255),
            "dark green":        new Color(0, 100, 0, 255),
            "DarkGreen":         new Color(0, 100, 0, 255),
            "dark olive green":  new Color(85, 107, 47, 255),
            "DarkOliveGreen":    new Color(85, 107, 47, 255),
            "dark sea green":    new Color(143, 188, 143, 255),
            "DarkSeaGreen":      new Color(143, 188, 143, 255),
            "sea green":         new Color(46, 139, 87, 255),
            "SeaGreen":          new Color(46, 139, 87, 255),
            "medium sea green":  new Color(60, 179, 113, 255),
            "MediumSeaGreen":    new Color(60, 179, 113, 255),
            "light sea green":   new Color(32, 178, 170, 255),
            "LightSeaGreen":     new Color(32, 178, 170, 255),
            "pale green":        new Color(152, 251, 152, 255),
            "PaleGreen":         new Color(152, 251, 152, 255),
            "spring green":      new Color(0, 255, 127, 255),
            "SpringGreen":       new Color(0, 255, 127, 255),
            "lawn green":        new Color(124, 252, 0, 255),
            "LawnGreen":         new Color(124, 252, 0, 255),
            "green":             new Color(0, 255, 0, 255),
            "chartreuse":        new Color(127, 255, 0, 255),
            "medium spring green":new Color(0, 250, 154, 255),
            "MediumSpringGreen": new Color(0, 250, 154, 255),
            "green yellow":      new Color(173, 255, 47, 255),
            "GreenYellow":       new Color(173, 255, 47, 255),
            "lime green":        new Color(50, 205, 50, 255),
            "LimeGreen":         new Color(50, 205, 50, 255),
            "yellow green":      new Color(154, 205, 50, 255),
            "YellowGreen":       new Color(154, 205, 50, 255),
            "forest green":      new Color(34, 139, 34, 255),
            "ForestGreen":       new Color(34, 139, 34, 255),
            "olive drab":        new Color(107, 142, 35, 255),
            "OliveDrab":         new Color(107, 142, 35, 255),
            "dark khaki":        new Color(189, 183, 107, 255),
            "DarkKhaki":         new Color(189, 183, 107, 255),
            "khaki":             new Color(240, 230, 140, 255),
            "pale goldenrod":    new Color(238, 232, 170, 255),
            "PaleGoldenrod":     new Color(238, 232, 170, 255),
            "light goldenrod yellow":new Color(250, 250, 210, 255),
            "LightGoldenrodYellow":new Color(250, 250, 210, 255),
            "light yellow":      new Color(255, 255, 224, 255),
            "LightYellow":       new Color(255, 255, 224, 255),
            "yellow":            new Color(255, 255, 0, 255),
            "gold":              new Color(255, 215, 0, 255),
            "light goldenrod":   new Color(238, 221, 130, 255),
            "LightGoldenrod":    new Color(238, 221, 130, 255),
            "goldenrod":         new Color(218, 165, 32, 255),
            "dark goldenrod":    new Color(184, 134, 11, 255),
            "DarkGoldenrod":     new Color(184, 134, 11, 255),
            "rosy brown":        new Color(188, 143, 143, 255),
            "RosyBrown":         new Color(188, 143, 143, 255),
            "indian red":        new Color(205, 92, 92, 255),
            "IndianRed":         new Color(205, 92, 92, 255),
            "saddle brown":      new Color(139, 69, 19, 255),
            "SaddleBrown":       new Color(139, 69, 19, 255),
            "sienna":            new Color(160, 82, 45, 255),
            "peru":              new Color(205, 133, 63, 255),
            "burlywood":         new Color(222, 184, 135, 255),
            "beige":             new Color(245, 245, 220, 255),
            "wheat":             new Color(245, 222, 179, 255),
            "sandy brown":       new Color(244, 164, 96, 255),
            "SandyBrown":        new Color(244, 164, 96, 255),
            "tan":               new Color(210, 180, 140, 255),
            "chocolate":         new Color(210, 105, 30, 255),
            "firebrick":         new Color(178, 34, 34, 255),
            "brown":             new Color(165, 42, 42, 255),
            "dark salmon":       new Color(233, 150, 122, 255),
            "DarkSalmon":        new Color(233, 150, 122, 255),
            "salmon":            new Color(250, 128, 114, 255),
            "light salmon":      new Color(255, 160, 122, 255),
            "LightSalmon":       new Color(255, 160, 122, 255),
            "orange":            new Color(255, 165, 0, 255),
            "dark orange":       new Color(255, 140, 0, 255),
            "DarkOrange":        new Color(255, 140, 0, 255),
            "coral":             new Color(255, 127, 80, 255),
            "light coral":       new Color(240, 128, 128, 255),
            "LightCoral":        new Color(240, 128, 128, 255),
            "tomato":            new Color(255, 99, 71, 255),
            "orange red":        new Color(255, 69, 0, 255),
            "OrangeRed":         new Color(255, 69, 0, 255),
            "red":               new Color(255, 0, 0, 255),
            "hot pink":          new Color(255, 105, 180, 255),
            "HotPink":           new Color(255, 105, 180, 255),
            "deep pink":         new Color(255, 20, 147, 255),
            "DeepPink":          new Color(255, 20, 147, 255),
            "pink":              new Color(255, 192, 203, 255),
            "light pink":        new Color(255, 182, 193, 255),
            "LightPink":         new Color(255, 182, 193, 255),
            "pale violet red":   new Color(219, 112, 147, 255),
            "PaleVioletRed":     new Color(219, 112, 147, 255),
            "maroon":            new Color(176, 48, 96, 255),
            "medium violet red": new Color(199, 21, 133, 255),
            "MediumVioletRed":   new Color(199, 21, 133, 255),
            "violet red":        new Color(208, 32, 144, 255),
            "VioletRed":         new Color(208, 32, 144, 255),
            "magenta":           new Color(255, 0, 255, 255),
            "violet":            new Color(238, 130, 238, 255),
            "plum":              new Color(221, 160, 221, 255),
            "orchid":            new Color(218, 112, 214, 255),
            "medium orchid":     new Color(186, 85, 211, 255),
            "MediumOrchid":      new Color(186, 85, 211, 255),
            "dark orchid":       new Color(153, 50, 204, 255),
            "DarkOrchid":        new Color(153, 50, 204, 255),
            "dark violet":       new Color(148, 0, 211, 255),
            "DarkViolet":        new Color(148, 0, 211, 255),
            "blue violet":       new Color(138, 43, 226, 255),
            "BlueViolet":        new Color(138, 43, 226, 255),
            "purple":            new Color(160, 32, 240, 255),
            "medium purple":     new Color(147, 112, 219, 255),
            "MediumPurple":      new Color(147, 112, 219, 255),
            "thistle":           new Color(216, 191, 216, 255),
            "snow1":             new Color(255, 250, 250, 255),
            "snow2":             new Color(238, 233, 233, 255),
            "snow3":             new Color(205, 201, 201, 255),
            "snow4":             new Color(139, 137, 137, 255),
            "seashell1":         new Color(255, 245, 238, 255),
            "seashell2":         new Color(238, 229, 222, 255),
            "seashell3":         new Color(205, 197, 191, 255),
            "seashell4":         new Color(139, 134, 130, 255),
            "AntiqueWhite1":     new Color(255, 239, 219, 255),
            "AntiqueWhite2":     new Color(238, 223, 204, 255),
            "AntiqueWhite3":     new Color(205, 192, 176, 255),
            "AntiqueWhite4":     new Color(139, 131, 120, 255),
            "bisque1":           new Color(255, 228, 196, 255),
            "bisque2":           new Color(238, 213, 183, 255),
            "bisque3":           new Color(205, 183, 158, 255),
            "bisque4":           new Color(139, 125, 107, 255),
            "PeachPuff1":        new Color(255, 218, 185, 255),
            "PeachPuff2":        new Color(238, 203, 173, 255),
            "PeachPuff3":        new Color(205, 175, 149, 255),
            "PeachPuff4":        new Color(139, 119, 101, 255),
            "NavajoWhite1":      new Color(255, 222, 173, 255),
            "NavajoWhite2":      new Color(238, 207, 161, 255),
            "NavajoWhite3":      new Color(205, 179, 139, 255),
            "NavajoWhite4":      new Color(139, 121, 94, 255),
            "LemonChiffon1":     new Color(255, 250, 205, 255),
            "LemonChiffon2":     new Color(238, 233, 191, 255),
            "LemonChiffon3":     new Color(205, 201, 165, 255),
            "LemonChiffon4":     new Color(139, 137, 112, 255),
            "cornsilk1":         new Color(255, 248, 220, 255),
            "cornsilk2":         new Color(238, 232, 205, 255),
            "cornsilk3":         new Color(205, 200, 177, 255),
            "cornsilk4":         new Color(139, 136, 120, 255),
            "ivory1":            new Color(255, 255, 240, 255),
            "ivory2":            new Color(238, 238, 224, 255),
            "ivory3":            new Color(205, 205, 193, 255),
            "ivory4":            new Color(139, 139, 131, 255),
            "honeydew1":         new Color(240, 255, 240, 255),
            "honeydew2":         new Color(224, 238, 224, 255),
            "honeydew3":         new Color(193, 205, 193, 255),
            "honeydew4":         new Color(131, 139, 131, 255),
            "LavenderBlush1":    new Color(255, 240, 245, 255),
            "LavenderBlush2":    new Color(238, 224, 229, 255),
            "LavenderBlush3":    new Color(205, 193, 197, 255),
            "LavenderBlush4":    new Color(139, 131, 134, 255),
            "MistyRose1":        new Color(255, 228, 225, 255),
            "MistyRose2":        new Color(238, 213, 210, 255),
            "MistyRose3":        new Color(205, 183, 181, 255),
            "MistyRose4":        new Color(139, 125, 123, 255),
            "azure1":            new Color(240, 255, 255, 255),
            "azure2":            new Color(224, 238, 238, 255),
            "azure3":            new Color(193, 205, 205, 255),
            "azure4":            new Color(131, 139, 139, 255),
            "SlateBlue1":        new Color(131, 111, 255, 255),
            "SlateBlue2":        new Color(122, 103, 238, 255),
            "SlateBlue3":        new Color(105, 89, 205, 255),
            "SlateBlue4":        new Color(71, 60, 139, 255),
            "RoyalBlue1":        new Color(72, 118, 255, 255),
            "RoyalBlue2":        new Color(67, 110, 238, 255),
            "RoyalBlue3":        new Color(58, 95, 205, 255),
            "RoyalBlue4":        new Color(39, 64, 139, 255),
            "blue1":             new Color(0, 0, 255, 255),
            "blue2":             new Color(0, 0, 238, 255),
            "blue3":             new Color(0, 0, 205, 255),
            "blue4":             new Color(0, 0, 139, 255),
            "DodgerBlue1":       new Color(30, 144, 255, 255),
            "DodgerBlue2":       new Color(28, 134, 238, 255),
            "DodgerBlue3":       new Color(24, 116, 205, 255),
            "DodgerBlue4":       new Color(16, 78, 139, 255),
            "SteelBlue1":        new Color(99, 184, 255, 255),
            "SteelBlue2":        new Color(92, 172, 238, 255),
            "SteelBlue3":        new Color(79, 148, 205, 255),
            "SteelBlue4":        new Color(54, 100, 139, 255),
            "DeepSkyBlue1":      new Color(0, 191, 255, 255),
            "DeepSkyBlue2":      new Color(0, 178, 238, 255),
            "DeepSkyBlue3":      new Color(0, 154, 205, 255),
            "DeepSkyBlue4":      new Color(0, 104, 139, 255),
            "SkyBlue1":          new Color(135, 206, 255, 255),
            "SkyBlue2":          new Color(126, 192, 238, 255),
            "SkyBlue3":          new Color(108, 166, 205, 255),
            "SkyBlue4":          new Color(74, 112, 139, 255),
            "LightSkyBlue1":     new Color(176, 226, 255, 255),
            "LightSkyBlue2":     new Color(164, 211, 238, 255),
            "LightSkyBlue3":     new Color(141, 182, 205, 255),
            "LightSkyBlue4":     new Color(96, 123, 139, 255),
            "SlateGray1":        new Color(198, 226, 255, 255),
            "SlateGray2":        new Color(185, 211, 238, 255),
            "SlateGray3":        new Color(159, 182, 205, 255),
            "SlateGray4":        new Color(108, 123, 139, 255),
            "LightSteelBlue1":   new Color(202, 225, 255, 255),
            "LightSteelBlue2":   new Color(188, 210, 238, 255),
            "LightSteelBlue3":   new Color(162, 181, 205, 255),
            "LightSteelBlue4":   new Color(110, 123, 139, 255),
            "LightBlue1":        new Color(191, 239, 255, 255),
            "LightBlue2":        new Color(178, 223, 238, 255),
            "LightBlue3":        new Color(154, 192, 205, 255),
            "LightBlue4":        new Color(104, 131, 139, 255),
            "LightCyan1":        new Color(224, 255, 255, 255),
            "LightCyan2":        new Color(209, 238, 238, 255),
            "LightCyan3":        new Color(180, 205, 205, 255),
            "LightCyan4":        new Color(122, 139, 139, 255),
            "PaleTurquoise1":    new Color(187, 255, 255, 255),
            "PaleTurquoise2":    new Color(174, 238, 238, 255),
            "PaleTurquoise3":    new Color(150, 205, 205, 255),
            "PaleTurquoise4":    new Color(102, 139, 139, 255),
            "CadetBlue1":        new Color(152, 245, 255, 255),
            "CadetBlue2":        new Color(142, 229, 238, 255),
            "CadetBlue3":        new Color(122, 197, 205, 255),
            "CadetBlue4":        new Color(83, 134, 139, 255),
            "turquoise1":        new Color(0, 245, 255, 255),
            "turquoise2":        new Color(0, 229, 238, 255),
            "turquoise3":        new Color(0, 197, 205, 255),
            "turquoise4":        new Color(0, 134, 139, 255),
            "cyan1":             new Color(0, 255, 255, 255),
            "cyan2":             new Color(0, 238, 238, 255),
            "cyan3":             new Color(0, 205, 205, 255),
            "cyan4":             new Color(0, 139, 139, 255),
            "DarkSlateGray1":    new Color(151, 255, 255, 255),
            "DarkSlateGray2":    new Color(141, 238, 238, 255),
            "DarkSlateGray3":    new Color(121, 205, 205, 255),
            "DarkSlateGray4":    new Color(82, 139, 139, 255),
            "aquamarine1":       new Color(127, 255, 212, 255),
            "aquamarine2":       new Color(118, 238, 198, 255),
            "aquamarine3":       new Color(102, 205, 170, 255),
            "aquamarine4":       new Color(69, 139, 116, 255),
            "DarkSeaGreen1":     new Color(193, 255, 193, 255),
            "DarkSeaGreen2":     new Color(180, 238, 180, 255),
            "DarkSeaGreen3":     new Color(155, 205, 155, 255),
            "DarkSeaGreen4":     new Color(105, 139, 105, 255),
            "SeaGreen1":         new Color(84, 255, 159, 255),
            "SeaGreen2":         new Color(78, 238, 148, 255),
            "SeaGreen3":         new Color(67, 205, 128, 255),
            "SeaGreen4":         new Color(46, 139, 87, 255),
            "PaleGreen1":        new Color(154, 255, 154, 255),
            "PaleGreen2":        new Color(144, 238, 144, 255),
            "PaleGreen3":        new Color(124, 205, 124, 255),
            "PaleGreen4":        new Color(84, 139, 84, 255),
            "SpringGreen1":      new Color(0, 255, 127, 255),
            "SpringGreen2":      new Color(0, 238, 118, 255),
            "SpringGreen3":      new Color(0, 205, 102, 255),
            "SpringGreen4":      new Color(0, 139, 69, 255),
            "green1":            new Color(0, 255, 0, 255),
            "green2":            new Color(0, 238, 0, 255),
            "green3":            new Color(0, 205, 0, 255),
            "green4":            new Color(0, 139, 0, 255),
            "chartreuse1":       new Color(127, 255, 0, 255),
            "chartreuse2":       new Color(118, 238, 0, 255),
            "chartreuse3":       new Color(102, 205, 0, 255),
            "chartreuse4":       new Color(69, 139, 0, 255),
            "OliveDrab1":        new Color(192, 255, 62, 255),
            "OliveDrab2":        new Color(179, 238, 58, 255),
            "OliveDrab3":        new Color(154, 205, 50, 255),
            "OliveDrab4":        new Color(105, 139, 34, 255),
            "DarkOliveGreen1":   new Color(202, 255, 112, 255),
            "DarkOliveGreen2":   new Color(188, 238, 104, 255),
            "DarkOliveGreen3":   new Color(162, 205, 90, 255),
            "DarkOliveGreen4":   new Color(110, 139, 61, 255),
            "khaki1":            new Color(255, 246, 143, 255),
            "khaki2":            new Color(238, 230, 133, 255),
            "khaki3":            new Color(205, 198, 115, 255),
            "khaki4":            new Color(139, 134, 78, 255),
            "LightGoldenrod1":   new Color(255, 236, 139, 255),
            "LightGoldenrod2":   new Color(238, 220, 130, 255),
            "LightGoldenrod3":   new Color(205, 190, 112, 255),
            "LightGoldenrod4":   new Color(139, 129, 76, 255),
            "LightYellow1":      new Color(255, 255, 224, 255),
            "LightYellow2":      new Color(238, 238, 209, 255),
            "LightYellow3":      new Color(205, 205, 180, 255),
            "LightYellow4":      new Color(139, 139, 122, 255),
            "yellow1":           new Color(255, 255, 0, 255),
            "yellow2":           new Color(238, 238, 0, 255),
            "yellow3":           new Color(205, 205, 0, 255),
            "yellow4":           new Color(139, 139, 0, 255),
            "gold1":             new Color(255, 215, 0, 255),
            "gold2":             new Color(238, 201, 0, 255),
            "gold3":             new Color(205, 173, 0, 255),
            "gold4":             new Color(139, 117, 0, 255),
            "goldenrod1":        new Color(255, 193, 37, 255),
            "goldenrod2":        new Color(238, 180, 34, 255),
            "goldenrod3":        new Color(205, 155, 29, 255),
            "goldenrod4":        new Color(139, 105, 20, 255),
            "DarkGoldenrod1":    new Color(255, 185, 15, 255),
            "DarkGoldenrod2":    new Color(238, 173, 14, 255),
            "DarkGoldenrod3":    new Color(205, 149, 12, 255),
            "DarkGoldenrod4":    new Color(139, 101, 8, 255),
            "RosyBrown1":        new Color(255, 193, 193, 255),
            "RosyBrown2":        new Color(238, 180, 180, 255),
            "RosyBrown3":        new Color(205, 155, 155, 255),
            "RosyBrown4":        new Color(139, 105, 105, 255),
            "IndianRed1":        new Color(255, 106, 106, 255),
            "IndianRed2":        new Color(238, 99, 99, 255),
            "IndianRed3":        new Color(205, 85, 85, 255),
            "IndianRed4":        new Color(139, 58, 58, 255),
            "sienna1":           new Color(255, 130, 71, 255),
            "sienna2":           new Color(238, 121, 66, 255),
            "sienna3":           new Color(205, 104, 57, 255),
            "sienna4":           new Color(139, 71, 38, 255),
            "burlywood1":        new Color(255, 211, 155, 255),
            "burlywood2":        new Color(238, 197, 145, 255),
            "burlywood3":        new Color(205, 170, 125, 255),
            "burlywood4":        new Color(139, 115, 85, 255),
            "wheat1":            new Color(255, 231, 186, 255),
            "wheat2":            new Color(238, 216, 174, 255),
            "wheat3":            new Color(205, 186, 150, 255),
            "wheat4":            new Color(139, 126, 102, 255),
            "tan1":              new Color(255, 165, 79, 255),
            "tan2":              new Color(238, 154, 73, 255),
            "tan3":              new Color(205, 133, 63, 255),
            "tan4":              new Color(139, 90, 43, 255),
            "chocolate1":        new Color(255, 127, 36, 255),
            "chocolate2":        new Color(238, 118, 33, 255),
            "chocolate3":        new Color(205, 102, 29, 255),
            "chocolate4":        new Color(139, 69, 19, 255),
            "firebrick1":        new Color(255, 48, 48, 255),
            "firebrick2":        new Color(238, 44, 44, 255),
            "firebrick3":        new Color(205, 38, 38, 255),
            "firebrick4":        new Color(139, 26, 26, 255),
            "brown1":            new Color(255, 64, 64, 255),
            "brown2":            new Color(238, 59, 59, 255),
            "brown3":            new Color(205, 51, 51, 255),
            "brown4":            new Color(139, 35, 35, 255),
            "salmon1":           new Color(255, 140, 105, 255),
            "salmon2":           new Color(238, 130, 98, 255),
            "salmon3":           new Color(205, 112, 84, 255),
            "salmon4":           new Color(139, 76, 57, 255),
            "LightSalmon1":      new Color(255, 160, 122, 255),
            "LightSalmon2":      new Color(238, 149, 114, 255),
            "LightSalmon3":      new Color(205, 129, 98, 255),
            "LightSalmon4":      new Color(139, 87, 66, 255),
            "orange1":           new Color(255, 165, 0, 255),
            "orange2":           new Color(238, 154, 0, 255),
            "orange3":           new Color(205, 133, 0, 255),
            "orange4":           new Color(139, 90, 0, 255),
            "DarkOrange1":       new Color(255, 127, 0, 255),
            "DarkOrange2":       new Color(238, 118, 0, 255),
            "DarkOrange3":       new Color(205, 102, 0, 255),
            "DarkOrange4":       new Color(139, 69, 0, 255),
            "coral1":            new Color(255, 114, 86, 255),
            "coral2":            new Color(238, 106, 80, 255),
            "coral3":            new Color(205, 91, 69, 255),
            "coral4":            new Color(139, 62, 47, 255),
            "tomato1":           new Color(255, 99, 71, 255),
            "tomato2":           new Color(238, 92, 66, 255),
            "tomato3":           new Color(205, 79, 57, 255),
            "tomato4":           new Color(139, 54, 38, 255),
            "OrangeRed1":        new Color(255, 69, 0, 255),
            "OrangeRed2":        new Color(238, 64, 0, 255),
            "OrangeRed3":        new Color(205, 55, 0, 255),
            "OrangeRed4":        new Color(139, 37, 0, 255),
            "red1":              new Color(255, 0, 0, 255),
            "red2":              new Color(238, 0, 0, 255),
            "red3":              new Color(205, 0, 0, 255),
            "red4":              new Color(139, 0, 0, 255),
            "DebianRed":         new Color(215, 7, 81, 255),
            "DeepPink1":         new Color(255, 20, 147, 255),
            "DeepPink2":         new Color(238, 18, 137, 255),
            "DeepPink3":         new Color(205, 16, 118, 255),
            "DeepPink4":         new Color(139, 10, 80, 255),
            "HotPink1":          new Color(255, 110, 180, 255),
            "HotPink2":          new Color(238, 106, 167, 255),
            "HotPink3":          new Color(205, 96, 144, 255),
            "HotPink4":          new Color(139, 58, 98, 255),
            "pink1":             new Color(255, 181, 197, 255),
            "pink2":             new Color(238, 169, 184, 255),
            "pink3":             new Color(205, 145, 158, 255),
            "pink4":             new Color(139, 99, 108, 255),
            "LightPink1":        new Color(255, 174, 185, 255),
            "LightPink2":        new Color(238, 162, 173, 255),
            "LightPink3":        new Color(205, 140, 149, 255),
            "LightPink4":        new Color(139, 95, 101, 255),
            "PaleVioletRed1":    new Color(255, 130, 171, 255),
            "PaleVioletRed2":    new Color(238, 121, 159, 255),
            "PaleVioletRed3":    new Color(205, 104, 137, 255),
            "PaleVioletRed4":    new Color(139, 71, 93, 255),
            "maroon1":           new Color(255, 52, 179, 255),
            "maroon2":           new Color(238, 48, 167, 255),
            "maroon3":           new Color(205, 41, 144, 255),
            "maroon4":           new Color(139, 28, 98, 255),
            "VioletRed1":        new Color(255, 62, 150, 255),
            "VioletRed2":        new Color(238, 58, 140, 255),
            "VioletRed3":        new Color(205, 50, 120, 255),
            "VioletRed4":        new Color(139, 34, 82, 255),
            "magenta1":          new Color(255, 0, 255, 255),
            "magenta2":          new Color(238, 0, 238, 255),
            "magenta3":          new Color(205, 0, 205, 255),
            "magenta4":          new Color(139, 0, 139, 255),
            "orchid1":           new Color(255, 131, 250, 255),
            "orchid2":           new Color(238, 122, 233, 255),
            "orchid3":           new Color(205, 105, 201, 255),
            "orchid4":           new Color(139, 71, 137, 255),
            "plum1":             new Color(255, 187, 255, 255),
            "plum2":             new Color(238, 174, 238, 255),
            "plum3":             new Color(205, 150, 205, 255),
            "plum4":             new Color(139, 102, 139, 255),
            "MediumOrchid1":     new Color(224, 102, 255, 255),
            "MediumOrchid2":     new Color(209, 95, 238, 255),
            "MediumOrchid3":     new Color(180, 82, 205, 255),
            "MediumOrchid4":     new Color(122, 55, 139, 255),
            "DarkOrchid1":       new Color(191, 62, 255, 255),
            "DarkOrchid2":       new Color(178, 58, 238, 255),
            "DarkOrchid3":       new Color(154, 50, 205, 255),
            "DarkOrchid4":       new Color(104, 34, 139, 255),
            "purple1":           new Color(155, 48, 255, 255),
            "purple2":           new Color(145, 44, 238, 255),
            "purple3":           new Color(125, 38, 205, 255),
            "purple4":           new Color(85, 26, 139, 255),
            "MediumPurple1":     new Color(171, 130, 255, 255),
            "MediumPurple2":     new Color(159, 121, 238, 255),
            "MediumPurple3":     new Color(137, 104, 205, 255),
            "MediumPurple4":     new Color(93, 71, 139, 255),
            "thistle1":          new Color(255, 225, 255, 255),
            "thistle2":          new Color(238, 210, 238, 255),
            "thistle3":          new Color(205, 181, 205, 255),
            "thistle4":          new Color(139, 123, 139, 255),
            "gray0":             new Color(0, 0, 0, 255),
            "grey0":             new Color(0, 0, 0, 255),
            "gray1":             new Color(3, 3, 3, 255),
            "grey1":             new Color(3, 3, 3, 255),
            "gray2":             new Color(5, 5, 5, 255),
            "grey2":             new Color(5, 5, 5, 255),
            "gray3":             new Color(8, 8, 8, 255),
            "grey3":             new Color(8, 8, 8, 255),
            "gray4":             new Color(10, 10, 10, 255),
            "grey4":             new Color(10, 10, 10, 255),
            "gray5":             new Color(13, 13, 13, 255),
            "grey5":             new Color(13, 13, 13, 255),
            "gray6":             new Color(15, 15, 15, 255),
            "grey6":             new Color(15, 15, 15, 255),
            "gray7":             new Color(18, 18, 18, 255),
            "grey7":             new Color(18, 18, 18, 255),
            "gray8":             new Color(20, 20, 20, 255),
            "grey8":             new Color(20, 20, 20, 255),
            "gray9":             new Color(23, 23, 23, 255),
            "grey9":             new Color(23, 23, 23, 255),
            "gray10":            new Color(26, 26, 26, 255),
            "grey10":            new Color(26, 26, 26, 255),
            "gray11":            new Color(28, 28, 28, 255),
            "grey11":            new Color(28, 28, 28, 255),
            "gray12":            new Color(31, 31, 31, 255),
            "grey12":            new Color(31, 31, 31, 255),
            "gray13":            new Color(33, 33, 33, 255),
            "grey13":            new Color(33, 33, 33, 255),
            "gray14":            new Color(36, 36, 36, 255),
            "grey14":            new Color(36, 36, 36, 255),
            "gray15":            new Color(38, 38, 38, 255),
            "grey15":            new Color(38, 38, 38, 255),
            "gray16":            new Color(41, 41, 41, 255),
            "grey16":            new Color(41, 41, 41, 255),
            "gray17":            new Color(43, 43, 43, 255),
            "grey17":            new Color(43, 43, 43, 255),
            "gray18":            new Color(46, 46, 46, 255),
            "grey18":            new Color(46, 46, 46, 255),
            "gray19":            new Color(48, 48, 48, 255),
            "grey19":            new Color(48, 48, 48, 255),
            "gray20":            new Color(51, 51, 51, 255),
            "grey20":            new Color(51, 51, 51, 255),
            "gray21":            new Color(54, 54, 54, 255),
            "grey21":            new Color(54, 54, 54, 255),
            "gray22":            new Color(56, 56, 56, 255),
            "grey22":            new Color(56, 56, 56, 255),
            "gray23":            new Color(59, 59, 59, 255),
            "grey23":            new Color(59, 59, 59, 255),
            "gray24":            new Color(61, 61, 61, 255),
            "grey24":            new Color(61, 61, 61, 255),
            "gray25":            new Color(64, 64, 64, 255),
            "grey25":            new Color(64, 64, 64, 255),
            "gray26":            new Color(66, 66, 66, 255),
            "grey26":            new Color(66, 66, 66, 255),
            "gray27":            new Color(69, 69, 69, 255),
            "grey27":            new Color(69, 69, 69, 255),
            "gray28":            new Color(71, 71, 71, 255),
            "grey28":            new Color(71, 71, 71, 255),
            "gray29":            new Color(74, 74, 74, 255),
            "grey29":            new Color(74, 74, 74, 255),
            "gray30":            new Color(77, 77, 77, 255),
            "grey30":            new Color(77, 77, 77, 255),
            "gray31":            new Color(79, 79, 79, 255),
            "grey31":            new Color(79, 79, 79, 255),
            "gray32":            new Color(82, 82, 82, 255),
            "grey32":            new Color(82, 82, 82, 255),
            "gray33":            new Color(84, 84, 84, 255),
            "grey33":            new Color(84, 84, 84, 255),
            "gray34":            new Color(87, 87, 87, 255),
            "grey34":            new Color(87, 87, 87, 255),
            "gray35":            new Color(89, 89, 89, 255),
            "grey35":            new Color(89, 89, 89, 255),
            "gray36":            new Color(92, 92, 92, 255),
            "grey36":            new Color(92, 92, 92, 255),
            "gray37":            new Color(94, 94, 94, 255),
            "grey37":            new Color(94, 94, 94, 255),
            "gray38":            new Color(97, 97, 97, 255),
            "grey38":            new Color(97, 97, 97, 255),
            "gray39":            new Color(99, 99, 99, 255),
            "grey39":            new Color(99, 99, 99, 255),
            "gray40":            new Color(102, 102, 102, 255),
            "grey40":            new Color(102, 102, 102, 255),
            "gray41":            new Color(105, 105, 105, 255),
            "grey41":            new Color(105, 105, 105, 255),
            "gray42":            new Color(107, 107, 107, 255),
            "grey42":            new Color(107, 107, 107, 255),
            "gray43":            new Color(110, 110, 110, 255),
            "grey43":            new Color(110, 110, 110, 255),
            "gray44":            new Color(112, 112, 112, 255),
            "grey44":            new Color(112, 112, 112, 255),
            "gray45":            new Color(115, 115, 115, 255),
            "grey45":            new Color(115, 115, 115, 255),
            "gray46":            new Color(117, 117, 117, 255),
            "grey46":            new Color(117, 117, 117, 255),
            "gray47":            new Color(120, 120, 120, 255),
            "grey47":            new Color(120, 120, 120, 255),
            "gray48":            new Color(122, 122, 122, 255),
            "grey48":            new Color(122, 122, 122, 255),
            "gray49":            new Color(125, 125, 125, 255),
            "grey49":            new Color(125, 125, 125, 255),
            "gray50":            new Color(127, 127, 127, 255),
            "grey50":            new Color(127, 127, 127, 255),
            "gray51":            new Color(130, 130, 130, 255),
            "grey51":            new Color(130, 130, 130, 255),
            "gray52":            new Color(133, 133, 133, 255),
            "grey52":            new Color(133, 133, 133, 255),
            "gray53":            new Color(135, 135, 135, 255),
            "grey53":            new Color(135, 135, 135, 255),
            "gray54":            new Color(138, 138, 138, 255),
            "grey54":            new Color(138, 138, 138, 255),
            "gray55":            new Color(140, 140, 140, 255),
            "grey55":            new Color(140, 140, 140, 255),
            "gray56":            new Color(143, 143, 143, 255),
            "grey56":            new Color(143, 143, 143, 255),
            "gray57":            new Color(145, 145, 145, 255),
            "grey57":            new Color(145, 145, 145, 255),
            "gray58":            new Color(148, 148, 148, 255),
            "grey58":            new Color(148, 148, 148, 255),
            "gray59":            new Color(150, 150, 150, 255),
            "grey59":            new Color(150, 150, 150, 255),
            "gray60":            new Color(153, 153, 153, 255),
            "grey60":            new Color(153, 153, 153, 255),
            "gray61":            new Color(156, 156, 156, 255),
            "grey61":            new Color(156, 156, 156, 255),
            "gray62":            new Color(158, 158, 158, 255),
            "grey62":            new Color(158, 158, 158, 255),
            "gray63":            new Color(161, 161, 161, 255),
            "grey63":            new Color(161, 161, 161, 255),
            "gray64":            new Color(163, 163, 163, 255),
            "grey64":            new Color(163, 163, 163, 255),
            "gray65":            new Color(166, 166, 166, 255),
            "grey65":            new Color(166, 166, 166, 255),
            "gray66":            new Color(168, 168, 168, 255),
            "grey66":            new Color(168, 168, 168, 255),
            "gray67":            new Color(171, 171, 171, 255),
            "grey67":            new Color(171, 171, 171, 255),
            "gray68":            new Color(173, 173, 173, 255),
            "grey68":            new Color(173, 173, 173, 255),
            "gray69":            new Color(176, 176, 176, 255),
            "grey69":            new Color(176, 176, 176, 255),
            "gray70":            new Color(179, 179, 179, 255),
            "grey70":            new Color(179, 179, 179, 255),
            "gray71":            new Color(181, 181, 181, 255),
            "grey71":            new Color(181, 181, 181, 255),
            "gray72":            new Color(184, 184, 184, 255),
            "grey72":            new Color(184, 184, 184, 255),
            "gray73":            new Color(186, 186, 186, 255),
            "grey73":            new Color(186, 186, 186, 255),
            "gray74":            new Color(189, 189, 189, 255),
            "grey74":            new Color(189, 189, 189, 255),
            "gray75":            new Color(191, 191, 191, 255),
            "grey75":            new Color(191, 191, 191, 255),
            "gray76":            new Color(194, 194, 194, 255),
            "grey76":            new Color(194, 194, 194, 255),
            "gray77":            new Color(196, 196, 196, 255),
            "grey77":            new Color(196, 196, 196, 255),
            "gray78":            new Color(199, 199, 199, 255),
            "grey78":            new Color(199, 199, 199, 255),
            "gray79":            new Color(201, 201, 201, 255),
            "grey79":            new Color(201, 201, 201, 255),
            "gray80":            new Color(204, 204, 204, 255),
            "grey80":            new Color(204, 204, 204, 255),
            "gray81":            new Color(207, 207, 207, 255),
            "grey81":            new Color(207, 207, 207, 255),
            "gray82":            new Color(209, 209, 209, 255),
            "grey82":            new Color(209, 209, 209, 255),
            "gray83":            new Color(212, 212, 212, 255),
            "grey83":            new Color(212, 212, 212, 255),
            "gray84":            new Color(214, 214, 214, 255),
            "grey84":            new Color(214, 214, 214, 255),
            "gray85":            new Color(217, 217, 217, 255),
            "grey85":            new Color(217, 217, 217, 255),
            "gray86":            new Color(219, 219, 219, 255),
            "grey86":            new Color(219, 219, 219, 255),
            "gray87":            new Color(222, 222, 222, 255),
            "grey87":            new Color(222, 222, 222, 255),
            "gray88":            new Color(224, 224, 224, 255),
            "grey88":            new Color(224, 224, 224, 255),
            "gray89":            new Color(227, 227, 227, 255),
            "grey89":            new Color(227, 227, 227, 255),
            "gray90":            new Color(229, 229, 229, 255),
            "grey90":            new Color(229, 229, 229, 255),
            "gray91":            new Color(232, 232, 232, 255),
            "grey91":            new Color(232, 232, 232, 255),
            "gray92":            new Color(235, 235, 235, 255),
            "grey92":            new Color(235, 235, 235, 255),
            "gray93":            new Color(237, 237, 237, 255),
            "grey93":            new Color(237, 237, 237, 255),
            "gray94":            new Color(240, 240, 240, 255),
            "grey94":            new Color(240, 240, 240, 255),
            "gray95":            new Color(242, 242, 242, 255),
            "grey95":            new Color(242, 242, 242, 255),
            "gray96":            new Color(245, 245, 245, 255),
            "grey96":            new Color(245, 245, 245, 255),
            "gray97":            new Color(247, 247, 247, 255),
            "grey97":            new Color(247, 247, 247, 255),
            "gray98":            new Color(250, 250, 250, 255),
            "grey98":            new Color(250, 250, 250, 255),
            "gray99":            new Color(252, 252, 252, 255),
            "grey99":            new Color(252, 252, 252, 255),
            "gray100":           new Color(255, 255, 255, 255),
            "grey100":           new Color(255, 255, 255, 255),
            "dark grey":         new Color(169, 169, 169, 255),
            "DarkGrey":          new Color(169, 169, 169, 255),
            "dark gray":         new Color(169, 169, 169, 255),
            "DarkGray":          new Color(169, 169, 169, 255),
            "dark blue":         new Color(0, 0, 139, 255),
            "DarkBlue":          new Color(0, 0, 139, 255),
            "dark cyan":         new Color(0, 139, 139, 255),
            "DarkCyan":          new Color(0, 139, 139, 255),
            "dark magenta":      new Color(139, 0, 139, 255),
            "DarkMagenta":       new Color(139, 0, 139, 255),
            "dark red":          new Color(139, 0, 0, 255),
            "DarkRed":           new Color(139, 0, 0, 255),
            "light green":       new Color(144, 238, 144, 255),
            "LightGreen":        new Color(144, 238, 144, 255),
            "indigo":            new Color(75, 0, 130, 255)
        };
    };
    return { make_color_table: make_color_table };
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false */
/** @namespace */
define('src/color',['./color-x11'], function(X11) {
    
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

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/brush',['img!../brushes/brush-tile-129.png', './color'], function(brushesImg, Color) {
    
    // Brush-related functions.
    // Inspired by canvas.h of Colors! XO activity, GPL license.
    
    // names/indexes of brushes in brushesImg
    var BrushTypes = {
        hard: 0,
        medium: 1,
        'rough fine': 2,
        'rough coarse': 3,
        soft: 4,
        'dots small': 5,
        'dots large': 6,
        rect: 7,
        splotch: 8,
        'splotches coarse': 9
    };
    var NUM_BRUSHES = 0;
    if (brushesImg) {
        NUM_BRUSHES = brushesImg.width / brushesImg.height;
        //console.log('Loaded',NUM_BRUSHES,'brushes');
    }

    var Brush = function(color, type, size, opacity, spacing) {
        this.set(color, type, size, opacity, spacing);
    };
    Brush.prototype = {};

    Brush.Types = BrushTypes;

    Brush.fromJSON = function(str) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        var color = new Color();
        color.set_from_color(json.color);
        // legacy brush compatibility (Colors! brushes)
        var type = (json.type===0)?'hard':(json.type===1)?'soft':json.type;
        return new Brush(color, json.type, json.size, json.opacity,
                         json.spacing);
    };

    Brush.prototype.equals = function(b) {
        if (this===b) { return true; }
        return Color.equal(this.color, b.color) &&
            this.type === b.type &&
            this.size === b.size &&
            this.opacity === b.opacity &&
            this.spacing === b.spacing;
    };

    Brush.prototype.set = function(color, type, size, opacity, spacing) {
        this.color = color || Color.BLACK;
        this.type = type || 'hard';
        this.size = size || 32;
        this.opacity = opacity || 1.0;
        this.spacing = spacing || 0.225; // fraction of brush size
    };

    Brush.prototype.set_from_brush = function(brush) {
        this.set(brush.color, brush.type, brush.size, brush.opacity,
                 brush.spacing);
    };

    Brush.prototype.clone = function() {
        return new Brush(this.color, this.type, this.size, this.opacity,
                         this.spacing);
    };

    Brush.prototype.toCanvas = function() {
        // XXX should we scale the canvas up based on the devicePixelRatio ?
        // (currently we scale up in layer.js, should be refactored)
        var HALF_MASTER_BRUSH_SIZE = Math.floor(brushesImg.height/2);
        var half_width = Math.min(Math.max(1, Math.ceil(this.size / 2)),
                                  HALF_MASTER_BRUSH_SIZE);
        var canvas_size = (half_width*2) + 1;
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = canvas_size;
        var context = canvas.getContext('2d');
        // fill with brush color
        context.fillStyle = this.color.to_string().replace(/..$/,'');
        context.fillRect(0,0,canvas.width,canvas.height);
        // now scale & draw the brush image.
        // (use exact floating-point this.size)
        context.translate(half_width+0.5, half_width+0.5);
        var scale = Math.max(2,this.size+1) / brushesImg.height;
        context.scale(scale, scale);
        // offset image to match which brush is selected
        var offset = 0;
        if (Brush.Types.hasOwnProperty(this.type)) {
            offset = Brush.Types[this.type];
        } else { console.warn("Unknown brush type", this.type); }
        offset *= brushesImg.height;
        // mix with brush color fill
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(brushesImg,
                          -HALF_MASTER_BRUSH_SIZE-0.5 - offset,
                          -HALF_MASTER_BRUSH_SIZE-0.5);
        return canvas;
    };

    return Brush;
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global
  define:true, console:false, require:false, module:false, window:false,
  Float64Array:false, Uint16Array:false
 */

// Compatibility thunks.  Hackity hackity.
define('src/compat',[], function() {
    // Because Safari 5.1 doesn't have Function.bind (sigh)
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP ? this :
                                     (oThis || window),
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
    // Android's embedded webkit doesn't have Object.freeze
    if (!Object.freeze) {
        Object.freeze = function(o) { return o; };
    }
    // Android non-Chrome doesn't have Web Workers
    var FakeWorker = function() {
        console.warn("Faking Web Worker creation.");
    };
    FakeWorker.prototype = {
        postMessage: function(msg) { },
        addEventListener: function(msg, func) { }
    };

    var Compat = {
        // Android non-Chrome browser doesn't have Web Workers
        Worker: typeof(Worker)==='undefined' ? FakeWorker : Worker,
        // Android Honeycomb doesn't have Uint8Array
        Uint8Array: typeof(Uint8Array)==='undefined' ? Array : Uint8Array,
        // iOS 5 doesn't have Float64Array
        Float64Array: typeof(Float64Array)==='undefined' ? Array : Float64Array
    };

    // robust poly fill for window.requestAnimationFrame
    if (typeof window !== 'undefined') {
        (function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            var x;
            for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame =
                    window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                console.log("Using requestAnimationFrame fallback.");
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                               timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
            }

            Compat.requestAnimationFrame =
                window.requestAnimationFrame.bind(window);
            Compat.cancelAnimationFrame =
                window.cancelAnimationFrame.bind(window);
        })();
    }

    return Compat;
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/dom',[], function() {
    
    /** Export a limited set of functions for working with the DOM.
     *  These can be reimplemented for a standalone application.
     */

    var insertMeta = function(document) {
        var elements = [
            [ ["charset", "UTF-8" ]],
            [ ["name", "viewport"],
              ["content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" ]],
            [ ["name", "apple-mobile-web-app-capable"],
              ["content", "yes" ]],
            [ ["name", "apple-mobile-web-app-status-bar-style"],
              ["content", "black"]]
        ];
        var m = document.getElementsByTagName("meta");
        var i, j, k;
        for (i=0; i<elements.length; i++) {
            var e = elements[i];
            // does this already exist?
            var exist = false;
            for (j=0; j<m.length && !exist; j++) {
                var mm = m[j];
                var match = true;
                for (k=0; k<e.length && match; k++) {
                    var a = e[k][0];
                    var v = e[k][1];
                    if (mm.getAttribute(a) !== v) {
                        match = false;
                    }
                }
                if (match) { exist=true; }
            }
            if (exist) { continue; }
            var meta = document.createElement("meta");
            for (k=0; k<e.length; k++) {
                meta.setAttribute(e[k][0], e[k][1]);
            }
            document.head.appendChild(meta);
        }
    };
    var setTitle = function(window, new_title) {
        window.document.title = new_title;
    };
    var insertCanvas = function(window) {
        var doc = window.document;
        var canvas = document.createElement("canvas");
        canvas.id="ncolors";
        canvas.style.position="absolute";
        canvas.style.left="0px";
        canvas.style.top="0px";
        canvas.style.right="0px";
        canvas.style.bottom="0px";
        document.body.appendChild(canvas);
        var onWindowResize = function(event) {
            var w = window.innerWidth, h = window.innerHeight;
            var r = window.devicePixelRatio || 1;
            // XXX force aspect ratio?
            canvas.width = w * r;
            canvas.height = h * r;
            console.log("Resizing canvas", w, h, r);
            if (canvas.resizeHandler) {
                canvas.resizeHandler();
            }
        };
        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
        return canvas;
    };

    // Create initial stage.
    var init = function(window) {
        insertMeta(window.document);
        setTitle(window, "Colors for Nell");
        return insertCanvas(window);
    };
    var new_window = function(parent_window) {
        var nw = parent_window.open("", "_blank");
        insertMeta(nw);
        setTitle(nw, "Colors for Nell");
        return insertCanvas(nw);
    };

    return {
        //initial_canvas: init(window),
        insertMeta: insertMeta,
        new_canvas: function() { return new_window(window); },
        set_title: function(canvas, new_title) {
            canvas.ownerDocument.title = new_title;
        },
        get_title: function(canvas) {
            return canvas.ownerDocument.title;
        }
    };
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, Uint8Array:false */
define('src/drawcommand',['./color','./compat', './brush'], function(Color, Compat, Brush) {
    

    // draw commands

    var CommandType = {
        DRAW: 0,
        DRAW_END: 1,
        COLOR_CHANGE: 2,
        BRUSH_CHANGE: 3,
        DRAW_START: 4,
        NUM_COMMAND_TYPES: 5
    };
    // the Compat module ensures that Object.freeze is defined (maybe a no-op)
    Object.freeze(CommandType);

    var DrawCommand = function(type) {
        console.assert(type >= 0 && type < CommandType.NUM_COMMAND_TYPES);
        this.type = type;
    };
    DrawCommand.prototype = {};
    DrawCommand.Type = CommandType;
    DrawCommand.fromJSON = function(str) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        var cmd = new DrawCommand(json.type), name;
        for (name in json) {
            if (json.hasOwnProperty(name)) {
                if (name==='color') {
                    cmd[name] = new Color();
                    cmd[name].set_from_color(json[name]);
                } else if (name==='brush_type') {
                    // legacy brush type compatibility
                    var val = json[name];
                    cmd[name] = (val===0)?'hard':(val===1)?'soft':val;
                } else {
                    cmd[name] = json[name];
                }
            }
        }
        return cmd;
    };

    DrawCommand.create_draw_start = function(layer) {
        if (!layer) { layer = 0; }
        var cmd = new DrawCommand(CommandType.DRAW_START);
        cmd.layer = layer;
        return cmd;
    };
    DrawCommand.create_draw = function(pos, time) {
        if (!time) { time = Date.now(); }
        var cmd = new DrawCommand(CommandType.DRAW);
        cmd.pos = { x: pos.x, y: pos.y };
        cmd.time = time;
        return cmd;
    };
    DrawCommand.create_draw_end = function() {
        var cmd = new DrawCommand(CommandType.DRAW_END);
        return cmd;

    };
    DrawCommand.create_color_change = function(color) {
        var cmd = new DrawCommand(CommandType.COLOR_CHANGE);
        cmd.color = color.copy();
        return cmd;
    };
    DrawCommand.create_brush_change = function(opts) {
        opts = opts || {};
        var cmd = new DrawCommand(CommandType.BRUSH_CHANGE);
        ['brush_type', 'size', 'opacity', 'spacing'].forEach(function(f) {
            if (f in opts) {
                cmd[f] = opts[f];
            }
        });
        return cmd;
    };

    return DrawCommand;
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:true, console:false, require:false, module:false */

define('src/point',[], function() {
    
    var Point = function(x, y, isUp) {
        this.set(x, y, isUp);
    };
    Point.prototype = {
        clone: function() { return new Point(this.x, this.y, this.isUp); },
        equals: function(p) { return Point.equals(this, p); },
        dist: function(p) { return Point.dist(this, p); },
        interp: function(p, amt) { return Point.interp(this, p, amt); },
        set: function(x, y, isUp) {
            this.x = x; this.y = y; this.isUp = isUp || false;
        },
        set_from_point: function(p) {
            this.set(p.x, p.y, p.isUp);
        }
    };
    Point.equals = function(a, b) {
        if (a===b) { return true; }
        return (a.x === b.x) && (a.y === b.y) && (a.isUp === b.isUp);
    };
    Point.dist2 = function(a, b) {
        var dx = a.x - b.x, dy = a.y - b.y;
        return (dx*dx + dy*dy);
    };
    Point.dist = function(a, b) {
        return Math.sqrt(Point.dist2(a, b));
    };
    Point.interp = function(p1, p2, amt, optDst) {
        var x = p1.x + amt*(p2.x - p1.x);
        var y = p1.y + amt*(p2.y - p1.y);
        var result = optDst || new Point();
        result.set(x, y, p2.isUp);
        return result;
    };

    return Point;
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false */
define('src/layer',['./drawcommand', './brush', './point'], function(DrawCommand, Brush, Point) {
    
    // Each 'layer' in a drawing is a <div><canvas/><canvas/></div>.
    // The top canvas is for real-time drawing, and its opacity corresponds
    // to the current pen opacity.  The bottom canvas displays all
    // completed strokes.
    var id = 0;
    var Layer = function() {
        this.domElement = document.createElement("div");
        this.completedCanvas = document.createElement("canvas");
        this.progressCanvas = document.createElement("canvas");
        this.domElement.appendChild(this.completedCanvas);
        this.domElement.appendChild(this.progressCanvas);
        this.domElement.id = "layer"+(id++);
        [this.domElement,
         this.completedCanvas,
         this.progressCanvas].forEach(function(e) {
             e.style.position = "absolute";
             e.style.left = e.style.top = e.style.right = e.style.bottom="0px";
             e.style.width="100%";
             e.style.height="100%";
         });
        this.progressContext = this.progressCanvas.getContext('2d');
        this.completedContext = this.completedCanvas.getContext('2d');
        // cached brush stamp
        this.brush_stamp = null;
        // line state
        this.isDrawingPath = false;
        this.lastPoint = new Point();
        // temporaries, to avoid reallocating points every time we invoke
        // execDraw()
        this._draw_from = new Point();
        this._draw_to   = new Point();
        this._draw_tmp  = new Point();
        // XXX handle resize events?
    };
    Layer.prototype = {
        _getBrushStamp: function(brush) {
            if (this.brush_stamp === null) {
                var b = brush.clone(); b.size *= this.pixel_ratio;
                b.size = Math.max(0, Math.min(128, Math.round(b.size)));
                this.brush_stamp = b.toCanvas();
                this.progressCanvas.style.opacity = brush.opacity;
            }
            return this.brush_stamp;
        },
        _drawStamp: function(pos, brush) {
            this.lastPoint.set(Math.round(pos.x), Math.round(pos.y));
            var stamp = this._getBrushStamp(brush);
            var center = Math.floor(stamp.width / 2);
            var x = this.lastPoint.x - center, y = this.lastPoint.y - center;
            this.progressContext.drawImage(stamp, x, y);
        },
        execDraw: function(x, y, brush) {
            var from=this._draw_from, to=this._draw_to, tmp=this._draw_tmp;

            from.set_from_point(this.lastPoint);
            to.set(x, y);

            var drawn = false;
            if (!this.isDrawingPath) {
                this._drawStamp(to, brush);
                this.isDrawingPath = true;
                drawn = true;
            } else {
                // interpolate along path
                var dist = Point.dist(from, to), d;
                // step should never be less than 1 px.
                var step = Math.max(1, brush.size * brush.spacing);
                if (dist < step) {
                    // XXX idle?
                } else {
                    for (d = step; d < dist; d+= step) {
                        this._drawStamp(Point.interp(from, to, d/dist, tmp),
                                        brush);
                        drawn = true;
                    }
                }
            }
            return drawn;
        },
        execDrawEnd: function() {
            console.assert(this.isDrawingPath);
            // transfer from 'progress' to 'completed' canvas.
            this.completedContext.globalAlpha=this.progressCanvas.style.opacity;
            this.completedContext.drawImage(this.progressCanvas, 0, 0);
            this.progressContext.clearRect(0,0, this.width, this.height);
            this.isDrawingPath = false;
            return false;
        },
        // returns true iff we actually made a change to the canvas
        execCommand: function(draw_command, brush) {
            switch(draw_command.type) {
            case DrawCommand.Type.DRAW_START:
                console.assert(!this.isDrawingPath);
                return false;
            case DrawCommand.Type.DRAW:
                return this.execDraw(draw_command.pos.x * this.pixel_ratio,
                                     draw_command.pos.y * this.pixel_ratio,
                                     brush);
            case DrawCommand.Type.DRAW_END:
                return this.execDrawEnd();
            case DrawCommand.Type.COLOR_CHANGE:
            case DrawCommand.Type.BRUSH_CHANGE:
                console.assert(!this.isDrawingPath);
                this.brush_stamp = null;
                return false;
            default:
                console.assert(false, draw_command);
            }
        },
        cancelCurrentStroke: function() {
            this.progressContext.clearRect(0,0,this.width,this.height);
            this.isDrawingPath = false;
        },
        clear: function() {
            [this.progressContext, this.completedContext].forEach(function(c){
                c.clearRect(0,0, this.width, this.height);
            }.bind(this));
            this.isDrawingPath = false;
            // reset brush as well.
            this.brush_stamp = null;
        },
        resize: function(width, height, pixel_ratio) {
            var w = width * pixel_ratio, h = height * pixel_ratio;
            [this,this.completedCanvas,this.progressCanvas].forEach(function(o){
                o.width = w;
                o.height = h;
            });
            this.isDrawingPath = false;
            this.brush_stamp = null;
            this.pixel_ratio = pixel_ratio;
        },
        saveCheckpoint: function() {
            console.assert(!this.isDrawingPath);
            var ncanvas = document.createElement('canvas');
            ncanvas.width = this.completedCanvas.width;
            ncanvas.height = this.completedCanvas.height;
            ncanvas.getContext('2d').drawImage(this.completedCanvas, 0, 0);
            return new Layer.Checkpoint(ncanvas);
        },
        restoreCheckpoint: function(checkpoint) {
            console.assert(typeof(checkpoint)!=='string',
                           'need to decode checkpoint before restoring');
            this.clear();
            console.assert(!this.isDrawingPath);
            this.completedContext.globalAlpha = 1.0;
            this.completedContext.drawImage(checkpoint.canvas, 0, 0);
        }
    };
    Layer.Checkpoint = function(canvas) {
        this.canvas = canvas;
    };
    Layer.Checkpoint.prototype = {};
    Layer.Checkpoint.prototype.toJSON = function() {
        return {
            canvas: this.canvas.toDataURL('image/png')
        };
    };
    Layer.Checkpoint.fromJSON = function(str, callback) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        var image = document.createElement('img');
        // xxx can't load image from data: url synchronously
        image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext('2d').drawImage(image, 0, 0);
            callback(new Layer.Checkpoint(canvas));
        };
        image.src = json.canvas;
    };

    return Layer;
});

/*
 * Hammer.JS
 * version 0.4
 * author: Eight Media
 * https://github.com/EightMedia/hammer.js
 */
define('lib/hammer',[], function() { return function Hammer(element, options, undefined) {
    var self = this;

    var defaults = {
        // prevent the default event or not... might be buggy when false
        prevent_default    : false,
        css_hacks          : true,

        drag               : true,
        drag_vertical      : true,
        drag_horizontal    : true,
        // minimum distance before the drag event starts
        drag_min_distance  : 20, // pixels

        // pinch zoom and rotation
        transform          : true,
        scale_treshold     : 0.1,
        rotation_treshold  : 15, // degrees

        tap                : true,
        tap_double         : true,
        tap_max_interval   : 300,
        tap_double_distance: 20,

        hold               : true,
        hold_timeout       : 500
    };
    options = mergeObject(defaults, options);

    // some css hacks
    (function() {
        if(!options.css_hacks) {
            return false;
        }

        var vendors = ['webkit','moz','ms','o',''];
        var css_props = {
            "userSelect": "none",
            "touchCallout": "none",
            "userDrag": "none",
            "tapHighlightColor": "rgba(0,0,0,0)"
        };

        var prop = '';
        for(var i = 0; i < vendors.length; i++) {
            for(var p in css_props) {
                prop = p;
                if(vendors[i]) {
                    prop = vendors[i] + prop.substring(0, 1).toUpperCase() + prop.substring(1);
                }
                element.style[ prop ] = css_props[p];
            }
        }
    })();

    // holds the distance that has been moved
    var _distance = 0;

    // holds the exact angle that has been moved
    var _angle = 0;

    // holds the diraction that has been moved
    var _direction = 0;

    // holds position movement for sliding
    var _pos = { };

    // how many fingers are on the screen
    var _fingers = 0;

    var _first = false;

    var _gesture = null;
    var _prev_gesture = null;

    var _touch_start_time = null;
    var _prev_tap_pos = {x: 0, y: 0};
    var _prev_tap_end_time = null;

    var _hold_timer = null;

    var _offset = {};

    // keep track of the mouse status
    var _mousedown = false;

    var _event_start;
    var _event_move;
    var _event_end;


    /**
     * angle to direction define
     * @param  float    angle
     * @return string   direction
     */
    this.getDirectionFromAngle = function( angle )
    {
        var directions = {
            down: angle >= 45 && angle < 135, //90
            left: angle >= 135 || angle <= -135, //180
            up: angle < -45 && angle > -135, //270
            right: angle >= -45 && angle <= 45 //0
        };

        var direction, key;
        for(key in directions){
            if(directions[key]){
                direction = key;
                break;
            }
        }
        return direction;
    };


    /**
     * count the number of fingers in the event
     * when no fingers are detected, one finger is returned (mouse pointer)
     * @param  event
     * @return int  fingers
     */
    function countFingers( event )
    {
        // there is a bug on android (until v4?) that touches is always 1,
        // so no multitouch is supported, e.g. no, zoom and rotation...
        return event.touches ? event.touches.length : 1;
    }


    /**
     * get the x and y positions from the event object
     * @param  event
     * @return array  [{ x: int, y: int }]
     */
    function getXYfromEvent( event )
    {
        event = event || window.event;

        // no touches, use the event pageX and pageY
        if(!event.touches) {
            var doc = document,
                body = doc.body;

            return [{
                x: event.pageX || event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && doc.clientLeft || 0 ),
                y: event.pageY || event.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && doc.clientTop || 0 )
            }];
        }
        // multitouch, return array with positions
        else {
            var pos = [], src;
            for(var t=0, len=event.touches.length; t<len; t++) {
                src = event.touches[t];
                pos.push({ x: src.pageX, y: src.pageY });
            }
            return pos;
        }
    }


    /**
     * calculate the angle between two points
     * @param object pos1 { x: int, y: int }
     * @param object pos2 { x: int, y: int }
     */
    function getAngle( pos1, pos2 )
    {
        return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * 180 / Math.PI;
    }

    /**
     * trigger an event/callback by name with params
     * @param string name
     * @param array  params
     */
    function triggerEvent( eventName, params )
    {
        // return touches object
        params.touches = getXYfromEvent(params.originalEvent);
        params.type = eventName;

        // trigger callback
        if(isFunction(self["on"+ eventName])) {
            self["on"+ eventName].call(self, params);
        }
    }


    /**
     * cancel event
     * @param   object  event
     * @return  void
     */

    function cancelEvent(event){
        event = event || window.event;
        if(event.preventDefault){
            event.preventDefault();
        }else{
            event.returnValue = false;
            event.cancelBubble = true;
        }
    }


    /**
     * reset the internal vars to the start values
     */
    function reset()
    {
        _pos = {};
        _first = false;
        _fingers = 0;
        _distance = 0;
        _angle = 0;
        _gesture = null;
    }


    var gestures = {
        // hold gesture
        // fired on touchstart
        hold : function(event)
        {
            // only when one finger is on the screen
            if(options.hold) {
                _gesture = 'hold';
                clearTimeout(_hold_timer);

                _hold_timer = setTimeout(function() {
                    if(_gesture == 'hold') {
                        triggerEvent("hold", {
                            originalEvent   : event,
                            position        : _pos.start
                        });
                    }
                }, options.hold_timeout);
            }
        },


        // drag gesture
        // fired on mousemove
        drag : function(event)
        {
            // get the distance we moved
            var _distance_x = _pos.move[0].x - _pos.start[0].x;
            var _distance_y = _pos.move[0].y - _pos.start[0].y;
            _distance = Math.sqrt(_distance_x * _distance_x + _distance_y * _distance_y);

            // drag
            // minimal movement required
            if(options.drag && (_distance > options.drag_min_distance) || _gesture == 'drag') {
                // calculate the angle
                _angle = getAngle(_pos.start[0], _pos.move[0]);
                _direction = self.getDirectionFromAngle(_angle);

                // check the movement and stop if we go in the wrong direction
                var is_vertical = (_direction == 'up' || _direction == 'down');
                if(((is_vertical && !options.drag_vertical) || (!is_vertical && !options.drag_horizontal))
                    && (_distance > options.drag_min_distance)) {
                    return;
                }

                _gesture = 'drag';

                var position = { x: _pos.move[0].x - _offset.left,
                    y: _pos.move[0].y - _offset.top };

                var event_obj = {
                    originalEvent   : event,
                    position        : position,
                    direction       : _direction,
                    distance        : _distance,
                    distanceX       : _distance_x,
                    distanceY       : _distance_y,
                    angle           : _angle
                };

                // on the first time trigger the start event
                if(_first) {
                    triggerEvent("dragstart", event_obj);

                    _first = false;
                }

                // normal slide event
                triggerEvent("drag", event_obj);

                cancelEvent(event);
            }
        },


        // transform gesture
        // fired on touchmove
        transform : function(event)
        {
            if(options.transform) {
                var scale = event.scale || 1;
                var rotation = event.rotation || 0;

                if(countFingers(event) != 2) {
                    return false;
                }

                if(_gesture != 'drag' &&
                    (_gesture == 'transform' || Math.abs(1-scale) > options.scale_treshold
                        || Math.abs(rotation) > options.rotation_treshold)) {
                    _gesture = 'transform';

                    _pos.center = {  x: ((_pos.move[0].x + _pos.move[1].x) / 2) - _offset.left,
                        y: ((_pos.move[0].y + _pos.move[1].y) / 2) - _offset.top };

                    var event_obj = {
                        originalEvent   : event,
                        position        : _pos.center,
                        scale           : scale,
                        rotation        : rotation
                    };

                    // on the first time trigger the start event
                    if(_first) {
                        triggerEvent("transformstart", event_obj);
                        _first = false;
                    }

                    triggerEvent("transform", event_obj);

                    cancelEvent(event);

                    return true;
                }
            }

            return false;
        },


        // tap and double tap gesture
        // fired on touchend
        tap : function(event)
        {
            // compare the kind of gesture by time
            var now = new Date().getTime();
            var touch_time = now - _touch_start_time;

            // dont fire when hold is fired
            if(options.hold && !(options.hold && options.hold_timeout > touch_time)) {
                return;
            }

            // when previous event was tap and the tap was max_interval ms ago
            var is_double_tap = (function(){
                if (_prev_tap_pos && options.tap_double && _prev_gesture == 'tap' && (_touch_start_time - _prev_tap_end_time) < options.tap_max_interval) {
                    var x_distance = Math.abs(_prev_tap_pos[0].x - _pos.start[0].x);
                    var y_distance = Math.abs(_prev_tap_pos[0].y - _pos.start[0].y);
                    return (_prev_tap_pos && _pos.start && Math.max(x_distance, y_distance) < options.tap_double_distance);

                }
                return false;
            })();

            if(is_double_tap) {
                _gesture = 'double_tap';
                _prev_tap_end_time = null;

                triggerEvent("doubletap", {
                    originalEvent   : event,
                    position        : _pos.start
                });
                cancelEvent(event);
            }

            // single tap is single touch
            else {
                _gesture = 'tap';
                _prev_tap_end_time = now;
                _prev_tap_pos = _pos.start;

                if(options.tap) {
                    triggerEvent("tap", {
                        originalEvent   : event,
                        position        : _pos.start
                    });
                    cancelEvent(event);
                }
            }

        }

    };


    function handleEvents(event)
    {
        switch(event.type)
        {
            case 'mousedown':
            case 'touchstart':
                _pos.start = getXYfromEvent(event);
                _touch_start_time = new Date().getTime();
                _fingers = countFingers(event);
                _first = true;
                _event_start = event;

                // borrowed from jquery offset https://github.com/jquery/jquery/blob/master/src/offset.js
                var box = element.getBoundingClientRect();
                var clientTop  = element.clientTop  || document.body.clientTop  || 0;
                var clientLeft = element.clientLeft || document.body.clientLeft || 0;
                var scrollTop  = window.pageYOffset || element.scrollTop  || document.body.scrollTop;
                var scrollLeft = window.pageXOffset || element.scrollLeft || document.body.scrollLeft;

                _offset = {
                    top: box.top + scrollTop - clientTop,
                    left: box.left + scrollLeft - clientLeft
                };

                _mousedown = true;

                // hold gesture
                gestures.hold(event);

                if(options.prevent_default) {
                    cancelEvent(event);
                }
                break;

            case 'mousemove':
            case 'touchmove':
                if(!_mousedown) {
                    return false;
                }
                _event_move = event;
                _pos.move = getXYfromEvent(event);

                if(!gestures.transform(event)) {
                    gestures.drag(event);
                }
                break;

            case 'mouseup':
            case 'mouseout':
            case 'touchcancel':
            case 'touchend':
                if(!_mousedown || (_gesture != 'transform' && event.touches && event.touches.length > 0)) {
                    return false;
                }

                _mousedown = false;
                _event_end = event;

                // drag gesture
                // dragstart is triggered, so dragend is possible
                if(_gesture == 'drag') {
                    triggerEvent("dragend", {
                        originalEvent   : event,
                        direction       : _direction,
                        distance        : _distance,
                        angle           : _angle
                    });
                }

                // transform
                // transformstart is triggered, so transformed is possible
                else if(_gesture == 'transform') {
                    triggerEvent("transformend", {
                        originalEvent   : event,
                        position        : _pos.center,
                        scale           : event.scale,
                        rotation        : event.rotation
                    });
                }
                else {
                    gestures.tap(_event_start);
                }

                _prev_gesture = _gesture;

                // reset vars
                reset();
                break;
        }
    }


    // bind events for touch devices
    // except for windows phone 7.5, it doesnt support touch events..!
    if('ontouchstart' in window) {
        element.addEventListener("touchstart", handleEvents, false);
        element.addEventListener("touchmove", handleEvents, false);
        element.addEventListener("touchend", handleEvents, false);
        element.addEventListener("touchcancel", handleEvents, false);
    }
    // for non-touch
    else {

        if(element.addEventListener){ // prevent old IE errors
            element.addEventListener("mouseout", function(event) {
                if(!isInsideHammer(element, event.relatedTarget)) {
                    handleEvents(event);
                }
            }, false);
            element.addEventListener("mouseup", handleEvents, false);
            element.addEventListener("mousedown", handleEvents, false);
            element.addEventListener("mousemove", handleEvents, false);

            // events for older IE
        }else if(document.attachEvent){
            element.attachEvent("onmouseout", function(event) {
                if(!isInsideHammer(element, event.relatedTarget)) {
                    handleEvents(event);
                }
            }, false);
            element.attachEvent("onmouseup", handleEvents);
            element.attachEvent("onmousedown", handleEvents);
            element.attachEvent("onmousemove", handleEvents);
        }
    }


    /**
     * find if element is (inside) given parent element
     * @param   object  element
     * @param   object  parent
     * @return  bool    inside
     */
    function isInsideHammer(parent, child) {
        // get related target for IE
        if(!child && window.event && window.event.toElement){
            child = window.event.toElement;
        }

        if(parent === child){
            return true;
        }

        // loop over parentNodes of child until we find hammer element
        if(child){
            var node = child.parentNode;
            while(node !== null){
                if(node === parent){
                    return true;
                };
                node = node.parentNode;
            }
        }
        return false;
    }


    /**
     * merge 2 objects into a new object
     * @param   object  obj1
     * @param   object  obj2
     * @return  object  merged object
     */
    function mergeObject(obj1, obj2) {
        var output = {};

        if(!obj2) {
            return obj1;
        }

        for (var prop in obj1) {
            if (prop in obj2) {
                output[prop] = obj2[prop];
            } else {
                output[prop] = obj1[prop];
            }
        }
        return output;
    }

    function isFunction( obj ){
        return Object.prototype.toString.call( obj ) == "[object Function]";
    }
}; });

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/postmessage',[], function() {
    

    /* Simple polyfill to fixup broken iOS postmessage */

    return function postMessage(target, message, origin, ports) {
        // workaround implementations that will not serialize objects
        try {
            target.postMessage(message, origin, ports);
        } catch (e) {
            // legacy webkit-proprietary order, needed for iOS 5
            // (also catches implementations which only allow string messages?)
            if (typeof(message)!=='string') {
                message = JSON.stringify(message);
            }
            target.postMessage(message, ports, origin);
        }
    };
});

// From http://baagoe.com/en/RandomMusings/javascript/
define('src/alea',[], function() {

// Johannes Baagøe <baagoe@baagoe.com>, 2010
function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = data.toString();
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  mash.version = 'Mash 0.9';
  return mash;
}

function Alea() {
  return (function(args) {
    // Johannes Baagøe <baagoe@baagoe.com>, 2010
    var s0 = 0;
    var s1 = 0;
    var s2 = 0;
    var c = 1;

    if (args.length == 0) {
      args = [+new Date];
    }
    var mash = Mash();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for (var i = 0; i < args.length; i++) {
      s0 -= mash(args[i]);
      if (s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(args[i]);
      if (s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(args[i]);
      if (s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;

    var random = function() {
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };
    random.uint32 = function() {
      return random() * 0x100000000; // 2^32
    };
    random.fract53 = function() {
      return random() + 
        (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
    };
    random.version = 'Alea 0.9';
    random.args = args;
    return random;

  } (Array.prototype.slice.call(arguments)));
};

    return { Random: Alea };
});

/**
 * Lawnchair!
 * --- 
 * clientside json store 
 *
 */
define('src/lawnchair/core',[], function() {
var Lawnchair = function (options, callback) {
    // ensure Lawnchair was called as a constructor
    if (!(this instanceof Lawnchair)) return new Lawnchair(options, callback);

    // lawnchair requires json 
    if (!JSON) throw 'JSON unavailable! Include http://www.json.org/json2.js to fix.'
    // options are optional; callback is not
    if (arguments.length <= 2 && arguments.length > 0) {
        callback = (typeof arguments[0] === 'function') ? arguments[0] : arguments[1];
        options  = (typeof arguments[0] === 'function') ? {} : arguments[0];
    } else {
        throw 'Incorrect # of ctor args!'
    }
    // TODO perhaps allow for pub/sub instead?
    if (typeof callback !== 'function') throw 'No callback was provided';
    
    // default configuration 
    this.record = options.record || 'record'  // default for records
    this.name   = options.name   || 'records' // default name for underlying store
    
    // mixin first valid  adapter
    var adapter
    // if the adapter is passed in we try to load that only
    if (options.adapter) {
        for (var i = 0, l = Lawnchair.adapters.length; i < l; i++) {
            if (Lawnchair.adapters[i].adapter === options.adapter) {
              adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined;
              break;
            }
        }
    // otherwise find the first valid adapter for this env
    } 
    else {
        for (var i = 0, l = Lawnchair.adapters.length; i < l; i++) {
            adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined
            if (adapter) break 
        }
    } 
    
    // we have failed 
    if (!adapter) throw 'No valid adapter.' 
    
    // yay! mixin the adapter 
    for (var j in adapter)  
        this[j] = adapter[j]
    
    // call init for each mixed in plugin
    for (var i = 0, l = Lawnchair.plugins.length; i < l; i++) 
        Lawnchair.plugins[i].call(this)

    // init the adapter 
    this.init(options, callback)
}

Lawnchair.adapters = [] 

/** 
 * queues an adapter for mixin
 * ===
 * - ensures an adapter conforms to a specific interface
 *
 */
Lawnchair.adapter = function (id, obj) {
    // add the adapter id to the adapter obj
    // ugly here for a  cleaner dsl for implementing adapters
    obj['adapter'] = id
    // methods required to implement a lawnchair adapter 
    var implementing = 'adapter valid init keys save batch get exists all remove nuke'.split(' ')
    ,   indexOf = this.prototype.indexOf
    // mix in the adapter   
    for (var i in obj) {
        if (indexOf(implementing, i) === -1) throw 'Invalid adapter! Nonstandard method: ' + i
    }
    // if we made it this far the adapter interface is valid 
	// insert the new adapter as the preferred adapter
	Lawnchair.adapters.splice(0,0,obj)
}

Lawnchair.plugins = []

/**
 * generic shallow extension for plugins
 * ===
 * - if an init method is found it registers it to be called when the lawnchair is inited 
 * - yes we could use hasOwnProp but nobody here is an asshole
 */ 
Lawnchair.plugin = function (obj) {
    for (var i in obj) 
        i === 'init' ? Lawnchair.plugins.push(obj[i]) : this.prototype[i] = obj[i]
}

/**
 * helpers
 *
 */
Lawnchair.prototype = {

    isArray: Array.isArray || function(o) { return Object.prototype.toString.call(o) === '[object Array]' },
    
    /**
     * this code exists for ie8... for more background see:
     * http://www.flickr.com/photos/westcoastlogic/5955365742/in/photostream
     */
    indexOf: function(ary, item, i, l) {
        if (ary.indexOf) return ary.indexOf(item)
        for (i = 0, l = ary.length; i < l; i++) if (ary[i] === item) return i
        return -1
    },

    // awesome shorthand callbacks as strings. this is shameless theft from dojo.
    lambda: function (callback) {
        return this.fn(this.record, callback)
    },

    // first stab at named parameters for terse callbacks; dojo: first != best // ;D
    fn: function (name, callback) {
        return typeof callback == 'string' ? new Function(name, callback) : callback
    },

    // returns a unique identifier (by way of Backbone.localStorage.js)
    // TODO investigate smaller UUIDs to cut on storage cost
    uuid: function () {
        var S4 = function () {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },

    // a classic iterator
    each: function (callback) {
        var cb = this.lambda(callback)
        // iterate from chain
        if (this.__results) {
            for (var i = 0, l = this.__results.length; i < l; i++) cb.call(this, this.__results[i], i) 
        }  
        // otherwise iterate the entire collection 
        else {
            this.all(function(r) {
                for (var i = 0, l = r.length; i < l; i++) cb.call(this, r[i], i)
            })
        }
        return this
    }
// --
};
    return Lawnchair;
});

/**
 * indexed db adapter
 * === 
 * - originally authored by Vivian Li
 *
 */
define('src/lawnchair/adapters/indexed-db.js',[], function() { return function(Lawnchair) {

Lawnchair.adapter('indexed-db', (function(){

  function fail(e, i) { console.error('error in indexed-db adapter!', e, i); }

  var STORE_NAME = 'lawnchair';

  // update the STORE_VERSION when the schema used by this adapter changes
  // (for example, if you change the STORE_NAME above)
  var STORE_VERSION = 2;

  var getIDB = function() {
    // XXX firefox is timing out trying to open the db after you clear local
    // storage, without firing onblocked or anything. =(
    return window.indexedDB || window.webkitIndexedDB ||
          /*window.mozIndexedDB || */ window.oIndexedDB ||
          window.msIndexedDB;
  };
  var getIDBTransaction = function() {
      return window.IDBTransaction || window.webkitIDBTransaction ||
          window.mozIDBTransaction || window.oIDBTransaction ||
          window.msIDBTransaction;
  };
  var getIDBKeyRange = function() {
      return window.IDBKeyRange || window.webkitIDBKeyRange ||
          window.mozIDBKeyRange || window.oIDBKeyRange ||
          window.msIDBKeyRange;
  };
  var getIDBDatabaseException = function() {
      return window.IDBDatabaseException || window.webkitIDBDatabaseException ||
          window.mozIDBDatabaseException || window.oIDBDatabaseException ||
          window.msIDBDatabaseException;
  };

  // see https://groups.google.com/a/chromium.org/forum/?fromgroups#!topic/chromium-html5/OhsoAQLj7kc
  var READ_WRITE = (getIDBTransaction() &&
                    'READ_WRITE' in getIDBTransaction()) ?
    getIDBTransaction().READ_WRITE : 'readwrite';

  return {
    
    valid: function() { return !!getIDB(); },
    
    init:function(options, callback) {
        this.idb = getIDB();
        this.waiting = [];
        var request = this.idb.open(this.name, STORE_VERSION);
        var self = this;
        var cb = self.fn(self.name, callback);
        var win = function() {
            // manually clean up event handlers on request; this helps on chrome
            request.onupgradeneeded = request.onsuccess = request.error = null;
            return cb.call(self, self);
        };
        
        var upgrade = function(from, to) {
            // don't try to migrate dbs, just recreate
            try {
                self.db.deleteObjectStore('teststore'); // old adapter
            } catch (e1) { /* ignore */ }
            try {
                self.db.deleteObjectStore(STORE_NAME);
            } catch (e2) { /* ignore */ }

            // ok, create object store.
            self.db.createObjectStore(STORE_NAME/*, { autoIncrement: true}*/);
            self.store = true;
        };
        request.onupgradeneeded = function(event) {
            self.db = request.result;
            self.transaction = request.transaction;
            upgrade(event.oldVersion, event.newVersion);
            // will end up in onsuccess callback
        };
        request.onsuccess = function(event) {
           self.db = request.result; 
            
            if (self.db.version != (''+STORE_VERSION)) {
              // DEPRECATED API: modern implementations will fire the
              // upgradeneeded event instead.
              var oldVersion = self.db.version;
              var setVrequest = self.db.setVersion(''+STORE_VERSION);
              // onsuccess is the only place we can create Object Stores
              setVrequest.onsuccess = function(event) {
                  var transaction = setVrequest.result;
                  setVrequest.onsuccess = setVrequest.onerror = null;
                  // can't upgrade w/o versionchange transaction.
                  upgrade(oldVersion, STORE_VERSION);
                  transaction.oncomplete = function() {
                      for (var i = 0; i < self.waiting.length; i++) {
                          self.waiting[i].call(self);
                      }
                      self.waiting = [];
                      win();
                  };
              };
              setVrequest.onerror = function(e) {
                  setVrequest.onsuccess = setVrequest.onerror = null;
                  console.log("Failed to create objectstore " + e);
                  fail(e);
              };
            } else {
                self.store = true;
                for (var i = 0; i < self.waiting.length; i++) {
                      self.waiting[i].call(self);
                }
                self.waiting = [];
                win();
            }
        }
        request.onblocked = function(ev) {
            console.log('onblocked!'); // XXX
        };
        request.onerror = function(ev) {
            if (request.errorCode === getIDBDatabaseException().VERSION_ERR) {
                // xxx blow it away
                self.idb.deleteDatabase(self.name);
                // try it again.
                return self.init(options, callback);
            }
            console.error('Failed to open database');
        };
    },

    save:function(obj, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.save(obj, callback);
            });
            return;
         }
         
         var self = this, request;
         var win  = function (e) {
             // manually clean up event handlers; helps free memory on chrome.
             request.onsuccess = request.onerror = null;
             if (callback) { obj.key = e.target.result; self.lambda(callback).call(self, obj) }
         };

         var trans = this.db.transaction(STORE_NAME, READ_WRITE);
         var store = trans.objectStore(STORE_NAME);
         request = obj.key ? store.put(obj, obj.key) : store.put(obj);
         
         request.onsuccess = win;
         request.onerror = fail;
         
         return this;
    },
    
    // FIXME this should be a batch insert / just getting the test to pass...
    batch: function (objs, cb) {
        
        var results = []
        ,   done = false
        ,   self = this

        var updateProgress = function(obj) {
            results.push(obj)
            done = results.length === objs.length
        }

        var checkProgress = setInterval(function() {
            if (done) {
                if (cb) self.lambda(cb).call(self, results)
                clearInterval(checkProgress)
            }
        }, 200)

        for (var i = 0, l = objs.length; i < l; i++) 
            this.save(objs[i], updateProgress)
        
        return this
    },
    

    get:function(key, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.get(key, callback);
            });
            return;
        }
        
        
        var self = this;
        var win  = function (e) { if (callback) { self.lambda(callback).call(self, e.target.result) }};
        
        if (!this.isArray(key)){
            var req = this.db.transaction(STORE_NAME).objectStore(STORE_NAME).get(key);

            req.onsuccess = function(event) {
                req.onsuccess = req.onerror = null;
                win(event);
            };
            req.onerror = function(event) {
                console.log("Failed to find " + key);
                req.onsuccess = req.onerror = null;
                fail(event);
            };
        
        // FIXME: again the setInterval solution to async callbacks..    
        } else {

            // note: these are hosted.
            var results = []
            ,   done = false
            ,   keys = key

            var updateProgress = function(obj) {
                results.push(obj)
                done = results.length === keys.length
                if (done) {
                    self.lambda(callback).call(self, results);
                }
            }

            for (var i = 0, l = keys.length; i < l; i++) 
                this.get(keys[i], updateProgress)
            
        }

        return this;
    },

    exists:function(key, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.exists(key, callback);
            });
            return;
        }

        var self = this;

        var req = this.db.transaction(STORE_NAME).objectStore(STORE_NAME).openCursor(getIDBKeyRange().only(key));

        req.onsuccess = function(event) {
            req.onsuccess = req.onerror = null;
            // exists iff req.result is not null
            // XXX but firefox returns undefined instead, sigh XXX
            var undef;
            self.lambda(callback).call(self, event.target.result !== null &&
                                             event.target.result !== undef);
        };
        req.onerror = function(event) {
            req.onsuccess = req.onerror = null;
            console.log("Failed to test for " + key);
            fail(event);
        };

        return this;
    },

    all:function(callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.all(callback);
            });
            return;
        }
        var cb = this.fn(this.name, callback) || undefined;
        var self = this;
        var objectStore = this.db.transaction(STORE_NAME).objectStore(STORE_NAME);
        var toReturn = [];
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
               toReturn.push(cursor.value);
               cursor['continue']();
          }
          else {
              if (cb) cb.call(self, toReturn);
          }
        };
        return this;
    },

    remove:function(keyOrObj, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.remove(keyOrObj, callback);
            });
            return;
        }
        if (typeof keyOrObj == "object") {
            keyOrObj = keyOrObj.key;
        }
        var self = this, request;
        var win  = function () {
            request.onsuccess = request.onerror = null;
            if (callback) self.lambda(callback).call(self)
        };
        
        request = this.db.transaction(STORE_NAME, READ_WRITE).objectStore(STORE_NAME)['delete'](keyOrObj);
        request.onsuccess = win;
        request.onerror = fail;
        return this;
    },

    nuke:function(callback, optDeleteOutright) {
        if(!this.store) {
            this.waiting.push(function() {
                this.nuke(callback, optDeleteOutright);
            });
            return;
        }
        
        var self = this
        ,   win  = callback ? function() { self.lambda(callback).call(self) } : function(){};
        
        if (optDeleteOutright) {
            // can't use this lawnchair for anything after this completes
            if (this.waiting.length) fail();
            this.idb.deleteDatabase(this.name);
            delete this.store;
            delete this.waiting;
            win();
            return;
        }

        try {
            this.db
                .transaction(STORE_NAME, READ_WRITE)
                .objectStore(STORE_NAME).clear().onsuccess = win;
            
        } catch(e) {
            fail();
        }
        return this;
    }
    
  };
  
})());

};
});

/**
 * dom storage adapter 
 * === 
 * - originally authored by Joseph Pecoraro
 *
 */ 
//
// TODO does it make sense to be chainable all over the place?
// chainable: nuke, remove, all, get, save, all    
// not chainable: valid, keys
//
define('src/lawnchair/adapters/dom.js',[], function() { return function(Lawnchair) {

Lawnchair.adapter('dom', (function() {
    var storage = window.localStorage
    // the indexer is an encapsulation of the helpers needed to keep an ordered index of the keys
    var indexer = function(name) {
        return {
            // the key
            key: name + '._index_',
            // returns the index
            all: function() {
				var a  = storage.getItem(this.key)
				if (a) {
					a = JSON.parse(a)
				}
                if (a === null) storage.setItem(this.key, JSON.stringify([])) // lazy init
                return JSON.parse(storage.getItem(this.key))
            },
            // adds a key to the index
            add: function (key) {
                var a = this.all()
                a.push(key)
                storage.setItem(this.key, JSON.stringify(a))
            },
            // deletes a key from the index
            del: function (key) {
                var a = this.all(), r = []
                // FIXME this is crazy inefficient but I'm in a strata meeting and half concentrating
                for (var i = 0, l = a.length; i < l; i++) {
                    if (a[i] != key) r.push(a[i])
                }
                storage.setItem(this.key, JSON.stringify(r))
            },
            // returns index for a key
            find: function (key) {
                var a = this.all()
                for (var i = 0, l = a.length; i < l; i++) {
                    if (key === a[i]) return i 
                }
                return false
            }
        }
    }
    
    // adapter api 
    return {
    
        // ensure we are in an env with localStorage 
        valid: function () {
            return !!storage 
        },

        init: function (options, callback) {
            this.indexer = indexer(this.name)
            if (callback) this.fn(this.name, callback).call(this, this)  
        },
        
        save: function (obj, callback) {
            var key = obj.key ? this.name + '.' + obj.key : this.name + '.' + this.uuid()
            // if the key is not in the index push it on
            if (this.indexer.find(key) === false) this.indexer.add(key)
            // now we kil the key and use it in the store colleciton    
            delete obj.key;
            storage.setItem(key, JSON.stringify(obj))
            obj.key = key.slice(this.name.length + 1)
            if (callback) {
                this.lambda(callback).call(this, obj)
            }
            return this
        },

        batch: function (ary, callback) {
            var saved = []
            // not particularily efficient but this is more for sqlite situations
            for (var i = 0, l = ary.length; i < l; i++) {
                this.save(ary[i], function(r){
                    saved.push(r)
                })
            }
            if (callback) this.lambda(callback).call(this, saved)
            return this
        },
       
        // accepts [options], callback
        keys: function(callback) {
            if (callback) { 
                var name = this.name
                ,   keys = this.indexer.all().map(function(r){ return r.replace(name + '.', '') })
                this.fn('keys', callback).call(this, keys)
            }
            return this // TODO options for limit/offset, return promise
        },
        
        get: function (key, callback) {
            if (this.isArray(key)) {
                var r = []
                for (var i = 0, l = key.length; i < l; i++) {
                    var k = this.name + '.' + key[i]
                    var obj = storage.getItem(k)
                    if (obj) {
						obj = JSON.parse(obj)
                        obj.key = key[i]
                        r.push(obj)
                    } 
                }
                if (callback) this.lambda(callback).call(this, r)
            } else {
                var k = this.name + '.' + key
                var  obj = storage.getItem(k)
                if (obj) {
					obj = JSON.parse(obj)
					obj.key = key
				}
                if (callback) this.lambda(callback).call(this, obj)
            }
            return this
        },

        exists: function (key, cb) {
            var exists = this.indexer.find(this.name+'.'+key) === false ? false : true ;
            this.lambda(cb).call(this, exists);
            return this;
        },
        // NOTE adapters cannot set this.__results but plugins do
        // this probably should be reviewed
        all: function (callback) {
            var idx = this.indexer.all()
            ,   r   = []
            ,   o
            ,   k
            for (var i = 0, l = idx.length; i < l; i++) {
                k     = idx[i] //v
                o     = JSON.parse(storage.getItem(k))
                o.key = k.replace(this.name + '.', '')
                r.push(o)
            }
            if (callback) this.fn(this.name, callback).call(this, r)
            return this
        },
        
        remove: function (keyOrObj, callback) {
            var key = this.name + '.' + ((keyOrObj.key) ? keyOrObj.key : keyOrObj)
            this.indexer.del(key)
            storage.removeItem(key)
            if (callback) this.lambda(callback).call(this)
            return this
        },
        
        nuke: function (callback) {
            this.all(function(r) {
                for (var i = 0, l = r.length; i < l; i++) {
                    this.remove(r[i]);
                }
                if (callback) this.lambda(callback).call(this)
            })
            return this 
        }
}})());

};
});

// window.name code courtesy Remy Sharp: http://24ways.org/2009/breaking-out-the-edges-of-the-browser
define('src/lawnchair/adapters/window-name.js',[], function() { return function(Lawnchair) {

Lawnchair.adapter('window-name', (function(index, store) {
    if (typeof window==='undefined') {
        window = { top: { } }; // node/optimizer compatibility
    }

    var data = window.top.name ? JSON.parse(window.top.name) : {}

    return {

        valid: function () {
            return typeof window.top.name != 'undefined' 
        },

        init: function (options, callback) {
            data[this.name] = data[this.name] || {index:[],store:{}}
            index = data[this.name].index
            store = data[this.name].store
            this.fn(this.name, callback).call(this, this)
        },

        keys: function (callback) {
            this.fn('keys', callback).call(this, index)
            return this
        },

        save: function (obj, cb) {
            // data[key] = value + ''; // force to string
            // window.top.name = JSON.stringify(data);
            var key = obj.key || this.uuid()
            this.exists(key, function(exists) {
                if (!exists) {
                    if (obj.key) delete obj.key
                    index.push(key)
                }
                store[key] = obj
                window.top.name = JSON.stringify(data) // TODO wow, this is the only diff from the memory adapter
                if (cb) {
                    obj.key = key
                    this.lambda(cb).call(this, obj)
                }
            })
            return this
        },

        batch: function (objs, cb) {
            var r = []
            for (var i = 0, l = objs.length; i < l; i++) {
                this.save(objs[i], function(record) {
                    r.push(record)
                })
            }
            if (cb) this.lambda(cb).call(this, r)
            return this
        },
        
        get: function (keyOrArray, cb) {
            var r;
            if (this.isArray(keyOrArray)) {
                r = []
                for (var i = 0, l = keyOrArray.length; i < l; i++) {
                    r.push(store[keyOrArray[i]]) 
                }
            } else {
                r = store[keyOrArray]
                if (r) r.key = keyOrArray
            }
            if (cb) this.lambda(cb).call(this, r)
            return this 
        },
        
        exists: function (key, cb) {
            this.lambda(cb).call(this, !!(store[key]))
            return this
        },

        all: function (cb) {
            var r = []
            for (var i = 0, l = index.length; i < l; i++) {
                var obj = store[index[i]]
                obj.key = index[i]
                r.push(obj)
            }
            this.fn(this.name, cb).call(this, r)
            return this
        },
        
        remove: function (keyOrArray, cb) {
            var del = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray]
            for (var i = 0, l = del.length; i < l; i++) {
                delete store[del[i]]
                index.splice(this.indexOf(index, del[i]), 1)
            }
            window.top.name = JSON.stringify(data)
            if (cb) this.lambda(cb).call(this)
            return this
        },

        nuke: function (cb) {
            store = {}
            index = []
            window.top.name = JSON.stringify(data)
            if (cb) this.lambda(cb).call(this)
            return this 
        }
    }
/////
})())

};
});

// Load lawnchair core and appropriate adapters.
define('src/lawnchair/lawnchair',['./core',
        // use these adapters, in this order (prefer the first)
        './adapters/indexed-db.js',
        './adapters/dom.js',
        './adapters/window-name.js'], function(Lawnchair) {

            // go through arguments from last to first
            for (var i=arguments.length-1; i>0; i--) {
                arguments[i](Lawnchair);
            }

            // return the Lawnchair interface
            return Lawnchair;
        });

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/prandom',['./alea','./lawnchair/lawnchair'], function(Alea, Lawnchair) {

    // Random number generator with persistent seed
    // eg for better UUID-generation functions.
    // Start with decent random-number generator (Alea)
    // if first time startup, seed it with current time
    //  (not very collision-resistant)
    // future starts will use a persistent random pool to yield
    // better randomness.

    var makeRandom = function(callback) {
        // Try to get persistent random pool
        Lawnchair({name:'uuid'}, function() {
            var lawnchair = this;
            var withPool = function(pool) {
                var random = Alea.Random(Date.now(), Math.random(),
                                         JSON.stringify(pool));
                // store back into the pool (fire-and-forget)
                lawnchair.save({ key:'pool', time: Date.now(),
                                 data: [random(),random(),random()] });
                // improve the lawnchair uuid function
                // (yes, this is a monkey patch, but there's a circular dep)
                var uuid = function () {
                    if (window.btoa) {
                        // compact 96-bit UUID
                        var rand8 = function() {
                            return random.uint32() & 0xFF;
                        };
                        var s = String.fromCharCode(
                            rand8(), rand8(), rand8(),
                            rand8(), rand8(), rand8(),
                            rand8(), rand8(), rand8());
                        return window.btoa(s).replace('+','-').replace('/','_');
                    }
                    var S4 = function () {
                        return (((1+random())*0x10000)|0).toString(16)
                            .substring(1);
                    };
                    var S3 = function() {
                        return arguments[Math.floor(random()*arguments.length)]+
                            S4().substring(1);
                    };
                    // "version 4 (random)" UUIDs (122 bits)
                    return (S4()+S4()+"-"+S4()+"-"+S3('4')+"-"+
                            S3('8','9','a','b')+"-"+
                            S4()+S4()+S4());
                };
                Lawnchair.prototype.uuid = random.uuid = uuid;
                // ok, now we've got our UUID function, give it to callback
                callback(random);
            };
            lawnchair.exists('pool', function(hasPool) {
                if (hasPool) {
                    lawnchair.get('pool', withPool);
                } else {
                    withPool({});
                }
            });
        });
    };

    // implement requirejs plugin interface to ease startup dependencies
    return {
        load: function(name, req, onLoad, config) {
            if (config.isBuild) {
                // not an inline-able plugin.
                onLoad(null);
            } else {
                makeRandom(onLoad);
            }
        }
    };
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false */
define('src/drawing',['./brush','./color','./drawcommand','./layer','./prandom!'], function(Brush, Color, DrawCommand, Layer, prandom) {

    // A Drawing is a sequence of DrawCommands and a set of layer.
    // It maintains the playback and undo/redo logic

    // Adjust this to trade off between the space taken by checkpoints
    // and the speed of replay.  The small interval is used when editing;
    // the large one is used when loading or doing playback
    var SMALL_CHECKPOINT_INTERVAL = 300;
    var LARGE_CHECKPOINT_INTERVAL = 10*SMALL_CHECKPOINT_INTERVAL;

    // Adjust this to trade off between network packet size and the
    // number of network transactions needed to load a drawing
    // (chunk size of 1000 is 10k-50k a chunk *gzip compressed*)
    var DEFAULT_CHUNK_SIZE = 1000;

    var Drawing = function() {
        this.domElement = document.createElement('div');
        this.commands = [];
        this.commands.last = 0;
        // .end might not == .length if we've got a redo buffer at the end
        this.commands.end = 0;
        this.layers = [ ];
        // checkpoint list, for fast undo
        this.checkpoints = [];
        this.checkpointOften = true;
        this.resize(100,100,1); // default size
        this.layers.current = this.addLayer(); // one default layer
        // chunks for fast save/restore/sync
        this.chunks = [];
        this.ctime = Date.now(); // creation time
        // hack in a brush change and color change
        // XXX we should have a different way to synchronize brush after load
        this.brush = new Brush(Color.BLACK, 'soft', 20, 0.7, 0.2);
        this.addCmd(DrawCommand.create_color_change(this.brush.color));
        this.addCmd(DrawCommand.create_brush_change({
            brush_type: this.brush.type,
            size: this.brush.size,
            opacity: this.brush.opacity,
            spacing: this.brush.spacing
        }));
        // where to start looking for a letter; this probably should be
        // refactored elsewhere.
        this.commands.recog = this.commands.end;
    };
    Drawing.prototype = { };
    Drawing.prototype.attachToContainer = function(container) {
        container.appendChild(this.domElement);
    };
    Drawing.prototype.removeFromContainer = function(container) {
        container.removeChild(this.domElement);
    };
    Drawing.prototype.addLayer = function() {
        var l = new Layer();
        l.resize(this.width, this.height, this.pixelRatio);
        this.layers.push(l);
        this.domElement.appendChild(l.domElement);
        return this.layers.length - 1; // index of new layer
    };
    Drawing.prototype.addCmd = function(cmd) {
        this.commands[this.commands.end++] = cmd;
        // truncate any redo buffer
        this.commands.length = this.commands.end;
        // truncate any stale checkpoints
        while (this.checkpoints.length > 0 &&
               this.checkpoints[this.checkpoints.length-1].pos >=
               this.commands.length) {
            this.checkpoints.pop();
        }
        // truncate stale chunks
        // Note the deliberate "off by one" in the comparison -- we want
        // to invalidate the final partial chunk written after a save, to
        // ensure that only the last chunk is partial.
        while (this.chunks.length > 0 &&
               this.chunks[this.chunks.length-1].end >=
               (this.commands.length-1)) {
            this.chunks.pop();
        }
    };
    Drawing.START =  0;
    Drawing.END   = -1;
    Drawing.prototype.setCmdPos = function(pos, optTimeLimit) {
        var startTime = Date.now();
        if (pos===Drawing.END) { pos = this.commands.end; }
        console.assert(pos <= this.commands.end);
        // use checkpoints for efficiency
        var checkpoint = this._findNearestCheckpoint(pos);
        if (checkpoint) {
            if ((pos < this.commands.last) ||
                (pos - checkpoint.pos) < (pos - this.commands.last)) {
                // restoring checkpoint also sets this.commands.last
                this._restoreCheckpoint(checkpoint);
            }
        } else if (pos < this.commands.last) {
            this._clear();
            this.commands.last = 0;
        }
        console.assert(this.commands.last <= pos);
        while (this.commands.last < pos) {
            this._execCommand(this.commands[this.commands.last++]);
            if (this.commands[this.commands.last-1].type ===
                DrawCommand.Type.DRAW_END) {
                this.addCheckpoint();
                if (optTimeLimit && (Date.now() - startTime) > optTimeLimit) {
                    break;
                }
            }
        }
        // returns 'true' if there are more commands not yet drawn
        return (this.commands.last < this.commands.end);
    };
    Drawing.prototype.setCmdTime = function(timeDelta, optTimeLimit) {
        // scan ahead looking for the proper end point
        var i = this.commands.last;
        if (i === this.commands.end) {
            return false; // no more commands to draw
        }
        var lastCmd = this.commands[i++]; // always execute at least one cmd
        while (i < this.commands.end && timeDelta > 0) {
            var thisCmd = this.commands[i++];
            if (lastCmd.type===DrawCommand.Type.DRAW &&
                thisCmd.type===DrawCommand.Type.DRAW) {
                timeDelta -= (thisCmd.time - lastCmd.time);
            }
            lastCmd = thisCmd;
        }
        // okay, execute to this location
        // returns 'true' if there are more commands not yet drawn
        return this.setCmdPos(i, optTimeLimit);
    };

    Drawing.prototype.undo = function(optTimeLimit) {
        if (this.commands.end===0) { return false; /* nothing to undo */ }
        var i = this.commands.end-1;
        while (i >= 0 && this.commands[i].type !== DrawCommand.Type.DRAW_START){
            i--;
        }
        if (i<0) { return false; /* nothing but color changes to undo */ }
        // i should now point to a DRAW_START command.
        this.setCmdPos(i, optTimeLimit);
        this.commands.end = i;
        var isMore = (this.commands.last < this.commands.end);
        return isMore;
    };
    Drawing.prototype.redo = function(optTimeLimit) {
        if (this.commands.end >= this.commands.length) {
            return false; // nothing to redo
        }
        // scan forward for the next DRAW_END
        var i = this.commands.end;
        while (i < this.commands.length &&
               this.commands[i].type !== DrawCommand.Type.DRAW_END) {
            i++;
        }
        while (i < this.commands.length &&
               this.commands[i].type !== DrawCommand.Type.DRAW_START) {
            i++;
        }
        this.commands.end = i;
        var isMore = this.setCmdPos(Drawing.END, optTimeLimit);
        return isMore;
    };
    Drawing.prototype.resize = function(width, height, pixelRatio) {
        this.layers.forEach(function(l) {
            l.resize(width, height, pixelRatio);
        });
        this.commands.last = 0;
        this.width = width;
        this.height = height;
        this.pixelRatio = pixelRatio;
        // invalidate any checkpoints which are too small for the new size
        this.checkpoints = this.checkpoints.filter(function(c) {
            return c.width >= width &&
                c.height >= height &&
                c.pixelRatio===pixelRatio;
        });
    };
    Drawing.prototype._clear = function() {
        this.layers.forEach(function(l) { l.clear(); });
    };
    // returns true iff a visible change to the canvas was made
    Drawing.prototype._execCommand = function(cmd) {
        switch(cmd.type) {
        case DrawCommand.Type.DRAW_START:
            this.layers.current = cmd.layer;
            return this.layers[this.layers.current].execCommand(cmd);
        case DrawCommand.Type.DRAW:
        case DrawCommand.Type.DRAW_END:
            return this.layers[this.layers.current].execCommand(cmd,this.brush);
        case DrawCommand.Type.COLOR_CHANGE:
            this.brush.color = cmd.color;
            this.layers.forEach(function(l) { l.execCommand(cmd); });
            return false;
        case DrawCommand.Type.BRUSH_CHANGE:
            ['brush_type','size','opacity','spacing'].forEach(function(f) {
                if (f in cmd) {
                    this.brush[(f==='brush_type')?'type':f] = cmd[f];
                }
            }.bind(this));
            this.layers.forEach(function(l) { l.execCommand(cmd); });
            return false;
        default:
            console.assert(false, "Unknown drawing command", cmd);
            break;
        }
    };
    Drawing.prototype._saveCheckpoint = function() {
        return new Drawing.Checkpoint({
            pos: this.commands.last,
            brush: this.brush.clone(),
            layers: this.layers.map(function(layer) {
                return layer.saveCheckpoint();
            }),
            width: this.width,
            height: this.height,
            pixelRatio: this.pixelRatio
        });
    };
    Drawing.prototype._restoreCheckpoint = function(checkpoint) {
        this.commands.last = checkpoint.pos;
        this.brush = checkpoint.brush.clone();
        checkpoint.layers.forEach(function(chk, i) {
            this.layers[i].restoreCheckpoint(chk);
        }.bind(this));
    };
    var _binarySearch = function(arr, find, comparator) {
        var low = 0, high = arr.length - 1, i, comparison;
        while (low <= high) {
            i = low + Math.floor((high - low) / 2); // avoid canonical bug
            comparison = comparator(arr[i], find);
            if (comparison < 0) {
                low = i + 1;
            } else if (comparison > 0) {
                high = i - 1;
            } else {
                return i;
            }
        }
        // if search key not in the list, return (-(insertion point) - 1)
        return -(low + 1);
    };
    var _chkcmp = function(c1, c2) { return c1.pos - c2.pos; };
    Drawing.prototype._findNearestCheckpoint = function(pos) {
        // "nearest" means "nearest but not after the specified pos"
        var ipos = _binarySearch(this.checkpoints, {pos:pos}, _chkcmp);
        if (ipos >= 0) {
            // found exactly!
            return this.checkpoints[ipos];
        }
        ipos = -(ipos + 1); // insertion point
        if (ipos===0) {
            return null; // no appropriate checkpoint found
        }
        return this.checkpoints[ipos-1];
    };
    Drawing.prototype.addCheckpoint = function(optForce) {
        // keep checkpoints array in sorted order
        var nc = { pos: this.commands.last };
        var ipos = _binarySearch(this.checkpoints, nc, _chkcmp);
        if (ipos >= 0) {
            // this checkpoint already present
            return;
        }
        ipos = -(ipos + 1); // insertion point
        // don't save too many checkpoints
        var dist = nc.pos - ((ipos===0) ? 0 : this.checkpoints[ipos-1].pos);
        var checkpoint_interval = (this.checkpointOften) ?
            SMALL_CHECKPOINT_INTERVAL : LARGE_CHECKPOINT_INTERVAL;
        if (dist < checkpoint_interval && !optForce) {
            // too close to existing checkpoint, skip it
            return;
        }
        this.checkpoints.splice(ipos, 0, this._saveCheckpoint());
        // now thin out the checkpoint list
        this._thinCheckpoints();
    };
    Drawing.prototype._thinCheckpoints = function() {
        // thin out old checkpoints
        var nc = [], i;
        var prevPos = 0; // always a virtual checkpoint at 0
        for (i=0; i<this.checkpoints.length-1; i++) {
            if (this.checkpoints[i].pos > this.commands.last) { break; }
            // thin out "such that the interval between checkpoints [does] not
            // grow larger that the distance from the end of the resulting
            // combined interval to the current execution point."
            // this creates a set of exponentially larger checkpoint intervals,
            // ensuring that the time for this scan, and the space taken by
            // the checkpoints, are O(ln N) (where N is the # of strokes)
            // http://dx.doi.org/10.1145/349299.349339 (section 5.1)
            var between = this.checkpoints[i+1].pos - prevPos;
            var fromEnd = this.commands.last - this.checkpoints[i+1].pos;
            if (between > fromEnd) {
                // keep this checkpoint
                nc.push(this.checkpoints[i]);
                prevPos = this.checkpoints[i].pos;
            } // else discard it
        }
        // keep all checkpoints currently in the future
        for ( ; i<this.checkpoints.length; i++) {
            nc.push(this.checkpoints[i]);
        }
        this.checkpoints = nc;
    };

    Drawing.Checkpoint = function(props) {
        var name;
        for (name in props) {
            if (props.hasOwnProperty(name)) {
                this[name] = props[name];
            }
        }
    };
    Drawing.Checkpoint.prototype = {};
    Drawing.Checkpoint.fromJSON = function(str, callback) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        json.brush = Brush.fromJSON(json.brush);
        if (json.layers.length===0) {
            callback(new Drawing.Checkpoint(json));
        } else {
            var completed = 0;
            json.layers.forEach(function(l, i) {
                Layer.Checkpoint.fromJSON(l, function(lc) {
                    json.layers[i] = lc;
                    completed++;
                    if (completed === json.layers.length) {
                        callback(new Drawing.Checkpoint(json));
                    }
                });
            });
        }
    };

    Drawing.Chunk = function(drawing, num, start, end, prev) {
        this.drawing = drawing;
        this.uuid = prandom.uuid();
        this.num = num;
        this.start = start;
        this.end = end;
        this.prev = prev;
    };
    Drawing.Chunk.prototype = {};
    Drawing.Chunk.prototype.toJSON = function() {
        console.assert(this.end <= this.drawing.commands.length);
        var json = {
            num: this.num,
            uuid: this.uuid,
            start: this.start,
            prev: this.prev
        };
        if (this.drawing.uuid) { json.drawing = this.drawing.uuid; }
        if (this.checkpoint) {
            var cp = this.drawing._findNearestCheckpoint(this.end);
            if (cp) { json.checkpoint = cp; }
        }
        json.commands = this.drawing.commands.slice(this.start, this.end);
        return json;
    };
    Drawing.prototype._makeChunks = function() {
        // linear progression of chunks
        // FUTURE: invalidate some chunks to give logarithmic # of chunks?
        if (this.commands.length === 0) { return; }
        // remove stale checkpoint chunks
        // .. remove checkpoint chunks which are now too far back
        while (this.chunks.length > 0 &&
               this.chunks[this.chunks.length-1].checkpoint &&
               (this.chunks[this.chunks.length-1].end + DEFAULT_CHUNK_SIZE) <
               this.commands.length) {
            this.chunks.pop();
        }
        // .. remove non-checkpoint chunk if we need to make it a checkpoint
        while (this.chunks.length > 0 &&
               (!this.chunks[this.chunks.length-1].checkpoint) &&
               (this.chunks[this.chunks.length-1].end + DEFAULT_CHUNK_SIZE) >=
               this.commands.length) {
            this.chunks.pop();
        }
        // .. XXX this doesn't deal with checkpoint size changes
        while (true) {
            // create another chunk
            var start = (this.chunks.length===0) ? 0 :
                this.chunks[this.chunks.length-1].end;
            if (start >= this.commands.length) {
                break;
            }
            var end = Math.min(start + DEFAULT_CHUNK_SIZE,
                               this.commands.length);
            var prevChunk = (this.chunks.length===0) ? null :
                this.chunks[this.chunks.length-1];
            var newChunk = new Drawing.Chunk(
                this,
                prevChunk ? (prevChunk.num+1) : 0,
                start, end,
                prevChunk ? (prevChunk.uuid) : null);
            if (newChunk.end < this.commands.length &&
                newChunk.end + DEFAULT_CHUNK_SIZE >= this.commands.length) {
                // checkpoint goes on penultimate chunk
                newChunk.checkpoint = true;
            }
            this.chunks.push(newChunk);
        }
    };

    Drawing.prototype.toJSON = function(useChunks) {
        // save only the 1st and last checkpoints to save space.
        var ncheckpoints = [];
        if (this.checkpoints.length>0 && !useChunks) {
            ncheckpoints.push(this.checkpoints[0]);
        }
        if (this.checkpoints.length>1 && !useChunks) {
            ncheckpoints.push(this.checkpoints[this.checkpoints.length-1]);
        }
        var json = {
            end: this.commands.end, // save redo buffer
            nLayers: this.layers.length,
            width: this.width,
            height: this.height,
            pixelRatio: this.pixelRatio,
            ctime: this.ctime,
            checkpoints: ncheckpoints
        };
        if (this.uuid) {
            json.uuid = this.uuid;
        }
        if (useChunks) {
            this._makeChunks();
        }
        if (useChunks && this.chunks.length > 0) {
            json.firstChunk = this.chunks[0].uuid;
            json.lastChunk = this.chunks[this.chunks.length-1].uuid;
            json.nChunks = this.chunks.length;
        } else {
            json.commands = this.commands;
        }
        return json;
    };
    var fromChunksOrJSON = function(str, chunks, callback) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        var drawing = new Drawing();
        while (drawing.layers.length < (json.nLayers || json.nlayers)) {
            drawing.addLayer();
        }
        drawing.commands.length=drawing.commands.end=drawing.commands.last = 0;
        var checkpoints = [];
        if (chunks) {
            drawing.chunks = chunks.map(function(str) {
                var json = (typeof(str)==='string') ? JSON.parse(str) : str;
                json.commands.forEach(function(c) {
                    drawing.addCmd(DrawCommand.fromJSON(c));
                });
                var chunk = new Drawing.Chunk(drawing, json.num, json.start,
                                              json.start + json.commands.length,
                                              json.prev);
                chunk.uuid = json.uuid;
                if (json.checkpoint) {
                    checkpoints.push(json.checkpoint);
                    chunk.checkpoint = true;
                }
                return chunk;
            });
        } else {
            json.commands.forEach(function(c) {
                drawing.addCmd(DrawCommand.fromJSON(c));
            });
            checkpoints = json.checkpoints;
        }
        drawing.commands.end = drawing.commands.recog = json.end;
        drawing.resize(json.width, json.height, json.pixelRatio || 1);
        if (json.active_layer) {
            drawing.layers.current = json.active_layer || 0;
        }
        if (json.initial_playback_speed) {
            drawing.initial_playback_speed = json.initial_playback_speed || 2;
        }
        if (json.uuid) {
            drawing.uuid = json.uuid;
        }
        if (json.ctime) {
            drawing.ctime = json.ctime;
        }
        // restore checkpoints
        if (checkpoints.length===0) {
            callback(drawing);
        } else {
            var completed = 0;
            checkpoints.forEach(function(c, i) {
                Drawing.Checkpoint.fromJSON(c, function(chk) {
                    drawing.checkpoints[i] = chk;
                    completed++;
                    if (completed === checkpoints.length) {
                        callback(drawing);
                    }
                });
            });
        }
    };
    Drawing.fromJSON = function(str, callback) {
        return fromChunksOrJSON(str, null, callback);
    };
    Drawing.fromChunks = function(top, chunks, callback) {
        return fromChunksOrJSON(top, chunks, callback);
    };

    return Drawing;
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global
  define:true, console:false, require:false, module:false, window:false,
  Float64Array:false, Uint16Array:false
 */

define('src/hand/features',['../point', '../compat'], function(Point, Compat) {
    
    // Workaround for iPhone, which is missing Float64Array
    var Float64Array = Compat.Float64Array;

    // tunable parameters
    var SMOOTH_N = 3, SMOOTH_ALPHA = 0.25;
    var RESAMPLE_INTERVAL = 1/7;//1/10;

    var DELTAWINDOW=2, ACCWINDOW=2; // should match values in HTK config

    var Box = function(tl, br) {
        this.tl = tl;
        this.br = br;
    };
    Box.prototype = {
        unionPt: function(pt) {
            if (pt.x < this.tl.x) { this.tl.x = pt.x; }
            if (pt.y < this.tl.y) { this.tl.y = pt.y; }
            if (pt.x > this.br.x) { this.br.x = pt.x; }
            if (pt.y > this.br.y) { this.br.y = pt.y; }
        },
        union: function(box) {
            this.unionPt(box.tl);
            this.unionPt(box.br);
        },
        size: function() {
            return { width: this.br.x - this.tl.x,
                     height: this.br.y - this.tl.y };
        }
    };
    Box.fromPts = function(pts) {
        // pts must have at least one element
        var b = new Box(pts[0].clone(), pts[0].clone());
        pts.forEach(function(p) { b.unionPt(p); });
        return b;
    };

    var normalize = function(data_set) {
        var ppmm = data_set.ppmm;
        var mkpt = function(p) { return new Point(p[0], p[1]); };

        // remove dups
        data_set.strokes = data_set.strokes.map(function(stroke) {
            stroke = stroke.map(mkpt);
            var nstrokes = [stroke[0]], i;
            for (i=1; i<stroke.length; i++) {
                if (stroke[i].equals(stroke[i-1])) {
                    continue;
                }
                nstrokes.push(stroke[i]);
            }
            return nstrokes;
        });
        // remove length-1 strokes (too short)
        data_set.strokes = data_set.strokes.filter(function(stroke) {
            return stroke.length > 1;
        });
        if (data_set.strokes.length === 0) {
            return; // hmm.  bad data.
        }

        // find bounding box
        var strokeBBs = data_set.strokes.map(function(stroke) {
            return Box.fromPts(stroke);
        });
        var bbox = strokeBBs[0];
        strokeBBs.forEach(function(bb) { bbox.union(bb); });

        // use correct aspect ratio (including correcting for ppmm differences)
        var size = bbox.size();
        size = Math.max(size.width/ppmm.x, size.height/ppmm.y);/* in mm */
        var norm = function(pt) {
            // map to [0-1], y=0 at bottom (math style)
            var x = (pt.x - bbox.tl.x) / (ppmm.x * size);
            var y = (pt.y - bbox.tl.y) / (ppmm.y * size);
            return new Point(x, y);
        };
        data_set.strokes = data_set.strokes.map(function(stroke) {
            return stroke.map(norm);
        });
    };

    var smooth = function(data_set) {
        data_set.strokes = data_set.strokes.map(function(stroke) {
            var nstroke = [], i, j;
            for (i=0; i<stroke.length; i++) {
                var acc = new Point(stroke[i].x * SMOOTH_ALPHA,
                                    stroke[i].y * SMOOTH_ALPHA );
                var n = SMOOTH_N;
                // [0, 1, 2, 3, 4 ] .. N = 2, length=5
                while (n>0 && (i<n || i>=(stroke.length-n))) {
                    n--;
                }
                for (j=1; j<=n; j++) {
                    acc.x += stroke[i-j].x + stroke[i+j].x;
                    acc.y += stroke[i-j].y + stroke[i+j].y;
                }
                acc.x /= (2*n + SMOOTH_ALPHA);
                acc.y /= (2*n + SMOOTH_ALPHA);
                nstroke.push(acc);
            }
            return nstroke;
        });
    };

    var singleStroke = function(data_set) {
        var nstroke = [];
        data_set.strokes.forEach(function(stroke) {
            // add "pen up" stroke.
            var first = stroke[0], j;
            nstroke.push(new Point(first.x, first.y, true/*up!*/));
            for (j = 1; j < stroke.length; j++) {
                nstroke.push(stroke[j]);
            }
        });
        data_set.strokes = [ nstroke ];
    };

    var equidist = function(data_set, dist) {
        console.assert(data_set.strokes.length===1);
        if (!dist) { dist = RESAMPLE_INTERVAL; }
        var stroke = data_set.strokes[0];
        if (stroke.length === 0) { return; /* bad data */ }
        var nstroke = [];
        var last = stroke[0];
        var d2next = 0;
        var wasPenUp=true;
        var first = true;
        stroke.forEach(function(pt) {
            var d = Point.dist(last, pt);

            while (d2next <= d) {
                var amt = (first)?0:(d2next/d);
                var npt = Point.interp(last, pt, amt);

                var segmentIsUp = pt.isUp;
                if (wasPenUp) { npt.isUp = true; }
                wasPenUp = first ? false : segmentIsUp;

                nstroke.push(npt);
                d2next += dist;
                first = false;
            }
            d2next -= d;
            last = pt;
        });
        if (nstroke[nstroke.length-1].isUp) {
            console.assert(!last.isUp, arguments[2]);
            nstroke.push(last);
        }
        /*
        // extrapolate last point an appropriate distance away
        if (d2next/dist > 0.5 && stroke.length > 1) {
        nstroke.push(last);
        var last2 = stroke[stroke.length-2];
        var namt = d2next / Point.dist(last2, last);
        if (namt < 5) {
        nstroke.push(Point.interp(last2, last, namt));
        }
        }
        */
        data_set.strokes = [ nstroke ];
    };

    var features = function(data_set) {
        var i;
        var points = data_set.strokes[0];
        var features = points.map(function() { return []; });
        for (i=0; i<points.length; i++) {
            var m2 = points[(i<2) ? 0 : (i-2)];
            var m1 = points[(i<1) ? 0 : (i-1)];
            var pt = points[i];
            var p1 = points[((i+1)<points.length) ? (i+1) : (points.length-1)];
            var p2 = points[((i+2)<points.length) ? (i+2) : (points.length-1)];

            var dx1 = p1.x - m1.x, dy1 = p1.y - m1.y;
            var ds1 = Math.sqrt(dx1*dx1 + dy1*dy1);

            var dx2 = p2.x - m2.x, dy2 = p2.y - m2.y;
            var ds2 = Math.sqrt(dx2*dx2 + dy2*dy2);

            var bb = Box.fromPts([ m2, m1, pt, p1, p2 ]).size();
            var L = m2.dist(m1) + m1.dist(pt) + pt.dist(p1) + p1.dist(p2);

            // http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
            var dist2line = function(pp) {
                // x0 = pp.x ; x1 = m2.x ; x2 = p2.x
                // y0 = pp.y ; y1 = m2.y ; y2 = p2.y
                // |(x2-x1)(y1-y0) - (x1-x0)(y2-y1)| / ds2
                // |  dx2 * (m2.y - pp.y) - (m2.x - pp.x)*dy2 | / ds2
                return Math.abs(dx2*(m2.y-pp.y) - dy2*(m2.x-pp.x)) / ds2;
            };
            var d0 = dist2line(m1), d1 = dist2line(pt), d2 = dist2line(p1);
            var dN = 3;
            if (m1.equals(m2)) { dN--; }
            if (p1.equals(p2)) { dN--; }

            features[i] = [
                // curvature (fill in in next pass)
                0,
                0,
                // writing direction
                dx1/ds1,
                dy1/ds1,
                // vertical position.
                pt.y,
                // aspect
                (bb.height - bb.width) / (bb.height + bb.width),
                // curliness
                (L / Math.max(bb.height, bb.width)) - 2,
                // linearity
                (d0*d0 + d1*d1 + d2*d2) / dN,
                // slope
                dx2/ds2,
                // pen up!
                pt.isUp ? 1 : -1
            ];
        }
        // fill in curvature features
        for (i=0; i<features.length; i++) {
            var M1 = features[(i<1) ? 0 : (i-1)];
            var ft = features[i];
            var P1 = features[((i+1)<features.length)? (i+1) : (features.length-1)];

            var cosm1 = M1[2], sinm1 = M1[3];
            var cosp1 = P1[2], sinp1 = P1[3];
            ft[0] = (cosm1*cosp1) + (sinm1*sinp1);
            ft[1] = (cosm1*sinp1) - (sinm1*cosp1);
        }
        // rescale to normalize to (approximately) [-1,1]
        for (i=0; i<features.length; i++) {
            features[i][4] = (2 * features[i][4]) - 1;
            features[i][6] = (((features[i][6] + 1) / 3.2) * 2) - 1;
            features[i][7] = (features[i][7] * 50) - 1;
        }
        // save features
        data_set.features = features;
    };

    var _zerofunc = function() { return 0; };
    var _compute_deltas = function(features, window) {
        var len_m1 = features.length - 1;
        var theta, t, tpt, tmt, i;
        var numerator, denominator;
        var dt = [];
        // from definition in section 5.9 of HTK book
        for (t=0; t <= len_m1; t++) {
            numerator = features[t].map(_zerofunc);
            denominator = 0;
            for (theta=1; theta <= window; theta++) {
                tpt = Math.min(t + theta, len_m1);
                tmt = Math.max(t - theta, 0);
                for (i = 0; i < features[t].length; i++) {
                    numerator[i] += theta*(features[tpt][i] - features[tmt][i]);
                }
                denominator += theta*theta;
            }
            denominator *= 2;

            dt[t] = [];
            for (i = 0; i < features[t].length; i++) {
                dt[t][i] = numerator[i] / denominator;
            }
        }
        return dt;
    };
    var delta_and_accel = function(data_set) {
        data_set.deltas = _compute_deltas(data_set.features, DELTAWINDOW);
        data_set.accels = _compute_deltas(data_set.deltas, ACCWINDOW);
    };
    var merge_delta_and_accel = function(data_set) {
        data_set.features = data_set.features.map(function(f, i) {
            return f.concat(data_set.deltas[i], data_set.accels[i]);
        });
        delete data_set.deltas;
        delete data_set.accels;
    };

    var make_linear_decode_func = function(codebook) {
        console.assert(codebook.Type === 'linear');
        console.assert(codebook.CovKind === 'euclidean');
        var table_for_stream = function(stream, featlen) {
            var table = [];
            codebook.Nodes.forEach(function(node) {
                var base = featlen * (node.VQ-1);
                node.Mean.forEach(function(v, j) {
                    table[base+j] = v;
                });
            });
            var _table = new Float64Array(table.length);
            table.forEach(function(v, i) { _table[i] = v; });
            return _table;
        };
        var eucl_dist2 = function(table, j, input) {
            var base = input.length * j;
            var acc = 0, d, i;
            for (i=0; i<input.length; i++) {
                d = (input[i] - table[base+i]);
                acc += d*d;
            }
            return acc;
        };
        var decode_one = function(table, input) {
            var best = 0, bestd = eucl_dist2(table, 0, input), i;
            for (i=1; i*input.length < table.length; i++) {
                var d = eucl_dist2(table, i, input);
                if (d < bestd) {
                    bestd = d;
                    best = i;
                }
            }
            return best;
        };
        var tables = codebook.Streams.map(function(width, i) {
            return table_for_stream(i+1, width);
        });
        var decodefunc = function(input, i) {
            return decode_one(tables[i], input);
        };
        var decode = function() {
            return Array.prototype.map.call(arguments, decodefunc);
        };
        return decode;
    };
    var make_tree_decode_func = function(codebook) {
        console.assert(codebook.Type === 'tree');
        console.assert(codebook.CovKind === 'euclidean');

        var tree_for_stream = function(stream, featlen) {
            var table = {};
            var tree = [], codepoint = [];
            codebook.Nodes.forEach(function(node) {
                if (node.Stream === stream) {
                    table[node.Id] = node;
                }
            });
            var recurse = function(node, i) {
                // codepoint value = one greater than VQ index; 0=nonterminal
                codepoint[i] = node.VQ;
                var base = i*featlen;
                node.Mean.forEach(function(v, j) {
                    tree[base+j] = v;
                });
                // do left and right nodes
                if (node.LeftId) {
                    recurse(table[node.LeftId], 1 + 2*i);
                }
                if (node.RightId) {
                    recurse(table[node.RightId], 2 + 2*i);
                }
            };
            // first node.Id is 1; heap is 0-based.
            recurse(table[1], 0);
            // now make nice native arrays
            var _tree = new Float64Array(tree.length);
            tree.forEach(function(v, i) { _tree[i] = v; });
            var _codepoint = new Uint16Array(codepoint.length);
            codepoint.forEach(function(v, i) { _codepoint[i] = v; });
            // done
            return [_codepoint, _tree];
        };

        var eucl_dist2 = function(tree, j, input) {
            var base = input.length * j;
            var acc = 0, d, i;
            for (i=0; i<input.length; i++) {
                d = (input[i] - tree[base+i]);
                acc += d*d;
            }
            return acc;
        };
        var decode_one = function(codepoint, tree, input) {
            var i = 0;
            while (true) {
                // if this node is terminal, this is the vq index
                if (codepoint[i] !== 0) { return codepoint[i] - 1; }
                // otherwise, is it closer to the left or right vector?
                var leftd = eucl_dist2(tree, 1 + 2*i, input);
                var rightd= eucl_dist2(tree, 2 + 2*i, input);
                i = 1 + 2*i; // left branch
                if (leftd > rightd) {
                    i++; // right branch
                }
            }
        };

        var tables = codebook.Streams.map(function(width, i) {
            return tree_for_stream(i+1, width);
        });
        var decodefunc = function(input, i) {
            return decode_one(tables[i][0], tables[i][1], input);
        };
        var decode = function() {
            return Array.prototype.map.call(arguments, decodefunc);
        };
        return decode;
    };

    var make_vq = function(codebook) {
        var decode;
        if (codebook.Type === 'tree') {
            decode = make_tree_decode_func(codebook);
        } else if (codebook.Type === 'linear') {
            decode = make_linear_decode_func(codebook);
        } else {
            console.assert(false, codebook.Type);
        }
        return function(data_set) {
            data_set.vq = [];
            var i;
            for (i=0; i<data_set.features.length; i++) {
                data_set.vq[i] = decode(data_set.features[i],
                                        data_set.deltas[i],
                                        data_set.accels[i]);
            }
        };
    };

    // exports
    return {
        // parameters
        SMOOTH_N: SMOOTH_N,
        SMOOTH_ALPHA: SMOOTH_ALPHA,
        RESAMPLE_INTERVAL: RESAMPLE_INTERVAL,
        // useful classes
        Box: Box,
        Point: Point,
        // stroke processing functions
        normalize: normalize,
        smooth: smooth,
        singleStroke: singleStroke,
        equidist: equidist,
        features: features,
        delta_and_accel: delta_and_accel,
        merge_delta_and_accel: merge_delta_and_accel,
        make_vq: make_vq
    };
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, setTimeout:false, clearTimeout:false,
         Worker:false */
define('src/recog',['./compat', './drawcommand', './hand/features',], function(Compat, DrawCommand, Features, HMM, hmmdef) {
    

    var extractDataSet = function(commands, start, end) {
        var i, cmd;
        var strokes = [];
        var currentStroke = [];
        var bbox = null, pt;
        for (i=start; i<end; i++) {
            cmd = commands[i];
            switch (cmd.type) {
            case DrawCommand.Type.DRAW:
                // canvas x/y is upside-down wrt training data y
                currentStroke.push([cmd.pos.x, -cmd.pos.y]);
                if (bbox) {
                    bbox.unionPt(cmd.pos);
                } else {
                    pt = new Features.Point(cmd.pos.x, cmd.pos.y);
                    bbox = new Features.Box(pt.clone(), pt.clone());
                }
                break;
            case DrawCommand.Type.DRAW_END:
                if (currentStroke.length > 0) {
                    strokes.push(currentStroke);
                    currentStroke = [];
                }
                break;
            default:
                /* ignore this draw command */
                break;
            }
        }
        if (strokes.length===0) { return null; /* no character here. */ }
        var data_set = { strokes: strokes, ppmm: {x:1, y:1}, bbox: bbox };
        Features.normalize(data_set);
        Features.smooth(data_set);
        Features.singleStroke(data_set);
        Features.equidist(data_set);
        if (data_set.strokes[0].length===0) { return null;/*no character data*/}
        Features.features(data_set);
        if (data_set.features.length===0) { return null; /* no features */ }
        Features.delta_and_accel(data_set);
        return data_set;
    };
    // callback infra
    var recogCallback = null;
    var registerCallback = function(callback) {
        console.assert(recogCallback === null);
        recogCallback = callback;
    };
    // Make a web worker
    var worker = new Compat.Worker('src/worker.js'); // XXX make location relative.
    var nextRecogAttempt = null, recogPending = true;
    var maybeMakeRecogAttempt = function() {
        if (recogPending || nextRecogAttempt===null) { return; }
        var message = { type: 'recog', data_set: nextRecogAttempt };
        worker.postMessage(JSON.stringify(message));
        nextRecogAttempt = null;
        recogPending = true;
    };
    worker.addEventListener('message', function(evt) {
        var data = JSON.parse(evt.data);
        switch (data.type) {
        case 'debug':
            console.log.apply(console, data.args);
            break;
        case 'ready': // worker is ready
            recogPending = false;
            maybeMakeRecogAttempt();
            break;
        case 'recog': // recognition results
            /*
            console.log("Got result: "+data.model,
                        "prob", data.prob, "bbox", data.bbox);
            */
            recogPending = false;
            maybeMakeRecogAttempt();
            if (recogCallback) {
                recogCallback(data.model, data.prob, data.bbox);
            }
            break;
        default:
            console.error("Unexpected message from worker", evt);
            break;
        }
    });
    // start web worker.
    worker.postMessage(JSON.stringify({type:'start'}));

    var attemptRecognition = function(commands, start, end) {
        if (typeof(start)!=='number') { start=0; }
        if (typeof(end)  !=='number') { end = commands.length; }
        var data_set = extractDataSet(commands, start, end);
        if (!data_set) { return; /* no character here to look at */ }
        // do recog in a web worker?
        nextRecogAttempt = data_set;
        maybeMakeRecogAttempt();
        return;
    };
    return {
        attemptRecognition: attemptRecognition,
        registerCallback: registerCallback
    };
});

/*jshint white: false, onevar: false, strict: false, plusplus: false,
  nomen: false */
/*global define: false, window: false, document: false */

// Cross-platform sound pool.  Heavily hacked from the MIT licensed code in
// https://github.com/gladiusjs/gladius-core/blob/develop/src/sound/default.js
define('src/sound',[], function() {

    // Default number of audio instances to clone
    var DEFAULT_INSTANCES = 4;

    var AUDIO_TYPES = {
        'mp3': 'audio/mpeg',
        'ogg': 'audio/ogg',
        'wav': 'audio/wav',
        'aac': 'audio/aac',
        'm4a': 'audio/x-m4a'
    };

    // Cross-browser Audio() constructor
    var Audio = (function() {
        return ('Audio' in window) ?
            window.Audio :
            function() {
                return document.createElement('audio');
            };
    }());

    function nop(){}

    var AudioPool = function( url, formats, instances, callback, errback ) {
        var audio = new Audio(),
        cloningDone = false, // work around https://bugzilla.mozilla.org/show_bug.cgi?id=675986
        clones = [];

        // XXXhumph do we want to have this be configurable for late load?
        audio.autobuffer = true;
        audio.preload = 'auto';

        // XXXhumph do we want to keep some kind of state to know if things worked?
        audio.addEventListener('error', function() {
            errback(audio.error);
        }, false);
        audio.addEventListener('canplaythrough', function() {
            if (cloningDone) {
                return;
            }
            while ( instances-- ) {
                clones.push( audio.cloneNode( true ) );
            }
            cloningDone = true;
            callback();
        }, false);

        var getExt = function(filename) {
            return filename.split('.').pop();
        };

        var addSource = function(src) {
            var source = document.createElement('source');
            source.src = src;
            if (AUDIO_TYPES[ getExt(src) ]) {
                source.type = AUDIO_TYPES[ getExt(src) ];
            }
            audio.appendChild(source);
        };

        if (formats && formats.length > 0) {
            formats.forEach(function(f) {
                addSource(url + '.' + f);
            });
        } else {
            addSource(url);
        }

        this.getInstance = function() {
            var clone,
            count,
            i;

            for ( i = 0, count = clones.length; i < count; i++) {
                clone = clones[i];

                if ( clone.paused || clone.ended ) {
                    if ( clone.ended ) {
                        clone.currentTime = 0;
                    }
                    return clone;
                }
            }

            // Rewind first one if none are available
            if (clones.length===0) {
                return null;
            }
            clone = clones[0];
            clone.pause();
            clone.currentTime = 0;

            return clone;
        };
        // hackity hackity; this is a leak in our API
        var loopFunc = function() {
            audio.currentTime = 0;
            audio.play();
        };
        this.loop = function() {
            audio.loop = true;
            audio.addEventListener('ended', loopFunc, false);
            audio.play();
        };
        this.unloop = function() {
            if (!audio.loop) { return; /* only unloop once */ }
            audio.pause();
            audio.removeAttribute('loop');
            audio.removeEventListener('ended', loopFunc, false);
            audio.currentTime = 0;
        };
    };
    if (window.cordovaDetect) {
        // use PhoneGap Media class.
        AudioPool = function( url, formats, instances, callback, errback ) {
            var clones = [], ready = [];
            url = '/android_asset/www/'+url;
            if (formats && formats.length > 0) {
                url += '.' + formats[0];
            }
            this.getInstance = function() {
                var clone, count, i;

                for ( i = 0, count = clones.length; i < count; i++) {
                    clone = clones[i];
                    if (ready[i]) {
                        clone.seekTo(0);
                        ready[i] = false;
                        return clone;
                    }
                }
                if (count < instances) {
                    // make a new clone
                    clones[count] = clone = new Media(url, function() {
                        ready[count] = true;
                    });
                    ready[count] = false;
                    return clone;
                }
                // Rewind first one if none are available
                if (clones.length===0) {
                    return null;
                }
                clone = clones[0];
                clone.seekTo(0);

                return clone;
            };
            var loop = null;
            this.loop = function() {
                var nloop; // local scoped var
                if (loop) { this.unloop(); } // abnormal
                var completeFunc = function() {
                    if (loop===null || loop.id !== nloop.id) {
                        return; /* stop */
                    }
                    nloop.seekTo(0);
                    nloop.play();
                };
                loop = nloop = new Media(url, completeFunc);
                loop.play();
            };
            this.unloop = function() {
                var oloop = loop;
                loop = null;
                if (oloop) {
                    oloop.stop();
                    oloop.release();
                }
            };
            callback();
        };
    }


    function load( Type, options ) {
        var snd = new Type({
            url: options.url,
            instances: options.instances,
            callback: options.callback,
            errback: options.errback
        });
    }

    function Effect( options ) {
        var url = options.url;
        if ( !url ) {
            throw "you must pass a URL to Effect.";
        }

        var pool = new AudioPool(
            url,
            options.formats || [],
            options.instances || DEFAULT_INSTANCES,
            options.callback ?
                (function( track, callback ) {
                    return function() {
                        callback( track );
                    };
                }( this, options.callback )) : nop,
            options.errback || nop
        );

        this.__defineGetter__( 'audio', function() {
            return pool.getInstance();
        });

        this.__defineGetter__( 'url', function() {
            return url;
        });
        this.play = function() {
            var audio = this.audio;
            // handle case where sound is not yet loaded.
            if (!audio) { return null; }
            audio.play();
            return audio;
        };
        this.loop = function() { pool.loop(); };
        this.unloop = function() { pool.unloop(); };
    }
    Effect.load = function( options ) {
        load( Effect, options );
    };

    /**
     * A special-case Effect with only one audio instance (no clones).
     */
    function Track( options ) {
        // Force a single audio
        options.instances = 1;
        Effect.call( this, options );
    }
    Track.load = function( options ) {
        load( Track, options );
    };

    return {
        Effect: Effect,
        Track: Track
    };
});

// LZW encode/decode
define('src/lzw',[], function() {
    // characters < 128 is 7-bit ascii, fine for JSON -- unicode escape
    // any characters larger than that with \uXXXX escapes.
    // can set MAX_ALPHA_CODE to other values (eg 256) for different char sets
    var MAX_ALPHA_CODE = 128;

    // maximum index allowed in the output.
    // Javascript strings are UCS-2 which forces this limitation.
    // with some effort one might fix fromCharCode/toCharCode to raise the limit
    var MAX_OUTPUT_CODE = 0x10000; // ie, emit 0xFFFF only.

    // should we clear the dictionary when it is full (and start over?)
    var CLEAR_FULL_DICT = true;

    // utf8 encoding, thanks to Johan Sundström:
    // http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html
    function encode_utf8(s) {
        return unescape(encodeURIComponent(s));
    }
    function decode_utf8(s) {
        return decodeURIComponent(escape(s));
    }

    // Compress a string using LZW encoding
    function lzw_encode(s, optToUTF8) {
        var dict = {};
        var data = (s + "");
        var out = [];
        var currChar;
        var phrase = data.charAt(0);
        //console.assert(phrase.charCodeAt(0) < MAX_ALPHA_CODE);
        var code = MAX_ALPHA_CODE+1, i;
        for (i=1; i<data.length; i++) {
            currChar=data.charAt(i);
            //console.assert(currChar.charCodeAt(0) < MAX_ALPHA_CODE);
            if (dict.hasOwnProperty(phrase + currChar)) {
                phrase += currChar;
            } else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase);
                if (code < MAX_OUTPUT_CODE) {
                    // only grow the dictionary if we haven't reached max size
                    dict[phrase + currChar] = String.fromCharCode(code);
                    code++;
                    if (code===0xD800) { code=0xE000; }//UTF-16 hack
                }
                if (code===MAX_OUTPUT_CODE && CLEAR_FULL_DICT) {
                    out.push(String.fromCharCode(MAX_ALPHA_CODE /* "clear" */));
                    dict = {};
                    code = MAX_ALPHA_CODE+1;
                }
                phrase=currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase);

        // convert array of numbers to string
        var result = out.join('');
        if (optToUTF8) { result = encode_utf8(result); }
        return result;
    }

    // Decompress an LZW-encoded string
    function lzw_decode(s, optFromUTF8) {
        var data = s + "";
        if (optFromUTF8) { data = decode_utf8(data); }
        var dict = {};
        var currChar = data.charAt(0);
        var oldPhrase = currChar;
        var out = [currChar];
        var code = MAX_ALPHA_CODE+1;
        var phrase, i;
        for (i=1; i<data.length; i++) {
            var currCode = data.charCodeAt(i);
            if (currCode < MAX_ALPHA_CODE) {
                phrase = data.charAt(i);
            } else if (currCode === MAX_ALPHA_CODE /* "clear" */) {
                dict = {};
                code = MAX_ALPHA_CODE+1;
                currChar = oldPhrase = data.charAt(++i);
                out.push(currChar);
                continue;
            } else {
                // note the special 'one greater than dict length' case.
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            if (code < MAX_OUTPUT_CODE) {
                dict[code] = oldPhrase + currChar;
                code++;
                if (code===0xD800) { code=0xE000; }//UTF-16 hack
            }
            oldPhrase = phrase;
        }
        return out.join("");
    }

    return {
        encode: lzw_encode,
        decode: lzw_decode
    };
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/sync',['./drawing', './lzw', './lawnchair/lawnchair'], function(Drawing, LZW, Lawnchair) {
    var DEBUG = false;
    var TOP = 'top';

    // Sync drawing to local storage.
    var Sync = {};

    var getDefault = function(lawnchair, key, defaultValue, callback) {
        lawnchair.exists(key, function(exists) {
            if (exists) {
                lawnchair.get(key, callback);
            } else {
                callback(defaultValue);
            }
        });
    };

    var addToIndex = function(drawing, callback) {
        Lawnchair({name:'drawing_index'}, function() {
            var lawnchair = this;
            lawnchair.save({
                key: drawing.uuid,
                ctime: drawing.ctime,
                mtime: Date.now()
            }, function() {
                callback.call(drawing);
            });
        });
    };
    var removeFromIndex = function(uuid, callback) {
        Lawnchair({name:'drawing_index'}, function() {
            var lawnchair = this;
            lawnchair.remove(uuid, callback);
        });
    };

    Sync.list = function(callback) {
        Lawnchair({name:'drawing_index'}, function() {
            var lawnchair = this;
            lawnchair.all(function(results) {
                results.sort(function(a, b) {
                    // oldest first
                    return a.ctime - b.ctime;
                });
                // return list of uuids (don't expose 'key' field)
                callback(results.map(function(r) { return r.key; }));
            });
        });
    };

    Sync['delete'] = function(uuid, callback) {
        removeFromIndex(uuid, function() {
            Lawnchair({name:'drawing.'+uuid}, function() {
                this.nuke(callback, true);
            });
        });
    };

    Sync.load = function(uuid, callback) {
        var withLawnchair = function(lawnchair) {
            lawnchair.get(TOP, function(top) {
                var i, done = 0, chunks = [];
                var doChunk = function(i) {
                    lawnchair.get(''+i, function(achunk) {
                        chunks[i] = JSON.parse(LZW.decode(achunk.data));
                        done++;
                        if (done===top.data.nChunks) {
                            Drawing.fromChunks(top.data, chunks, callback);
                        }
                    });
                };
                for (i=0; i<top.data.nChunks; i++) {
                    doChunk(i);
                }
            });
        };
        Lawnchair({name:'drawing.'+uuid}, function() { withLawnchair(this); });
    };

    Sync.exists = function(uuid, callback) {
        var withLawnchair = function(lawnchair) {
            lawnchair.exists(TOP, callback);
        };
        Lawnchair({name:'drawing.'+uuid}, function() { withLawnchair(this); });
    };

    Sync.save = function(drawing, callback, optForce) {
        console.assert(drawing.uuid);
        var saveWithLawnchair = function(lawnchair) {
            var dj = drawing.toJSON('use chunks');
            var wrapUp = function() {
                if (DEBUG) { console.log('writing', drawing.uuid); }
                lawnchair.save({ key: TOP, data: dj }, function() {
                    addToIndex(drawing, callback);
                });
            };
            var chunk = dj.nChunks;
            var saveChunk = function() {
                chunk--;
                if (chunk < 0) {
                    wrapUp();
                } else {
                    getDefault(lawnchair, ''+chunk, null, function(c) {
                        if (c && c.uuid === drawing.chunks[chunk].uuid) {
                            // all the rest of the chunks are up to date
                            wrapUp();
                        } else {
                            if (DEBUG) { console.log('writing', chunk); }
                            lawnchair.save({
                                key: ''+chunk,
                                uuid: drawing.chunks[chunk].uuid,
                                data: LZW.encode(JSON.stringify(drawing.chunks[chunk]))
                            }, saveChunk);
                        }
                    });
                }
            };
            saveChunk();
        };
        Lawnchair({name:'drawing.'+drawing.uuid}, function() {
            var s = function() { saveWithLawnchair(this); }.bind(this);
            if (optForce) {
                this.nuke(s);
            } else {
                s();
            }
        });
    };

    return Sync;
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/gallery',['domReady!','./compat','./sync'], function(document, Compat, Sync) {
    var Gallery = function() {
        this.domElement = document.createElement('div');
        this.domElement.classList.add('gallery');
        // start populating with thumbnails
        Sync.list(this._populate.bind(this));
    };
    Gallery.prototype = {};
    Gallery.prototype._populate = function(uuids) {
        var addUUID = function(uuid) {
            var a = document.createElement('a');
            a.href='#'; // for iOS
            a.textContent = uuid; // XXX should be a thumbnail
            a.addEventListener('click', function(event) {
                event.preventDefault();
                this._callback(uuid);
            }.bind(this));
            this.domElement.appendChild(a);
        }.bind(this);
        uuids.forEach(addUUID);
        // make "new document" element
        addUUID('new');
    };
    Gallery.prototype.wait = function(callback) {
        // register callback
        this._callback = callback;
    };
    Gallery.abort = function() {
        var galleries = document.querySelectorAll('div.gallery'), i;
        for (i=0; i<galleries.length; i++) {
            galleries[i].parentElement.removeChild(galleries[i]);
        }
    };
    return Gallery;
});

/* BlobBuilder.js
 * A BlobBuilder implementation.
 * 2012-04-21
 * 
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global self, unescape */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/BlobBuilder.js/blob/master/BlobBuilder.js */
define('lib/BlobBuilder',[], function() {
var BlobBuilder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder || (function(view) {

var
	  get_class = function(object) {
		return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
	}
	, FakeBlobBuilder = function(){
		this.data = [];
	}
	, FakeBlob = function(data, type, encoding) {
		this.data = data;
		this.size = data.length;
		this.type = type;
		this.encoding = encoding;
	}
	, FBB_proto = FakeBlobBuilder.prototype
	, FB_proto = FakeBlob.prototype
	, FileReaderSync = view.FileReaderSync
	, FileException = function(type) {
		this.code = this[this.name = type];
	}
	, file_ex_codes = (
		  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
		+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
	).split(" ")
	, file_ex_code = file_ex_codes.length
	, realURL = view.URL || view.webkitURL || view
	, real_create_object_URL = realURL.createObjectURL
	, real_revoke_object_URL = realURL.revokeObjectURL
	, URL = realURL
	, btoa = view.btoa
	, atob = view.atob
	, can_apply_typed_arrays = false
	, can_apply_typed_arrays_test = function(pass) {
		can_apply_typed_arrays = !pass;
	}
	
	, ArrayBuffer = view.ArrayBuffer
	, Uint8Array = view.Uint8Array
;
FakeBlobBuilder.fake = FB_proto.fake = true;
while (file_ex_code--) {
	FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
}
try {
	if (Uint8Array) {
		can_apply_typed_arrays_test.apply(0, new Uint8Array(1));
	}
} catch (ex) {}
if (!realURL.createObjectURL) {
	URL = view.URL = {};
}
URL.createObjectURL = function(blob) {
	var
		  type = blob.type
		, data_URI_header
	;
	if (type === null) {
		type = "application/octet-stream";
	}
	if (blob instanceof FakeBlob) {
		data_URI_header = "data:" + type;
		if (blob.encoding === "base64") {
			return data_URI_header + ";base64," + blob.data;
		} else if (blob.encoding === "URI") {
			return data_URI_header + "," + decodeURIComponent(blob.data);
		} if (btoa) {
			return data_URI_header + ";base64," + btoa(blob.data);
		} else {
			return data_URI_header + "," + encodeURIComponent(blob.data);
		}
	} else if (real_create_object_url) {
		return real_create_object_url.call(realURL, blob);
	}
};
URL.revokeObjectURL = function(object_url) {
	if (object_url.substring(0, 5) !== "data:" && real_revoke_object_url) {
		real_revoke_object_url.call(realURL, object_url);
	}
};
FBB_proto.append = function(data/*, endings*/) {
	var bb = this.data;
	// decode data to a binary string
	if (Uint8Array && data instanceof ArrayBuffer) {
		if (can_apply_typed_arrays) {
			bb.push(String.fromCharCode.apply(String, new Uint8Array(data)));
		} else {
			var
				  str = ""
				, buf = new Uint8Array(data)
				, i = 0
				, buf_len = buf.length
			;
			for (; i < buf_len; i++) {
				str += String.fromCharCode(buf[i]);
			}
		}
	} else if (get_class(data) === "Blob" || get_class(data) === "File") {
		if (FileReaderSync) {
			var fr = new FileReaderSync;
			bb.push(fr.readAsBinaryString(data));
		} else {
			// async FileReader won't work as BlobBuilder is sync
			throw new FileException("NOT_READABLE_ERR");
		}
	} else if (data instanceof FakeBlob) {
		if (data.encoding === "base64" && atob) {
			bb.push(atob(data.data));
		} else if (data.encoding === "URI") {
			bb.push(decodeURIComponent(data.data));
		} else if (data.encoding === "raw") {
			bb.push(data.data);
		}
	} else {
		if (typeof data !== "string") {
			data += ""; // convert unsupported types to strings
		}
		// decode UTF-16 to binary string
		bb.push(unescape(encodeURIComponent(data)));
	}
};
FBB_proto.getBlob = function(type) {
	if (!arguments.length) {
		type = null;
	}
	return new FakeBlob(this.data.join(""), type, "raw");
};
FBB_proto.toString = function() {
	return "[object BlobBuilder]";
};
FB_proto.slice = function(start, end, type) {
	var args = arguments.length;
	if (args < 3) {
		type = null;
	}
	return new FakeBlob(
		  this.data.slice(start, args > 1 ? end : this.data.length)
		, type
		, this.encoding
	);
};
FB_proto.toString = function() {
	return "[object Blob]";
};
return FakeBlobBuilder;
}(self));
    return BlobBuilder;
});

/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2011-08-02
 * 
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global self */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
define('lib/FileSaver',[], function() {
	
        var view = window;
	var
		  doc = view.document
		  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, URL = view.URL || view.webkitURL || view
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			return node.dispatchEvent(event); // false if event was cancelled
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function (ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		, deletion_queue = []
		, process_deletion_queue = function() {
			var i = deletion_queue.length;
			while (i--) {
				var file = deletion_queue[i];
				if (typeof file === "string") { // file is an object URL
					URL.revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			}
			deletion_queue.length = 0; // clear queue
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, get_object_url = function() {
					var object_url = get_URL().createObjectURL(blob);
					deletion_queue.push(object_url);
					return object_url;
				}
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_object_url(blob);
					}
					target_view.location.href = object_url;
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_object_url(blob);
				save_link.href = object_url;
				save_link.download = name;
				if (click(save_link)) {
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					return;
				}
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			} else {
				target_view = view.open();
                            if (!target_view) { target_view = view.parent; }
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									deletion_queue.push(file);
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;
	
	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;
	
	view.addEventListener("unload", process_deletion_queue, false);
	return saveAs;
});

/**
 * Basic parser for URL properties
 * @author Miller Medeiros
 * @version 0.1.0 (2011/12/06)
 * MIT license
 */
define('propertyParser',[],function(){

    var rProps = /([\w-]+)\s*:\s*(?:(\[[^\]]+\])|([^,]+)),?/g, //match "foo:bar" and "lorem:[ipsum,dolor]" capturing name as $1 and val as $2 or $3
        rArr = /^\[([^\]]+)\]$/; //match "[foo,bar]" capturing "foo,bar"

    function parseProperties(str){
        var match, obj = {};
        while (match = rProps.exec(str)) {
            obj[ match[1] ] = typecastVal(match[2] || match[3]);
        }
        return obj;
    }

    function typecastVal(val){
        if (rArr.test(val)){
            val = val.replace(rArr, '$1').split(',');
        } else if (val === 'null'){
            val = null;
        } else if (val === 'false'){
            val = false;
        } else if (val === 'true'){
            val = true;
        } else if (val === '' || val === "''" || val === '""'){
            val = '';
        } else if (! isNaN(val)) {
            //isNaN('') == false
            val = +val;
        }
        return val;
    }

    //API
    return {
        parseProperties : parseProperties,
        typecastVal : typecastVal
    };
});

/*
 * Copyright 2012 Small Batch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
define('webfont',[],function() { return (function(window,document,navigator,undefined) {
    if (!document) return; // build environment.
var h=void 0,i=!0,l=null,o=!1;function p(a){return function(){return this[a]}}var q;function s(a,c,b){var d=2<arguments.length?Array.prototype.slice.call(arguments,2):[];return function(){d.push.apply(d,arguments);return c.apply(a,d)}};function t(a){this.F=a;this.U=h}t.prototype.createElement=function(a,c,b){a=this.F.createElement(a);if(c)for(var d in c)c.hasOwnProperty(d)&&("style"==d?u(this,a,c[d]):a.setAttribute(d,c[d]));b&&a.appendChild(this.F.createTextNode(b));return a};function v(a,c,b){a=a.F.getElementsByTagName(c)[0];a||(a=document.documentElement);a&&a.lastChild&&a.insertBefore(b,a.lastChild)}function aa(a){function c(){document.body?a():setTimeout(c,0)}c()}function w(a){a.parentNode&&a.parentNode.removeChild(a)}
function x(a,c){return a.createElement("link",{rel:"stylesheet",href:c})}function y(a,c){return a.createElement("script",{src:c})}function z(a,c){for(var b=a.className.split(/\s+/),d=0,e=b.length;d<e;d++)if(b[d]==c)return;b.push(c);a.className=b.join(" ").replace(/^\s+/,"")}function A(a,c){for(var b=a.className.split(/\s+/),d=[],e=0,g=b.length;e<g;e++)b[e]!=c&&d.push(b[e]);a.className=d.join(" ").replace(/^\s+/,"").replace(/\s+$/,"")}
function ba(a,c){for(var b=a.className.split(/\s+/),d=0,e=b.length;d<e;d++)if(b[d]==c)return i;return o}function u(a,c,b){if(a.U===h){var d=a.F.createElement("p");d.innerHTML='<a style="top:1px;">w</a>';a.U=/top/.test(d.getElementsByTagName("a")[0].getAttribute("style"))}a.U?c.setAttribute("style",b):c.style.cssText=b};function B(a,c,b,d,e,g,f,k){this.za=a;this.Fa=c;this.na=b;this.ma=d;this.Ca=e;this.Ba=g;this.la=f;this.Ga=k}q=B.prototype;q.getName=p("za");q.va=p("Fa");q.X=p("na");q.sa=p("ma");q.ta=p("Ca");q.ua=p("Ba");q.ra=p("la");q.w=p("Ga");function C(a,c){this.a=a;this.k=c}var ca=new B("Unknown","Unknown","Unknown","Unknown","Unknown","Unknown",h,o);
C.prototype.parse=function(){var a;if(-1!=this.a.indexOf("MSIE"))if(a=E(this.a,/(MSIE [\d\w\.]+)/,1),""!=a){var c=a.split(" ");a=c[0];c=c[1];a=new B(a,c,a,c,F(this),G(this),H(this.k),6<=I(c))}else a=new B("MSIE","Unknown","MSIE","Unknown",F(this),G(this),H(this.k),o);else if(-1!=this.a.indexOf("Opera"))a:{var c=a="Unknown",b=E(this.a,/(Presto\/[\d\w\.]+)/,1);""!=b?(c=b.split("/"),a=c[0],c=c[1]):(-1!=this.a.indexOf("Gecko")&&(a="Gecko"),b=E(this.a,/rv:([^\)]+)/,1),""!=b&&(c=b));if(-1!=this.a.indexOf("Version/")&&
(b=E(this.a,/Version\/([\d\.]+)/,1),""!=b)){a=new B("Opera",b,a,c,F(this),G(this),H(this.k),10<=I(b));break a}b=E(this.a,/Opera[\/ ]([\d\.]+)/,1);a=""!=b?new B("Opera",b,a,c,F(this),G(this),H(this.k),10<=I(b)):new B("Opera","Unknown",a,c,F(this),G(this),H(this.k),o)}else if(-1!=this.a.indexOf("AppleWebKit")){a=F(this);c=G(this);b=E(this.a,/AppleWebKit\/([\d\.\+]+)/,1);""==b&&(b="Unknown");var d="Unknown";-1!=this.a.indexOf("Chrome")||-1!=this.a.indexOf("CrMo")?d="Chrome":-1!=this.a.indexOf("Safari")?
d="Safari":-1!=this.a.indexOf("AdobeAIR")&&(d="AdobeAIR");var e="Unknown";-1!=this.a.indexOf("Version/")?e=E(this.a,/Version\/([\d\.\w]+)/,1):"Chrome"==d?e=E(this.a,/(Chrome|CrMo)\/([\d\.]+)/,2):"AdobeAIR"==d&&(e=E(this.a,/AdobeAIR\/([\d\.]+)/,1));var g=o;"AdobeAIR"==d?(g=E(e,/\d+\.(\d+)/,1),g=2<I(e)||2==I(e)&&5<=parseInt(g,10)):(g=E(b,/\d+\.(\d+)/,1),g=526<=I(b)||525<=I(b)&&13<=parseInt(g,10));a=new B(d,e,"AppleWebKit",b,a,c,H(this.k),g)}else-1!=this.a.indexOf("Gecko")?(c=a="Unknown",d=o,-1!=this.a.indexOf("Firefox")?
(a="Firefox",b=E(this.a,/Firefox\/([\d\w\.]+)/,1),""!=b&&(d=E(b,/\d+\.(\d+)/,1),c=b,d=""!=b&&3<=I(b)&&5<=parseInt(d,10))):-1!=this.a.indexOf("Mozilla")&&(a="Mozilla"),b=E(this.a,/rv:([^\)]+)/,1),""==b?b="Unknown":d||(d=I(b),e=parseInt(E(b,/\d+\.(\d+)/,1),10),g=parseInt(E(b,/\d+\.\d+\.(\d+)/,1),10),d=1<d||1==d&&9<e||1==d&&9==e&&2<=g||b.match(/1\.9\.1b[123]/)!=l||b.match(/1\.9\.1\.[\d\.]+/)!=l),a=new B(a,c,"Gecko",b,F(this),G(this),H(this.k),d)):a=ca;return a};
function F(a){var c=E(a.a,/(iPod|iPad|iPhone|Android)/,1);if(""!=c)return c;a=E(a.a,/(Linux|Mac_PowerPC|Macintosh|Windows)/,1);return""!=a?("Mac_PowerPC"==a&&(a="Macintosh"),a):"Unknown"}function G(a){var c=E(a.a,/(OS X|Windows NT|Android) ([^;)]+)/,2);if(c||(c=E(a.a,/(iPhone )?OS ([\d_]+)/,2)))return c;return(a=E(a.a,/Linux ([i\d]+)/,1))?a:"Unknown"}function I(a){a=E(a,/(\d+)/,1);return""!=a?parseInt(a,10):-1}function E(a,c,b){return(a=a.match(c))&&a[b]?a[b]:""}
function H(a){if(a.documentMode)return a.documentMode};function ea(a,c,b){this.c=a;this.g=c;this.V=b;this.j="wf";this.h=new fa("-")}function ga(a){z(a.g,a.h.e(a.j,"loading"));J(a,"loading")}function K(a){A(a.g,a.h.e(a.j,"loading"));ba(a.g,a.h.e(a.j,"active"))||z(a.g,a.h.e(a.j,"inactive"));J(a,"inactive")}function J(a,c,b,d){if(a.V[c])a.V[c](b,d)};function ha(){this.ea={}}function ia(a,c){var b=[],d;for(d in c)if(c.hasOwnProperty(d)){var e=a.ea[d];e&&b.push(e(c[d]))}return b};function L(a,c,b,d,e){this.c=a;this.A=c;this.n=b;this.u=d;this.D=e;this.L=0;this.ia=this.da=o}L.prototype.watch=function(a,c,b,d,e){for(var g=a.length,f=0;f<g;f++){var k=a[f];c[k]||(c[k]=["n4"]);this.L+=c[k].length}e&&(this.da=e);for(f=0;f<g;f++)for(var k=a[f],e=c[k],m=b[k],j=0,n=e.length;j<n;j++){var D=e[j],r=this.A,O=k,da=D;z(r.g,r.h.e(r.j,O,da,"loading"));J(r,"fontloading",O,da);r=s(this,this.oa);O=s(this,this.pa);(new d(r,O,this.c,this.n,this.u,this.D,k,D,m)).start()}};
L.prototype.oa=function(a,c){var b=this.A;A(b.g,b.h.e(b.j,a,c,"loading"));A(b.g,b.h.e(b.j,a,c,"inactive"));z(b.g,b.h.e(b.j,a,c,"active"));J(b,"fontactive",a,c);this.ia=i;ja(this)};L.prototype.pa=function(a,c){var b=this.A;A(b.g,b.h.e(b.j,a,c,"loading"));ba(b.g,b.h.e(b.j,a,c,"active"))||z(b.g,b.h.e(b.j,a,c,"inactive"));J(b,"fontinactive",a,c);ja(this)};
function ja(a){0==--a.L&&a.da&&(a.ia?(a=a.A,A(a.g,a.h.e(a.j,"loading")),A(a.g,a.h.e(a.j,"inactive")),z(a.g,a.h.e(a.j,"active")),J(a,"active")):K(a.A))};function M(a,c,b,d,e,g,f,k,m){this.I=a;this.Z=c;this.c=b;this.n=d;this.u=e;this.D=g;this.ya=new ka;this.v=new N;this.M=f;this.B=k;this.qa=m||"BESbswy";this.P=la(this,"arial,'URW Gothic L',sans-serif");this.Q=la(this,"Georgia,'Century Schoolbook L',serif");this.ba=this.P;this.ca=this.Q;this.R=P(this,"arial,'URW Gothic L',sans-serif");this.S=P(this,"Georgia,'Century Schoolbook L',serif")}M.prototype.start=function(){this.ha=this.D();this.K()};
M.prototype.K=function(){var a=this.n.p(this.R),c=this.n.p(this.S);(this.P!=a||this.Q!=c)&&this.ba==a&&this.ca==c?Q(this,this.I):5E3<=this.D()-this.ha?Q(this,this.Z):(this.ba=a,this.ca=c,ma(this))};function ma(a){a.u(function(a,b){return function(){b.call(a)}}(a,a.K),25)}function Q(a,c){w(a.R);w(a.S);c(a.M,a.B)}function la(a,c){var b=P(a,c,i),d=a.n.p(b);w(b);return d}function P(a,c,b){c=a.c.createElement("span",{style:R(a,c,a.B,b)},a.qa);v(a.c,"body",c);return c}
function R(a,c,b,d){b=a.v.expand(b);return"position:absolute;top:-999px;left:-999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;font-family:"+(d?"":a.ya.quote(a.M)+",")+c+";"+b};function S(a,c,b,d,e){this.c=a;this.W=c;this.g=b;this.u=d;this.a=e;this.N=this.O=0}S.prototype.q=function(a,c){this.W.ea[a]=c};S.prototype.load=function(a){var c=new ea(this.c,this.g,a);this.a.w()?na(this,c,a):K(c)};S.prototype.wa=function(a,c,b,d){var e=a.Y?a.Y():M;d?a.load(s(this,this.Aa,c,b,e)):(a=0==--this.O,this.N--,a&&(0==this.N?K(c):ga(c)),b.watch([],{},{},e,a))};
S.prototype.Aa=function(a,c,b,d,e,g){var f=0==--this.O;f&&ga(a);this.u(s(this,function(a,b,c,d,e,g){a.watch(b,c||{},d||{},e,g)},c,d,e,g,b,f))};function na(a,c,b){b=ia(a.W,b);a.N=a.O=b.length;for(var d=new L(a.c,c,{p:function(a){return a.offsetWidth}},a.u,function(){return(new Date).getTime()}),e=0,g=b.length;e<g;e++){var f=b[e];f.z(a.a,s(a,a.wa,f,c,d))}};function fa(a){this.xa=a||"-"}fa.prototype.e=function(a){for(var c=[],b=0;b<arguments.length;b++)c.push(arguments[b].replace(/[\W_]+/g,"").toLowerCase());return c.join(this.xa)};function ka(){this.ga="'"}ka.prototype.quote=function(a){for(var c=[],a=a.split(/,\s*/),b=0;b<a.length;b++){var d=a[b].replace(/['"]/g,"");-1==d.indexOf(" ")?c.push(d):c.push(this.ga+d+this.ga)}return c.join(",")};function N(){this.H=oa;this.o=pa}var oa=["font-style","font-weight"],pa={"font-style":[["n","normal"],["i","italic"],["o","oblique"]],"font-weight":[["1","100"],["2","200"],["3","300"],["4","400"],["5","500"],["6","600"],["7","700"],["8","800"],["9","900"],["4","normal"],["7","bold"]]};function T(a,c,b){this.$=a;this.Da=c;this.o=b}T.prototype.compact=function(a,c){for(var b=0;b<this.o.length;b++)if(c==this.o[b][1]){a[this.$]=this.o[b][0];break}};
T.prototype.expand=function(a,c){for(var b=0;b<this.o.length;b++)if(c==this.o[b][0]){a[this.$]=this.Da+":"+this.o[b][1];break}};N.prototype.compact=function(a){for(var c=["n","4"],a=a.split(";"),b=0,d=a.length;b<d;b++){var e=a[b].replace(/\s+/g,"").split(":");if(2==e.length){var g=e[1];a:{for(var e=e[0],f=0;f<this.H.length;f++)if(e==this.H[f]){e=new T(f,e,this.o[e]);break a}e=l}e&&e.compact(c,g)}}return c.join("")};
N.prototype.expand=function(a){if(2!=a.length)return l;for(var c=[l,l],b=0,d=this.H.length;b<d;b++){var e=this.H[b];(new T(b,e,this.o[e])).expand(c,a.substr(b,1))}return c[0]&&c[1]?c.join(";")+";":l};window.WebFont=function(){var a=(new C(navigator.userAgent,document)).parse();return new S(new t(document),new ha,document.documentElement,function(a,b){setTimeout(a,b)},a)}();window.WebFont.load=window.WebFont.load;window.WebFont.addModule=window.WebFont.q;B.prototype.getName=B.prototype.getName;B.prototype.getVersion=B.prototype.va;B.prototype.getEngine=B.prototype.X;B.prototype.getEngineVersion=B.prototype.sa;B.prototype.getPlatform=B.prototype.ta;B.prototype.getPlatformVersion=B.prototype.ua;
B.prototype.getDocumentMode=B.prototype.ra;B.prototype.isSupportingWebFont=B.prototype.w;function U(a,c){this.c=a;this.d=c}U.prototype.load=function(a){for(var c=this.d.urls||[],b=this.d.families||[],d=0,e=c.length;d<e;d++)v(this.c,"head",x(this.c,c[d]));a(b)};U.prototype.z=function(a,c){return c(a.w())};window.WebFont.q("custom",function(a){return new U(new t(document),a)});function V(a,c,b,d,e,g,f,k,m){V.Ea.call(this,a,c,b,d,e,g,f,k,m);a="Times New Roman,Lucida Sans Unicode,Courier New,Tahoma,Arial,Microsoft Sans Serif,Times,Lucida Console,Sans,Serif,Monospace".split(",");c=a.length;b={};d=P(this,a[0],i);b[this.n.p(d)]=i;for(e=1;e<c;e++)g=a[e],u(this.c,d,R(this,g,this.B,i)),b[this.n.p(d)]=i,"4"!=this.B[1]&&(u(this.c,d,R(this,g,this.B[0]+"4",i)),b[this.n.p(d)]=i);w(d);this.t=b;this.ka=o}
(function(a,c){function b(){}b.prototype=a.prototype;c.prototype=new b;c.Ea=a;c.Ha=a.prototype})(M,V);var qa={Arimo:i,Cousine:i,Tinos:i};V.prototype.K=function(){var a=this.n.p(this.R),c=this.n.p(this.S);!this.ka&&a==c&&this.t[a]&&(this.t={},this.ka=this.t[a]=i);(this.P!=a||this.Q!=c)&&!this.t[a]&&!this.t[c]?Q(this,this.I):5E3<=this.D()-this.ha?this.t[a]&&this.t[c]&&qa[this.M]?Q(this,this.I):Q(this,this.Z):ma(this)};function ra(a){this.J=a?a:("https:"==window.location.protocol?"https:":"http:")+sa;this.f=[];this.T=[]}var sa="//fonts.googleapis.com/css";ra.prototype.e=function(){if(0==this.f.length)throw Error("No fonts to load !");if(-1!=this.J.indexOf("kit="))return this.J;for(var a=this.f.length,c=[],b=0;b<a;b++)c.push(this.f[b].replace(/ /g,"+"));a=this.J+"?family="+c.join("%7C");0<this.T.length&&(a+="&subset="+this.T.join(","));return a};function ta(a){this.f=a;this.fa=[];this.ja={};this.G={};this.v=new N}var ua={ultralight:"n2",light:"n3",regular:"n4",bold:"n7",italic:"i4",bolditalic:"i7",ul:"n2",l:"n3",r:"n4",b:"n7",i:"i4",bi:"i7"},va={latin:"BESbswy",cyrillic:"&#1081;&#1103;&#1046;",greek:"&#945;&#946;&#931;",khmer:"&#x1780;&#x1781;&#x1782;",Hanuman:"&#x1780;&#x1781;&#x1782;"};
ta.prototype.parse=function(){for(var a=this.f.length,c=0;c<a;c++){var b=this.f[c].split(":"),d=b[0].replace(/\+/g," "),e=["n4"];if(2<=b.length){var g;var f=b[1];g=[];if(f)for(var f=f.split(","),k=f.length,m=0;m<k;m++){var j;j=f[m];if(j.match(/^[\w ]+$/)){var n=ua[j];n?j=n:(n=j.match(/^(\d*)(\w*)$/),j=n[1],n=n[2],j=(j=this.v.expand([n?n:"n",j?j.substr(0,1):"4"].join("")))?this.v.compact(j):l)}else j="";j&&g.push(j)}0<g.length&&(e=g);3==b.length&&(b=b[2],g=[],b=!b?g:b.split(","),0<b.length&&(b=va[b[0]])&&
(this.G[d]=b))}this.G[d]||(b=va[d])&&(this.G[d]=b);this.fa.push(d);this.ja[d]=e}};function W(a,c,b){this.a=a;this.c=c;this.d=b}W.prototype.z=function(a,c){c(a.w())};W.prototype.Y=function(){return"AppleWebKit"==this.a.X()?V:M};W.prototype.load=function(a){"MSIE"==this.a.getName()&&this.d.blocking!=i?aa(s(this,this.aa,a)):this.aa(a)};W.prototype.aa=function(a){for(var c=this.c,b=new ra(this.d.api),d=this.d.families,e=d.length,g=0;g<e;g++){var f=d[g].split(":");3==f.length&&b.T.push(f.pop());b.f.push(f.join(":"))}d=new ta(d);d.parse();v(c,"head",x(c,b.e()));a(d.fa,d.ja,d.G)};
window.WebFont.q("google",function(a){var c=(new C(navigator.userAgent,document)).parse();return new W(c,new t(document),a)});function X(a,c){this.c=a;this.d=c}var wa={regular:"n4",bold:"n7",italic:"i4",bolditalic:"i7",r:"n4",b:"n7",i:"i4",bi:"i7"};X.prototype.z=function(a,c){return c(a.w())};
X.prototype.load=function(a){var c,b;v(this.c,"head",x(this.c,("https:"==document.location.protocol?"https:":"http:")+"//webfonts.fontslive.com/css/"+this.d.key+".css"));var d=this.d.families,e,g;e=[];g={};for(var f=0,k=d.length;f<k;f++){b=b=c=h;b=d[f].split(":");c=b[0];if(b[1]){b=b[1].split(",");for(var m=[],j=0,n=b.length;j<n;j++){var D=b[j];if(D){var r=wa[D];m.push(r?r:D)}}b=m}else b=["n4"];e.push(c);g[c]=b}a(e,g)};window.WebFont.q("ascender",function(a){return new X(new t(document),a)});function Y(a,c,b){this.m=a;this.c=c;this.d=b;this.f=[];this.s={};this.v=new N}Y.prototype.C=function(a){return("https:"==this.m.location.protocol?"https:":"http:")+(this.d.api||"//f.fontdeck.com/s/css/js/")+this.m.document.location.hostname+"/"+a+".js"};
Y.prototype.z=function(a,c){var b=this.d.id,d=this;b?(this.m.__webfontfontdeckmodule__||(this.m.__webfontfontdeckmodule__={}),this.m.__webfontfontdeckmodule__[b]=function(a,b){for(var f=0,k=b.fonts.length;f<k;++f){var m=b.fonts[f];d.f.push(m.name);d.s[m.name]=[d.v.compact("font-weight:"+m.weight+";font-style:"+m.style)]}c(a)},v(this.c,"head",y(this.c,this.C(b)))):c(i)};Y.prototype.load=function(a){a(this.f,this.s)};window.WebFont.q("fontdeck",function(a){return new Y(window,new t(document),a)});function Z(a,c,b,d,e){this.m=a;this.a=c;this.c=b;this.k=d;this.d=e;this.f=[];this.s={}}Z.prototype.z=function(a,c){var b=this,d=b.d.projectId;if(d){var e=y(b.c,b.C(d));e.id="__MonotypeAPIScript__"+d;e.onreadystatechange=function(a){if("loaded"===e.readyState||"complete"===e.readyState)e.onreadystatechange=l,e.onload(a)};e.onload=function(){if(b.m["__mti_fntLst"+d]){var e=b.m["__mti_fntLst"+d]();if(e&&e.length){var f;for(f=0;f<e.length;f++)b.f.push(e[f].fontfamily)}}c(a.w())};v(this.c,"head",e)}else c(i)};
Z.prototype.C=function(a){var c=this.protocol(),b=(this.d.api||"fast.fonts.com/jsapi").replace(/^.*http(s?):(\/\/)?/,"");return c+"//"+b+"/"+a+".js"};Z.prototype.load=function(a){a(this.f,this.s)};Z.prototype.protocol=function(){var a=["http:","https:"],c=a[0];if(this.k&&this.k.location&&this.k.location.protocol)for(var b=0,b=0;b<a.length;b++)if(this.k.location.protocol===a[b])return this.k.location.protocol;return c};
window.WebFont.q("monotype",function(a){var c=(new C(navigator.userAgent,document)).parse();return new Z(window,c,new t(document),document,a)});function $(a,c,b){this.m=a;this.c=c;this.d=b;this.f=[];this.s={}}$.prototype.C=function(a){var c="https:"==window.location.protocol?"https:":"http:";return(this.d.api||c+"//use.typekit.com")+"/"+a+".js"};$.prototype.z=function(a,c){var b=this.d.id,d=this.d,e=this;b?(this.m.__webfonttypekitmodule__||(this.m.__webfonttypekitmodule__={}),this.m.__webfonttypekitmodule__[b]=function(b){b(a,d,function(a,b,d){e.f=b;e.s=d;c(a)})},v(this.c,"head",y(this.c,this.C(b)))):c(i)};
$.prototype.load=function(a){a(this.f,this.s)};window.WebFont.q("typekit",function(a){return new $(window,new t(document),a)});window.WebFontConfig&&window.WebFont.load(window.WebFontConfig);
    return window.WebFont;
})((typeof window === 'undefined') ? null : window,
   (typeof document === 'undefined') ? null : document,
   (typeof navigator === 'undefined') ? {} : navigator);
});

/** @license
 * RequireJS plugin for loading web fonts using the WebFont Loader
 * Author: Miller Medeiros
 * Version: 0.2.0 (2011/12/06)
 * Released under the MIT license
 */
// webfont.js is the typekit loader, from
//   https://github.com/typekit/webfontloader
// it defines window.WebFont
define('font',['propertyParser','webfont'], function (propertyParser, WebFont) {

    var rParts = /^([^,]+),([^\|]+)\|?/;

    function parseName(name) {
        var data = {},
            vendors = name.split('|'),
            n = vendors.length,
            match;

        while (n--) {
            match = rParts.exec(vendors[n]);
            data[ match[1] ] = propertyParser.parseProperties(match[2]);
        }
        return data;
    }

    // API
    return {

        //example: font!google,families:[Tangerine,Cantarell,Yanone Kaffeesatz:700]
        load : function(name, req, onLoad, config){
            if (config.isBuild) {
                onLoad(null); //avoid errors on the optimizer
            } else {
                var data = parseName(name);
                data.active = onLoad;
                data.inactive = function(){
                    onLoad(false);
                };
                WebFont.load(data);
            }
        }

    };

});

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
        font: "../plugins/font",
        webfont: "../plugins/webfont",
        propertyParser: "../plugins/propertyParser",
        json: "../plugins/json",
        text: "../plugins/text"
    }
});
define('ncolors',['require', 'domReady!', /*'./src/audio-map.js',*/ './src/brush', './src/color', './src/compat', './src/dom', './src/drawcommand', './src/drawing', './src/layer', './src/gallery', './lib/hammer', './src/postmessage', './src/prandom!', './src/recog', './src/sound', './src/sync', './lib/BlobBuilder', './lib/FileSaver', 'font!custom,families:[Delius],urls:[fonts/style.css]'], function(require, document, /*audioMap,*/ Brush, Color, Compat, Dom, DrawCommand, Drawing, Layer, Gallery, Hammer, postMessage, prandom, Recog, Sound, Sync, BlobBuilder, saveAs) {
    
    // Android browser doesn't support MessageChannel
    // -- however, it also has a losing canvas. so don't worry too much.
    var USE_MESSAGECHANNEL = (typeof(MessageChannel) !== 'undefined');
    var toolbarPort = null;

    // How long to allow between strokes of a letter
    var RECOG_TIMEOUT = 750;
    // minimum frame rate during replay
    var MAX_FRAME_TIME_MS = 1000 / 30 /* Hz */;
    // show frame rate overlay
    var SHOW_FRAME_RATE = true;
    // limit touch event frequency (set to 0 to disable rate limiting)
    var TOUCH_EVENT_INTERVAL_MS = 25; /* 40 Hz */
    // (this isn't needed on iphone/ipad)
    if (/(iPhone|iPad).*Safari/.test(navigator.userAgent)) {
        TOUCH_EVENT_INTERVAL_MS = 0;
    }

    // get 2d context for canvas.
    Dom.insertMeta(document);
    var drawingElem = document.getElementById('drawing');
    var drawing = new Drawing();
    drawing.placeholder = true;
    drawing.attachToContainer(drawingElem);
    var hammer = new Hammer(drawingElem, {
        prevent_default: true,
        drag_min_distance: 2
    });

    var maybeRequestAnim, removeRecogCanvas;
    var updateToolbarBrush, replaceDrawing, maybeSyncDrawing;

    var recog_timer_id = null;
    // cancel any running recog timer (ie, if stroke in progress)
    var recog_timer_cancel = function() {
        if (recog_timer_id) {
            clearTimeout(recog_timer_id);
            recog_timer_id = null;
        }
    };
    // ignore all strokes to date; start recognition with next stroke.
    var recog_reset = function() {
        drawing.commands.recog = drawing.commands.end;
        recog_timer_cancel();
    };
    // timeout function to call recog_reset automatically after a delay
    var recog_timer = function() {
        recog_timer_id = null;
        recog_reset();
    };
    // manually start/reset the recog_timer (ie, stroke ended)
    var recog_timer_reset = function() {
        if (recog_timer_id) {
            clearTimeout(recog_timer_id);
        }
        recog_timer_id = setTimeout(recog_timer, RECOG_TIMEOUT);
    };

    var updateFrameRate = function() { };
    if (SHOW_FRAME_RATE) {
        updateFrameRate = (function() {
            var fr = document.getElementById('framerate');
            var num = fr.children[0];
            var frametimes = [Date.now()];
            fr.style.display = 'block'; // make visible
            return function() {
                // average last 20 frame times to smooth display
                frametimes.push(Date.now());
                while (frametimes.length > 20) {
                    frametimes.shift();
                }
                var elapsed =
                    (frametimes[frametimes.length-1] - frametimes[0]) /
                    (frametimes.length-1);
                var fps = 1000/elapsed;
                num.textContent = Math.round(fps);
            };
        })();
    }

    var animRequested = false;
    var INSTANTANEOUS = 0; // special speed value
    var playbackInfo = {
        isPlaying: false,
        lastFrameTime: 0,
        speed: INSTANTANEOUS
    };
    var maybeHaltPlayback = function() {
        if (!playbackInfo.isPlaying) { return; }
        playbackInfo.speed = INSTANTANEOUS;
        recog_reset();
    };
    var startPlayback = function() {
        if (!playbackInfo.isPlaying) {
            playbackInfo.lastFrameTime = Date.now();
            playbackInfo.speed = 4;
        }
        drawing.setCmdPos(Drawing.START);
        removeRecogCanvas();
        maybeRequestAnim();
    };
    var playback = function() {
        console.assert(drawing.commands.last !== drawing.commands.end);
        console.assert(animRequested);

        var curtime = Date.now();
        var isMore;
        updateFrameRate();

        if (playbackInfo.speed === INSTANTANEOUS) {
            // play back as much as possible
            isMore = drawing.setCmdPos(Drawing.END,
                                       MAX_FRAME_TIME_MS);
        } else {
            // play some frames.
            var timeDelta = curtime - playbackInfo.lastFrameTime;
            // have mercy on slow CPUs: even if we get stuck behind the
            // refresh rate curve, don't try to play back too much to keep up
            timeDelta = Math.min(100/*10Hz*/, timeDelta);
            isMore = drawing.setCmdTime(timeDelta * playbackInfo.speed,
                                        MAX_FRAME_TIME_MS);
        }
        playbackInfo.lastFrameTime = curtime;

        // are we done, or do we need to schedule another animation frame?
        if (isMore) {
            if (!playbackInfo.isPlaying) {
                playbackInfo.isPlaying = true;
                toolbarPort.postMessage(JSON.stringify({type:'playing'}));
                // infrequent checkpoints during playback
                drawing.checkpointOften = false;
            }
            Compat.requestAnimationFrame(playback);
        } else {
            if (playbackInfo.isPlaying) {
                playbackInfo.isPlaying = false;
                playbackInfo.speed = INSTANTANEOUS;
                toolbarPort.postMessage(JSON.stringify({type:'stopped'}));
                // frequent checkpoints for editing
                drawing.checkpointOften = true;
                drawing.addCheckpoint(true);
            }
            animRequested = false;
            updateToolbarBrush();
        }
    };
    maybeRequestAnim = function() {
        if (!animRequested) {
            console.assert(drawing.commands.last !== drawing.commands.end);
            animRequested = true;
            Compat.requestAnimationFrame(playback);
        }
    };

    var isDragging = false;
    var lastpos = { x: null, y: null, time: 0 };
    hammer.ondrag = function(ev) {
        maybeHaltPlayback();
        if (!isDragging) {
            // XXX fill in current layer here
            drawing.addCmd(DrawCommand.create_draw_start(drawing.layers.current));
            lastpos.x = lastpos.y = null; // force emit next point
            lastpos.time = 0;
        }
        isDragging = true;
        if (ev.position.x === lastpos.x &&
            ev.position.y === lastpos.y) {
            // nothing to do here.
            return;
        }
        // rate limit touch updates -- this is needed for good performance
        // on Android/Xoom.
        var now = Date.now();
        if (now - lastpos.time < TOUCH_EVENT_INTERVAL_MS) {
            return;
        }
        lastpos.x = ev.position.x;
        lastpos.y = ev.position.y;
        lastpos.time = now;
        drawing.addCmd(DrawCommand.create_draw(ev.position));
        maybeRequestAnim();
        // stroke in progress, don't try to recognize
        recog_timer_cancel();
    };
    hammer.ondragend = function(ev) {
        isDragging = false;
        drawing.addCmd(DrawCommand.create_draw_end());
        maybeRequestAnim();
        if (ev) {
            //console.log("Attempt recog from", commands.recog,
            //            "to", commands.length);
            Recog.attemptRecognition(drawing.commands,
                                     drawing.commands.recog,
                                     drawing.commands.end);
        }
        // start recog reset timer
        recog_timer_reset();
        // save
        maybeSyncDrawing();
    };

    // generate <audio> elements for various snippets we might want to play
    var audio_snippets = {};
    ['A','B','C','D','E','F','G','H','I','J','K','L','M',
     'N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
        .forEach(function(id,n) {
        var audio = null;
        if (!/(iPhone|iPad).*Safari/.test(navigator.userAgent)) {
            // sadly, just creating audio tags slows down iphone/ipad by
            // a *lot*... and then they won't even play the audio! boo.
            // performance hit seems proportional to how many audio tags are
            // on the page, so we might be able to reenable this on iOS
            // using audio sprites (ie, a single audio file containing all
            // clips)
            // (and inlining the audio snippets with data: URLs breaks iOS
            // as well, so set audioMap to null if you re-enable this)
            audio = new Sound.Effect({ url:'audio/'+id,
                                       instances: 2,
                                       formats: ['ogg','mp3'] });
        }
        audio_snippets[id] = audio;
        });

    var lastRecogCanvas = null;
    removeRecogCanvas = function() {
        if (lastRecogCanvas) {
            drawingElem.removeChild(lastRecogCanvas);
            lastRecogCanvas = null;
        }
    };
    var handleRecog = function(model, prob, bbox) {
        if (prob < 400) { removeRecogCanvas(); return; }
        var letter = model.charAt(0);
        //console.log(model);

        // draw recognized letter on "recognition canvas"
        var r = window.devicePixelRatio || 1;
        var w = bbox.br.x - bbox.tl.x, h = bbox.br.y - bbox.tl.y;
        // offset by current brush width (this is a bit hackity)
        // XXX and is broken w/ lowercase letters
        w += drawing.brush.size; h += drawing.brush.size;
        var c = document.createElement('canvas');
        c.style.border="1px dashed #ccc";
        c.style.position='absolute';
        c.style.top = (bbox.tl.y-(drawing.brush.size/2))+'px';
        c.style.left = (bbox.tl.x-(drawing.brush.size/2))+'px';
        c.style.width = w+'px';
        c.style.height = h+'px';
        c.style.opacity = 0.3;
        c.width = w*r;
        c.height = h*r;
        var ctxt = c.getContext('2d');
        // Patrick+Hand is a good alternative to Delius
        // 1.2 factor in font size is fudge factor to make letter fit
        // bounding box more tightly
        ctxt.font = (c.height*1.2)+"px Delius, sans-serif";
        ctxt.textAlign = "center";
        ctxt.textBaseline = "middle";
        ctxt.fillStyle = drawing.brush.color.to_string().replace(/..$/,'');
        ctxt.translate(c.width/2, c.height/2);
        // measure the expected width
        var metrics = ctxt.measureText(letter);
        if (metrics.width < c.width) {
            ctxt.scale(c.width/metrics.width, 1); // scale up to fit
        }
        ctxt.fillText(model.charAt(0), 0, 0, c.width);
        removeRecogCanvas();
        lastRecogCanvas = c;
        drawingElem.appendChild(lastRecogCanvas);

        // say the letter name
        var audio = audio_snippets[letter.toUpperCase()];
        if (audio) {
            try {
                audio.play();
                // console.log(letter + ' played natively');
            } catch (e) {
                if (/(iPhone|iPad).*Safari/.test(navigator.userAgent)) {
                    // iOS won't let us load/play content w/o user interaction
                    // this is really annoying.
                } else {
                    console.log("Unexpected problem playing audio.", e);
                }
            }
        }
    };
    Recog.registerCallback(handleRecog);

    updateToolbarBrush = (function() {
        // don't post redundant updates (ie, while drawing!)
        var lastBrush = new Brush(), first = true;
        return function() {
            if (lastBrush.equals(drawing.brush) && !first) {
                return; // already up to date
            }
            lastBrush.set_from_brush(drawing.brush);
            first = false;
            var msg = {
                type: 'brush',
                color: drawing.brush.color.to_string(),
                brush_type:  drawing.brush.type,
                size:  drawing.brush.size,
                opacity: drawing.brush.opacity,
                spacing: drawing.brush.spacing
            };
            toolbarPort.postMessage(JSON.stringify(msg));
            // XXX update undo/redo active as well.
        };
    }());

    var doUndo = function() {
        console.assert(!isDragging);
        var isMore = drawing.undo(MAX_FRAME_TIME_MS);
        if (isMore) {
            maybeRequestAnim();
        } else {
            // update the toolbar opacity/size to match
            updateToolbarBrush();
        }
        // stop recognition and cancel timer
        recog_reset();
        maybeSyncDrawing();
    };
    var doRedo = function() {
        console.assert(!isDragging);
        var isMore = drawing.redo(MAX_FRAME_TIME_MS);
        if (isMore) {
            maybeRequestAnim();
        } else {
            // update the toolbar opacity/size to match
            updateToolbarBrush();
        }
        // don't repeat recognition (and cancel timer)
        recog_reset();
        maybeSyncDrawing();
    };
    var doSave = function() {
        var json = JSON.stringify(drawing, null, 1);
        var blob, blobUrl;
        try {
            blob = new window.Blob([json], {type:"text/plain;charset=ascii"});
        } catch (e) {
            var bb = new BlobBuilder();
            bb.append(json);
            blob = bb.getBlob("text/plain;charset=ascii");
        }
        saveAs(blob, 'drawing.json');
    };
    var doSave1 = function() {
        console.log('saving', drawing.uuid);
        Sync.save(drawing, function() {
            console.log('saved!', drawing.uuid);
            Sync.load(drawing.uuid, function(ndrawing) {
                console.log('loaded', ndrawing.uuid);
                replaceDrawing(ndrawing);
            });
        });
    };
    maybeSyncDrawing = function() {
        var isSaving = false, isDirty = false;
        return function() {
            if (isSaving) {
                // can't save now, queue it for later.
                isDirty = true;
                return;
            }
            // ok, save now!
            isSaving = true;
            isDirty = true;
            var drawing_copy = drawing;
            var afterSave = function() {
                if (isDirty) {
                    // someone requested another save while we were busy, do it
                    isDirty = false;
                    Sync.save(drawing_copy, afterSave);
                } else {
                    // we're all caught up!
                    isSaving = false;
                }
            };
            afterSave();
        };
    }();

    var onWindowResize = function(event) {
        var w = window.innerWidth, h = window.innerHeight;
        var r = window.devicePixelRatio || 1;
        //console.log("Resizing canvas", w, h, r);
        var oldpos = drawing.commands.last;
        drawing.resize(w, h, r);
        // try to restore the old position
        var isMore = drawing.setCmdPos(oldpos, MAX_FRAME_TIME_MS);
        // if we were unsuccessful, maybe schedule some future playback time
        if (isMore) {
            maybeRequestAnim();
        }
    };
    window.addEventListener('resize', onWindowResize, false);

    // create a channel to listen to toolbar messages.
    var handleToolbarMessage = function(evt) {
        if (isDragging) { hammer.ondragend(); }
        var msg = JSON.parse(evt.data);
        if (msg.type !== 'playButton') { maybeHaltPlayback(); }
        var caughtUp = (drawing.commands.last === drawing.commands.end);
        switch(msg.type) {
        case 'undoButton':
            removeRecogCanvas();
            doUndo();
            break;
        case 'redoButton':
            removeRecogCanvas();
            doRedo();
            break;
        case 'swatchButton':
            var color = Color.from_string(msg.color);
            if (caughtUp && Color.equal(drawing.brush.color, color)) {
                break;
            }
            drawing.addCmd(DrawCommand.create_color_change(color));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush immed.
            }
            break;
        case 'hardButton':
            if (caughtUp && drawing.brush.type === 'hard') {
                break;
            }
            drawing.addCmd(DrawCommand.create_brush_change({
                brush_type: 'hard'
            }));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush
            }
            break;
        case 'softButton':
            if (caughtUp && drawing.brush.type === 'soft') {
                break;
            }
            drawing.addCmd(DrawCommand.create_brush_change({
                brush_type: 'soft'
            }));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush
            }
            break;
        case 'opacitySlider':
            if (caughtUp && drawing.brush.opacity === +msg.value) {
                break;
            }
            drawing.addCmd(DrawCommand.create_brush_change({
                opacity: +msg.value
            }));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush
            }
            break;
        case 'sizeSlider':
            if (caughtUp && drawing.brush.size === +msg.value) {
                break;
            }
            drawing.addCmd(DrawCommand.create_brush_change({
                size: +msg.value
            }));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush
            }
            break;
        case 'playButton':
            if (playbackInfo.isPlaying &&
                playbackInfo.speed !== INSTANTANEOUS) {
                playbackInfo.speed *= 4;
            } else {
                startPlayback();
            }
            break;
        case 'saveButton':
            doSave();
            break;
        default:
            console.warn("Unexpected child toolbar message", evt);
            break;
        }
    };

    // listen to other messages from our parent
    var handleMessage = function(evt) {
        var msg = evt.data;
        if (typeof(msg)==='string') { msg = JSON.parse(msg); }
        switch (msg.type) {
        case 'toolbar':
            // synthetic MessageChannel
            return toolbarPort.dispatchEvent({data:msg.msg});
        default:
            console.warn("Unexpected child message", evt);
            break;
        }
    };
    window.addEventListener('message', handleMessage, false);

    // Notify our parent that we're ready to rock!
    var msg = { type: 'childReady' };
    if (USE_MESSAGECHANNEL) {
        var toolbarChannel = new MessageChannel();
        toolbarPort = toolbarChannel.port1;
        toolbarPort.addEventListener('message', handleToolbarMessage,
                                     false);
        toolbarPort.start();
        postMessage(window.parent, JSON.stringify(msg), '*',
                    [toolbarChannel.port2]);
    } else {
        toolbarPort = {
            dispatchEvent: function(evt) {
                handleToolbarMessage(evt);
            },
            postMessage: function(msg) {
                var m = { type: 'toolbar', msg: msg };
                postMessage(window.parent, JSON.stringify(m), '*');
            }
        };
        postMessage(window.parent, JSON.stringify(msg), '*');
    }
    var notifyParentHash = function(newHash, optReplace, optTitle) {
        var msg = {
            type: 'hashchange',
            hash: newHash
        };
        if (optReplace) {
            msg.replace = true;
            msg.title = optTitle;
        }
        postMessage(window.parent, JSON.stringify(msg), '*');
    };

    replaceDrawing = function(new_drawing, optForceSave) {
        console.assert(new_drawing.uuid);
        drawing.removeFromContainer(drawingElem);
        removeRecogCanvas();
        recog_timer_cancel();
        drawing = new_drawing;
        drawing.attachToContainer(drawingElem);
        if (document.location.hash !== ('#' + drawing.uuid)) {
            document.location.hash = '#' + drawing.uuid;
            notifyParentHash(document.location.hash);
        }
        if (drawing.initial_playback_speed) {
            playbackInfo.speed = drawing.initial_playback_speed;
        }
        // finally, update the toolbar opacity/size to match
        updateToolbarBrush();
        onWindowResize();
        document.getElementById("loading").style.display="none";
        // newly loaded sample drawings need to be saved w/ their new UUID
        if (optForceSave) {
            maybeSyncDrawing();
        }
    };

    var loadDrawing = function(uuid, callback) {
        var nd, gallery;
        switch(uuid) {
        case 'castle':
        case 'intro':
        case 'lounge':
        case 'r':
        case 'roger':
            // special built-in drawings.
            require(['drw!samples/'+uuid+'.json'], function(new_drawing) {
                new_drawing.uuid = prandom.uuid();
                if (window.history.replaceState) {
                    window.history.replaceState(null, uuid, '#'+new_drawing.uuid);
                    notifyParentHash('#'+new_drawing.uuid, true, uuid);
                }
                callback(new_drawing, true/* force initial save */);
            });
            break;
        case '':
        case 'gallery':
            gallery = new Gallery();
            gallery.wait(function(uuid) {
                // hide the gallery and load the new drawing
                document.body.removeChild(gallery.domElement);
                loadDrawing(uuid, callback);
            });
            document.body.appendChild(gallery.domElement);
            // discard old drawing (replace with blank placeholder)
            drawing.removeFromContainer(drawingElem);
            removeRecogCanvas();
            recog_timer_cancel();
            drawing = new Drawing();
            drawing.placeholder = true;
            drawing.attachToContainer(drawingElem);
            break;
        case 'new':
            nd = new Drawing();
            nd.uuid = prandom.uuid();
            callback(nd);
            break;
        default:
            Sync.exists(uuid, function(exists) {
                if (exists) {
                    Sync.load(uuid, callback);
                } else {
                    // XXX attempt to load from network?
                    nd = new Drawing();
                    nd.uuid = uuid;
                    callback(nd);
                }
            });
            break;
        }
    };
    var onHashChange = function() {
        var uuid = document.location.hash.replace(/^#/,'');
        if (uuid === drawing.uuid) { return; /* already loaded */ }
        // Load new document.
        notifyParentHash(document.location.hash, true, uuid);
        Gallery.abort();
        document.getElementById("loading").style.display="block";
        loadDrawing(uuid, replaceDrawing);
    };
    window.addEventListener('hashchange', onHashChange, false);

    // load the requested doc (based on URL hash)
    loadDrawing(document.location.hash.replace(/^#/,''), replaceDrawing);
});

/**
 * RequireJS plugin for loading drawing JSON
 * depends on json plugin.
 * Author: C. Scott Ananian
 */
define('drw',['src/drawing'], function(Drawing) {
    return {
        load : function(name, req, onLoad, config) {
            // recurse to load the json file containing the drawing data
            req(['json!'+name], function(data) {
                if (config.isBuild) {
                    // indicate that this plugin can't be inlined
                    // (although the json! dependency can)
                    onLoad(null);
                } else {
                    Drawing.fromJSON(data, function(drawing) {
                        onLoad(drawing);
                    });
                }
            });
        }
    };
});

/**
 * @license RequireJS text 1.0.7 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint regexp: false, nomen: false, plusplus: false, strict: false */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false, location: false */

(function () {
    var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = [];

    define('text',[],function () {
        var text, get, fs;

        if (typeof window !== "undefined" && window.navigator && window.document) {
            get = function (url, callback) {
                var xhr = text.createXhr();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function (evt) {
                    //Do not explicitly handle errors, those should be
                    //visible via console output in the browser.
                    if (xhr.readyState === 4) {
                        callback(xhr.responseText);
                    }
                };
                xhr.send(null);
            };
        } else if (typeof process !== "undefined" &&
                 process.versions &&
                 !!process.versions.node) {
            //Using special require.nodeRequire, something added by r.js.
            fs = require.nodeRequire('fs');

            get = function (url, callback) {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            };
        } else if (typeof Packages !== 'undefined') {
            //Why Java, why is this so awkward?
            get = function (url, callback) {
                var encoding = "utf-8",
                    file = new java.io.File(url),
                    lineSeparator = java.lang.System.getProperty("line.separator"),
                    input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                    stringBuffer, line,
                    content = '';
                try {
                    stringBuffer = new java.lang.StringBuffer();
                    line = input.readLine();

                    // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                    // http://www.unicode.org/faq/utf_bom.html

                    // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                    // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                    if (line && line.length() && line.charAt(0) === 0xfeff) {
                        // Eat the BOM, since we've already found the encoding on this file,
                        // and we plan to concatenating this buffer with others; the BOM should
                        // only appear at the top of a file.
                        line = line.substring(1);
                    }

                    stringBuffer.append(line);

                    while ((line = input.readLine()) !== null) {
                        stringBuffer.append(lineSeparator);
                        stringBuffer.append(line);
                    }
                    //Make sure we return a JavaScript string and not a Java string.
                    content = String(stringBuffer.toString()); //String
                } finally {
                    input.close();
                }
                callback(content);
            };
        } else if (typeof XMLHttpRequest !== 'undefined') {
            // web worker
            get = function (url, callback) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function (evt) {
                    //Do not explicitly handle errors, those should be
                    //visible via console output in the browser.
                    if (xhr.readyState === 4) {
                        callback(xhr.responseText);
                    }
                };
                xhr.send(null);
            };
        } else {
            console.warn("No GET implementation found for text plugin.");
        }

        text = {
            version: '1.0.7',

            strip: function (content) {
                //Strips <?xml ...?> declarations so that external SVG and XML
                //documents can be added to a document without worry. Also, if the string
                //is an HTML document, only the part inside the body tag is returned.
                if (content) {
                    content = content.replace(xmlRegExp, "");
                    var matches = content.match(bodyRegExp);
                    if (matches) {
                        content = matches[1];
                    }
                } else {
                    content = "";
                }
                return content;
            },

            jsEscape: function (content) {
                return content.replace(/(['\\])/g, '\\$1')
                    .replace(/[\f]/g, "\\f")
                    .replace(/[\b]/g, "\\b")
                    .replace(/[\n]/g, "\\n")
                    .replace(/[\t]/g, "\\t")
                    .replace(/[\r]/g, "\\r");
            },

            createXhr: function () {
                //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
                var xhr, i, progId;
                if (typeof XMLHttpRequest !== "undefined") {
                    return new XMLHttpRequest();
                } else {
                    for (i = 0; i < 3; i++) {
                        progId = progIds[i];
                        try {
                            xhr = new ActiveXObject(progId);
                        } catch (e) {}

                        if (xhr) {
                            progIds = [progId];  // so faster next time
                            break;
                        }
                    }
                }

                if (!xhr) {
                    throw new Error("createXhr(): XMLHttpRequest not available");
                }

                return xhr;
            },

            get: get,

            /**
             * Parses a resource name into its component parts. Resource names
             * look like: module/name.ext!strip, where the !strip part is
             * optional.
             * @param {String} name the resource name
             * @returns {Object} with properties "moduleName", "ext" and "strip"
             * where strip is a boolean.
             */
            parseName: function (name) {
                var strip = false, index = name.indexOf("."),
                    modName = name.substring(0, index),
                    ext = name.substring(index + 1, name.length);

                index = ext.indexOf("!");
                if (index !== -1) {
                    //Pull off the strip arg.
                    strip = ext.substring(index + 1, ext.length);
                    strip = strip === "strip";
                    ext = ext.substring(0, index);
                }

                return {
                    moduleName: modName,
                    ext: ext,
                    strip: strip
                };
            },

            xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

            /**
             * Is an URL on another domain. Only works for browser use, returns
             * false in non-browser environments. Only used to know if an
             * optimized .js version of a text resource should be loaded
             * instead.
             * @param {String} url
             * @returns Boolean
             */
            useXhr: function (url, protocol, hostname, port) {
                var match = text.xdRegExp.exec(url),
                    uProtocol, uHostName, uPort;
                if (!match) {
                    return true;
                }
                uProtocol = match[2];
                uHostName = match[3];

                uHostName = uHostName.split(':');
                uPort = uHostName[1];
                uHostName = uHostName[0];

                return (!uProtocol || uProtocol === protocol) &&
                       (!uHostName || uHostName === hostname) &&
                       ((!uPort && !uHostName) || uPort === port);
            },

            finishLoad: function (name, strip, content, onLoad, config) {
                content = strip ? text.strip(content) : content;
                if (config.isBuild) {
                    buildMap[name] = content;
                }
                onLoad(content);
            },

            load: function (name, req, onLoad, config) {
                //Name has format: some.module.filext!strip
                //The strip part is optional.
                //if strip is present, then that means only get the string contents
                //inside a body tag in an HTML string. For XML/SVG content it means
                //removing the <?xml ...?> declarations so the content can be inserted
                //into the current doc without problems.

                // Do not bother with the work if a build and text will
                // not be inlined.
                if (config.isBuild && !config.inlineText) {
                    onLoad();
                    return;
                }

                var parsed = text.parseName(name),
                    nonStripName = parsed.moduleName + '.' + parsed.ext,
                    url = req.toUrl(nonStripName),
                    useXhr = (config && config.text && config.text.useXhr) ||
                             text.useXhr;

                //Load the text. Use XHR if possible and in a browser.
                if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                    text.get(url, function (content) {
                        text.finishLoad(name, parsed.strip, content, onLoad, config);
                    });
                } else {
                    //Need to fetch the resource across domains. Assume
                    //the resource has been optimized into a JS module. Fetch
                    //by the module name + extension, but do not include the
                    //!strip part to avoid file system issues.
                    req([nonStripName], function (content) {
                        text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                        parsed.strip, content, onLoad, config);
                    });
                }
            },

            write: function (pluginName, moduleName, write, config) {
                if (moduleName in buildMap) {
                    var content = text.jsEscape(buildMap[moduleName]);
                    write.asModule(pluginName + "!" + moduleName,
                                   "define(function () { return '" +
                                       content +
                                   "';});\n");
                }
            },

            writeFile: function (pluginName, moduleName, req, write, config) {
                var parsed = text.parseName(moduleName),
                    nonStripName = parsed.moduleName + '.' + parsed.ext,
                    //Use a '.js' file name so that it indicates it is a
                    //script that can be loaded across domains.
                    fileName = req.toUrl(parsed.moduleName + '.' +
                                         parsed.ext) + '.js';

                //Leverage own load() method to load plugin value, but only
                //write out values that do not have the strip argument,
                //to avoid any potential issues with ! in file names.
                text.load(nonStripName, req, function (value) {
                    //Use own write() method to construct full module value.
                    //But need to create shell that translates writeFile's
                    //write() to the right interface.
                    var textWrite = function (contents) {
                        return write(fileName, contents);
                    };
                    textWrite.asModule = function (moduleName, contents) {
                        return write.asModule(moduleName, fileName, contents);
                    };

                    text.write(pluginName, nonStripName, textWrite, config);
                }, config);
            }
        };

        return text;
    });
}());

/** @license
 * RequireJS plugin for loading JSON files
 * - depends on Text plugin and it was HEAVILY "inspired" by it as well.
 * Author: Miller Medeiros
 * Version: 0.2.1 (2012/04/17)
 * Released under the MIT license
 */
define('json',['text'], function(text){

    var CACHE_BUST_QUERY_PARAM = 'bust',
        CACHE_BUST_FLAG = '!bust',
        jsonParse = (typeof JSON !== 'undefined' && typeof JSON.parse === 'function')? JSON.parse : function(val){
            return eval('('+ val +')'); //quick and dirty
        },
        buildMap = {};

    function cacheBust(url){
        url = url.replace(CACHE_BUST_FLAG, '');
        url += (url.indexOf('?') < 0)? '?' : '&';
        return url + CACHE_BUST_QUERY_PARAM +'='+ Math.round(2147483647 * Math.random());
    }

    //API
    return {

        load : function(name, req, onLoad, config) {
            if ( config.isBuild && (config.inlineJSON === false || name.indexOf(CACHE_BUST_QUERY_PARAM +'=') !== -1) ) {
                //avoid inlining cache busted JSON or if inlineJSON:false
                onLoad(null);
            } else {
                text.get(req.toUrl(name), function(data){
                    if (config.isBuild) {
                        buildMap[name] = data;
                        onLoad(data);
                    } else {
                        onLoad(jsonParse(data));
                    }
                });
            }
        },

        normalize : function (name, normalize) {
            //used normalize to avoid caching references to a "cache busted" request
            return (name.indexOf(CACHE_BUST_FLAG) === -1)? name : cacheBust(name);
        },

        //write method based on RequireJS official text plugin by James Burke
        //https://github.com/jrburke/requirejs/blob/master/text.js
        write : function(pluginName, moduleName, write){
            if(moduleName in buildMap){
                var content = buildMap[moduleName];
                write('define("'+ pluginName +'!'+ moduleName +'", function(){ return '+ content +';});\n');
            }
        }

    };
});

define("json!samples/r.json", function(){ return {
 "initial_playback_speed": 2,
 "commands": [
  {
   "type": 2,
   "color": {
    "red": 0,
    "green": 0,
    "blue": 0,
    "alpha": 255
   }
  },
  {
   "type": 3,
   "brush_type": 0,
   "size": 20,
   "opacity": 0.2,
   "spacing": 0.2
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 37
   },
   "time": 1335453187813
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 38
   },
   "time": 1335453187842
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 40
   },
   "time": 1335453187874
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 41
   },
   "time": 1335453187922
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 43
   },
   "time": 1335453187962
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 45
   },
   "time": 1335453188020
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 46
   },
   "time": 1335453188070
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 47
   },
   "time": 1335453188119
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 49
   },
   "time": 1335453188149
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 50
   },
   "time": 1335453188198
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 51
   },
   "time": 1335453188248
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 52
   },
   "time": 1335453188297
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 53
   },
   "time": 1335453188367
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 75
   },
   "time": 1335453189441
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 77
   },
   "time": 1335453189471
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 79
   },
   "time": 1335453189500
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 81
   },
   "time": 1335453189559
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 82
   },
   "time": 1335453189619
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 83
   },
   "time": 1335453189648
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 86
   },
   "time": 1335453189698
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 89
   },
   "time": 1335453189750
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 90
   },
   "time": 1335453189787
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 92
   },
   "time": 1335453189846
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 95
   },
   "time": 1335453189888
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 121
   },
   "time": 1335453190717
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 125
   },
   "time": 1335453190770
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 127
   },
   "time": 1335453190837
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 128
   },
   "time": 1335453190886
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 129
   },
   "time": 1335453190936
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 130
   },
   "time": 1335453190985
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 131
   },
   "time": 1335453191035
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 133
   },
   "time": 1335453191064
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 134
   },
   "time": 1335453191104
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 135
   },
   "time": 1335453191144
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 139
   },
   "time": 1335453191177
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 142
   },
   "time": 1335453191252
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 144
   },
   "time": 1335453191302
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 145
   },
   "time": 1335453191342
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 58,
    "y": 170
   },
   "time": 1335453192113
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 174
   },
   "time": 1335453192161
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 176
   },
   "time": 1335453192191
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 180
   },
   "time": 1335453192225
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 183
   },
   "time": 1335453192254
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 185
   },
   "time": 1335453192300
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 186
   },
   "time": 1335453192359
  },
  {
   "type": 0,
   "pos": {
    "x": 60,
    "y": 186
   },
   "time": 1335453192389
  },
  {
   "type": 0,
   "pos": {
    "x": 60,
    "y": 188
   },
   "time": 1335453192468
  },
  {
   "type": 0,
   "pos": {
    "x": 60,
    "y": 189
   },
   "time": 1335453192537
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 60,
    "y": 213
   },
   "time": 1335453193790
  },
  {
   "type": 0,
   "pos": {
    "x": 60,
    "y": 214
   },
   "time": 1335453193817
  },
  {
   "type": 0,
   "pos": {
    "x": 60,
    "y": 216
   },
   "time": 1335453193857
  },
  {
   "type": 0,
   "pos": {
    "x": 61,
    "y": 219
   },
   "time": 1335453193888
  },
  {
   "type": 0,
   "pos": {
    "x": 61,
    "y": 220
   },
   "time": 1335453193942
  },
  {
   "type": 0,
   "pos": {
    "x": 61,
    "y": 221
   },
   "time": 1335453194001
  },
  {
   "type": 0,
   "pos": {
    "x": 61,
    "y": 222
   },
   "time": 1335453194051
  },
  {
   "type": 0,
   "pos": {
    "x": 61,
    "y": 223
   },
   "time": 1335453194100
  },
  {
   "type": 0,
   "pos": {
    "x": 61,
    "y": 226
   },
   "time": 1335453194140
  },
  {
   "type": 0,
   "pos": {
    "x": 61,
    "y": 227
   },
   "time": 1335453194199
  },
  {
   "type": 0,
   "pos": {
    "x": 61,
    "y": 229
   },
   "time": 1335453194258
  },
  {
   "type": 0,
   "pos": {
    "x": 61,
    "y": 240
   },
   "time": 1335453194367
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 41,
    "y": 35
   },
   "time": 1335453196405
  },
  {
   "type": 0,
   "pos": {
    "x": 43,
    "y": 35
   },
   "time": 1335453196436
  },
  {
   "type": 0,
   "pos": {
    "x": 45,
    "y": 35
   },
   "time": 1335453196465
  },
  {
   "type": 0,
   "pos": {
    "x": 46,
    "y": 35
   },
   "time": 1335453196504
  },
  {
   "type": 0,
   "pos": {
    "x": 48,
    "y": 35
   },
   "time": 1335453196537
  },
  {
   "type": 0,
   "pos": {
    "x": 49,
    "y": 35
   },
   "time": 1335453196594
  },
  {
   "type": 0,
   "pos": {
    "x": 50,
    "y": 35
   },
   "time": 1335453196634
  },
  {
   "type": 0,
   "pos": {
    "x": 51,
    "y": 35
   },
   "time": 1335453196667
  },
  {
   "type": 0,
   "pos": {
    "x": 53,
    "y": 35
   },
   "time": 1335453196703
  },
  {
   "type": 0,
   "pos": {
    "x": 56,
    "y": 35
   },
   "time": 1335453196752
  },
  {
   "type": 0,
   "pos": {
    "x": 57,
    "y": 35
   },
   "time": 1335453196802
  },
  {
   "type": 0,
   "pos": {
    "x": 60,
    "y": 35
   },
   "time": 1335453196851
  },
  {
   "type": 0,
   "pos": {
    "x": 62,
    "y": 35
   },
   "time": 1335453196881
  },
  {
   "type": 0,
   "pos": {
    "x": 63,
    "y": 35
   },
   "time": 1335453196911
  },
  {
   "type": 0,
   "pos": {
    "x": 64,
    "y": 35
   },
   "time": 1335453196960
  },
  {
   "type": 0,
   "pos": {
    "x": 65,
    "y": 35
   },
   "time": 1335453197000
  },
  {
   "type": 0,
   "pos": {
    "x": 66,
    "y": 35
   },
   "time": 1335453197059
  },
  {
   "type": 0,
   "pos": {
    "x": 67,
    "y": 35
   },
   "time": 1335453197119
  },
  {
   "type": 0,
   "pos": {
    "x": 68,
    "y": 35
   },
   "time": 1335453197168
  },
  {
   "type": 0,
   "pos": {
    "x": 69,
    "y": 35
   },
   "time": 1335453197218
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 95,
    "y": 35
   },
   "time": 1335453197841
  },
  {
   "type": 0,
   "pos": {
    "x": 97,
    "y": 35
   },
   "time": 1335453197900
  },
  {
   "type": 0,
   "pos": {
    "x": 98,
    "y": 35
   },
   "time": 1335453197949
  },
  {
   "type": 0,
   "pos": {
    "x": 99,
    "y": 35
   },
   "time": 1335453197999
  },
  {
   "type": 0,
   "pos": {
    "x": 101,
    "y": 35
   },
   "time": 1335453198029
  },
  {
   "type": 0,
   "pos": {
    "x": 102,
    "y": 35
   },
   "time": 1335453198062
  },
  {
   "type": 0,
   "pos": {
    "x": 103,
    "y": 35
   },
   "time": 1335453198109
  },
  {
   "type": 0,
   "pos": {
    "x": 104,
    "y": 35
   },
   "time": 1335453198159
  },
  {
   "type": 0,
   "pos": {
    "x": 108,
    "y": 35
   },
   "time": 1335453198198
  },
  {
   "type": 0,
   "pos": {
    "x": 110,
    "y": 35
   },
   "time": 1335453198272
  },
  {
   "type": 0,
   "pos": {
    "x": 111,
    "y": 35
   },
   "time": 1335453198307
  },
  {
   "type": 0,
   "pos": {
    "x": 112,
    "y": 35
   },
   "time": 1335453198356
  },
  {
   "type": 0,
   "pos": {
    "x": 113,
    "y": 35
   },
   "time": 1335453198396
  },
  {
   "type": 0,
   "pos": {
    "x": 114,
    "y": 35
   },
   "time": 1335453198456
  },
  {
   "type": 0,
   "pos": {
    "x": 114,
    "y": 36
   },
   "time": 1335453198485
  },
  {
   "type": 0,
   "pos": {
    "x": 116,
    "y": 36
   },
   "time": 1335453198516
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 138,
    "y": 45
   },
   "time": 1335453199232
  },
  {
   "type": 0,
   "pos": {
    "x": 139,
    "y": 46
   },
   "time": 1335453199281
  },
  {
   "type": 0,
   "pos": {
    "x": 141,
    "y": 47
   },
   "time": 1335453199331
  },
  {
   "type": 0,
   "pos": {
    "x": 143,
    "y": 47
   },
   "time": 1335453199390
  },
  {
   "type": 0,
   "pos": {
    "x": 144,
    "y": 48
   },
   "time": 1335453199440
  },
  {
   "type": 0,
   "pos": {
    "x": 145,
    "y": 48
   },
   "time": 1335453199475
  },
  {
   "type": 0,
   "pos": {
    "x": 146,
    "y": 49
   },
   "time": 1335453199521
  },
  {
   "type": 0,
   "pos": {
    "x": 147,
    "y": 49
   },
   "time": 1335453199558
  },
  {
   "type": 0,
   "pos": {
    "x": 148,
    "y": 50
   },
   "time": 1335453199620
  },
  {
   "type": 0,
   "pos": {
    "x": 149,
    "y": 51
   },
   "time": 1335453199677
  },
  {
   "type": 0,
   "pos": {
    "x": 150,
    "y": 52
   },
   "time": 1335453199726
  },
  {
   "type": 0,
   "pos": {
    "x": 152,
    "y": 52
   },
   "time": 1335453199806
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 164,
    "y": 67
   },
   "time": 1335453200488
  },
  {
   "type": 0,
   "pos": {
    "x": 164,
    "y": 68
   },
   "time": 1335453200513
  },
  {
   "type": 0,
   "pos": {
    "x": 165,
    "y": 68
   },
   "time": 1335453200538
  },
  {
   "type": 0,
   "pos": {
    "x": 165,
    "y": 69
   },
   "time": 1335453200567
  },
  {
   "type": 0,
   "pos": {
    "x": 166,
    "y": 71
   },
   "time": 1335453200635
  },
  {
   "type": 0,
   "pos": {
    "x": 167,
    "y": 72
   },
   "time": 1335453200675
  },
  {
   "type": 0,
   "pos": {
    "x": 168,
    "y": 73
   },
   "time": 1335453200710
  },
  {
   "type": 0,
   "pos": {
    "x": 168,
    "y": 74
   },
   "time": 1335453200769
  },
  {
   "type": 0,
   "pos": {
    "x": 169,
    "y": 75
   },
   "time": 1335453200819
  },
  {
   "type": 0,
   "pos": {
    "x": 169,
    "y": 76
   },
   "time": 1335453200878
  },
  {
   "type": 0,
   "pos": {
    "x": 170,
    "y": 77
   },
   "time": 1335453200927
  },
  {
   "type": 0,
   "pos": {
    "x": 170,
    "y": 78
   },
   "time": 1335453200977
  },
  {
   "type": 0,
   "pos": {
    "x": 171,
    "y": 79
   },
   "time": 1335453201036
  },
  {
   "type": 0,
   "pos": {
    "x": 171,
    "y": 80
   },
   "time": 1335453201096
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 170,
    "y": 96
   },
   "time": 1335453201705
  },
  {
   "type": 0,
   "pos": {
    "x": 170,
    "y": 97
   },
   "time": 1335453201752
  },
  {
   "type": 0,
   "pos": {
    "x": 170,
    "y": 98
   },
   "time": 1335453201801
  },
  {
   "type": 0,
   "pos": {
    "x": 170,
    "y": 100
   },
   "time": 1335453201831
  },
  {
   "type": 0,
   "pos": {
    "x": 170,
    "y": 102
   },
   "time": 1335453201862
  },
  {
   "type": 0,
   "pos": {
    "x": 170,
    "y": 103
   },
   "time": 1335453201910
  },
  {
   "type": 0,
   "pos": {
    "x": 170,
    "y": 104
   },
   "time": 1335453201959
  },
  {
   "type": 0,
   "pos": {
    "x": 169,
    "y": 107
   },
   "time": 1335453201999
  },
  {
   "type": 0,
   "pos": {
    "x": 169,
    "y": 109
   },
   "time": 1335453202024
  },
  {
   "type": 0,
   "pos": {
    "x": 168,
    "y": 111
   },
   "time": 1335453202064
  },
  {
   "type": 0,
   "pos": {
    "x": 168,
    "y": 112
   },
   "time": 1335453202108
  },
  {
   "type": 0,
   "pos": {
    "x": 167,
    "y": 114
   },
   "time": 1335453202179
  },
  {
   "type": 0,
   "pos": {
    "x": 167,
    "y": 115
   },
   "time": 1335453202236
  },
  {
   "type": 0,
   "pos": {
    "x": 166,
    "y": 115
   },
   "time": 1335453202286
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 155,
    "y": 130
   },
   "time": 1335453202880
  },
  {
   "type": 0,
   "pos": {
    "x": 154,
    "y": 132
   },
   "time": 1335453202911
  },
  {
   "type": 0,
   "pos": {
    "x": 153,
    "y": 132
   },
   "time": 1335453202948
  },
  {
   "type": 0,
   "pos": {
    "x": 152,
    "y": 134
   },
   "time": 1335453202979
  },
  {
   "type": 0,
   "pos": {
    "x": 151,
    "y": 134
   },
   "time": 1335453203028
  },
  {
   "type": 0,
   "pos": {
    "x": 150,
    "y": 136
   },
   "time": 1335453203070
  },
  {
   "type": 0,
   "pos": {
    "x": 149,
    "y": 137
   },
   "time": 1335453203128
  },
  {
   "type": 0,
   "pos": {
    "x": 147,
    "y": 138
   },
   "time": 1335453203208
  },
  {
   "type": 0,
   "pos": {
    "x": 146,
    "y": 139
   },
   "time": 1335453203265
  },
  {
   "type": 0,
   "pos": {
    "x": 144,
    "y": 140
   },
   "time": 1335453203295
  },
  {
   "type": 0,
   "pos": {
    "x": 143,
    "y": 141
   },
   "time": 1335453203335
  },
  {
   "type": 0,
   "pos": {
    "x": 142,
    "y": 141
   },
   "time": 1335453203394
  },
  {
   "type": 0,
   "pos": {
    "x": 139,
    "y": 144
   },
   "time": 1335453203426
  },
  {
   "type": 0,
   "pos": {
    "x": 138,
    "y": 144
   },
   "time": 1335453203477
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 113,
    "y": 150
   },
   "time": 1335453204341
  },
  {
   "type": 0,
   "pos": {
    "x": 112,
    "y": 150
   },
   "time": 1335453204388
  },
  {
   "type": 0,
   "pos": {
    "x": 110,
    "y": 151
   },
   "time": 1335453204458
  },
  {
   "type": 0,
   "pos": {
    "x": 109,
    "y": 151
   },
   "time": 1335453204498
  },
  {
   "type": 0,
   "pos": {
    "x": 107,
    "y": 152
   },
   "time": 1335453204557
  },
  {
   "type": 0,
   "pos": {
    "x": 105,
    "y": 152
   },
   "time": 1335453204606
  },
  {
   "type": 0,
   "pos": {
    "x": 104,
    "y": 153
   },
   "time": 1335453204660
  },
  {
   "type": 0,
   "pos": {
    "x": 101,
    "y": 153
   },
   "time": 1335453204725
  },
  {
   "type": 0,
   "pos": {
    "x": 98,
    "y": 154
   },
   "time": 1335453204796
  },
  {
   "type": 0,
   "pos": {
    "x": 97,
    "y": 154
   },
   "time": 1335453204845
  },
  {
   "type": 0,
   "pos": {
    "x": 96,
    "y": 154
   },
   "time": 1335453204895
  },
  {
   "type": 0,
   "pos": {
    "x": 95,
    "y": 154
   },
   "time": 1335453204954
  },
  {
   "type": 0,
   "pos": {
    "x": 94,
    "y": 154
   },
   "time": 1335453205003
  },
  {
   "type": 0,
   "pos": {
    "x": 93,
    "y": 155
   },
   "time": 1335453205053
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 70,
    "y": 159
   },
   "time": 1335453205679
  },
  {
   "type": 0,
   "pos": {
    "x": 69,
    "y": 159
   },
   "time": 1335453205716
  },
  {
   "type": 0,
   "pos": {
    "x": 67,
    "y": 160
   },
   "time": 1335453205765
  },
  {
   "type": 0,
   "pos": {
    "x": 65,
    "y": 160
   },
   "time": 1335453205808
  },
  {
   "type": 0,
   "pos": {
    "x": 63,
    "y": 160
   },
   "time": 1335453205864
  },
  {
   "type": 0,
   "pos": {
    "x": 62,
    "y": 160
   },
   "time": 1335453205913
  },
  {
   "type": 0,
   "pos": {
    "x": 60,
    "y": 161
   },
   "time": 1335453205963
  },
  {
   "type": 0,
   "pos": {
    "x": 59,
    "y": 161
   },
   "time": 1335453205993
  },
  {
   "type": 0,
   "pos": {
    "x": 56,
    "y": 161
   },
   "time": 1335453206061
  },
  {
   "type": 0,
   "pos": {
    "x": 55,
    "y": 161
   },
   "time": 1335453206111
  },
  {
   "type": 0,
   "pos": {
    "x": 54,
    "y": 161
   },
   "time": 1335453206161
  },
  {
   "type": 0,
   "pos": {
    "x": 53,
    "y": 161
   },
   "time": 1335453206210
  },
  {
   "type": 0,
   "pos": {
    "x": 52,
    "y": 161
   },
   "time": 1335453206259
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 128,
    "y": 160
   },
   "time": 1335453207655
  },
  {
   "type": 0,
   "pos": {
    "x": 128,
    "y": 161
   },
   "time": 1335453207705
  },
  {
   "type": 0,
   "pos": {
    "x": 129,
    "y": 162
   },
   "time": 1335453207734
  },
  {
   "type": 0,
   "pos": {
    "x": 130,
    "y": 162
   },
   "time": 1335453207784
  },
  {
   "type": 0,
   "pos": {
    "x": 130,
    "y": 163
   },
   "time": 1335453207811
  },
  {
   "type": 0,
   "pos": {
    "x": 131,
    "y": 164
   },
   "time": 1335453207850
  },
  {
   "type": 0,
   "pos": {
    "x": 131,
    "y": 165
   },
   "time": 1335453207882
  },
  {
   "type": 0,
   "pos": {
    "x": 132,
    "y": 166
   },
   "time": 1335453207908
  },
  {
   "type": 0,
   "pos": {
    "x": 133,
    "y": 167
   },
   "time": 1335453207936
  },
  {
   "type": 0,
   "pos": {
    "x": 134,
    "y": 168
   },
   "time": 1335453207969
  },
  {
   "type": 0,
   "pos": {
    "x": 134,
    "y": 169
   },
   "time": 1335453207995
  },
  {
   "type": 0,
   "pos": {
    "x": 135,
    "y": 170
   },
   "time": 1335453208029
  },
  {
   "type": 0,
   "pos": {
    "x": 135,
    "y": 171
   },
   "time": 1335453208066
  },
  {
   "type": 0,
   "pos": {
    "x": 136,
    "y": 172
   },
   "time": 1335453208114
  },
  {
   "type": 0,
   "pos": {
    "x": 137,
    "y": 172
   },
   "time": 1335453208164
  },
  {
   "type": 0,
   "pos": {
    "x": 137,
    "y": 174
   },
   "time": 1335453208253
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 154,
    "y": 192
   },
   "time": 1335453208970
  },
  {
   "type": 0,
   "pos": {
    "x": 155,
    "y": 194
   },
   "time": 1335453208998
  },
  {
   "type": 0,
   "pos": {
    "x": 155,
    "y": 195
   },
   "time": 1335453209047
  },
  {
   "type": 0,
   "pos": {
    "x": 156,
    "y": 197
   },
   "time": 1335453209097
  },
  {
   "type": 0,
   "pos": {
    "x": 157,
    "y": 198
   },
   "time": 1335453209136
  },
  {
   "type": 0,
   "pos": {
    "x": 158,
    "y": 199
   },
   "time": 1335453209174
  },
  {
   "type": 0,
   "pos": {
    "x": 158,
    "y": 200
   },
   "time": 1335453209206
  },
  {
   "type": 0,
   "pos": {
    "x": 159,
    "y": 200
   },
   "time": 1335453209255
  },
  {
   "type": 0,
   "pos": {
    "x": 159,
    "y": 202
   },
   "time": 1335453209325
  },
  {
   "type": 0,
   "pos": {
    "x": 160,
    "y": 202
   },
   "time": 1335453209357
  },
  {
   "type": 0,
   "pos": {
    "x": 160,
    "y": 203
   },
   "time": 1335453209383
  },
  {
   "type": 0,
   "pos": {
    "x": 161,
    "y": 204
   },
   "time": 1335453209413
  },
  {
   "type": 0,
   "pos": {
    "x": 161,
    "y": 205
   },
   "time": 1335453209446
  },
  {
   "type": 0,
   "pos": {
    "x": 162,
    "y": 205
   },
   "time": 1335453209493
  },
  {
   "type": 0,
   "pos": {
    "x": 162,
    "y": 206
   },
   "time": 1335453209523
  },
  {
   "type": 0,
   "pos": {
    "x": 163,
    "y": 206
   },
   "time": 1335453209572
  },
  {
   "type": 1
  },
  {
   "type": 4,
   "layer": 0
  },
  {
   "type": 0,
   "pos": {
    "x": 175,
    "y": 222
   },
   "time": 1335453210316
  },
  {
   "type": 0,
   "pos": {
    "x": 176,
    "y": 223
   },
   "time": 1335453210360
  },
  {
   "type": 0,
   "pos": {
    "x": 177,
    "y": 225
   },
   "time": 1335453210389
  },
  {
   "type": 0,
   "pos": {
    "x": 177,
    "y": 226
   },
   "time": 1335453210428
  },
  {
   "type": 0,
   "pos": {
    "x": 178,
    "y": 228
   },
   "time": 1335453210478
  },
  {
   "type": 0,
   "pos": {
    "x": 179,
    "y": 228
   },
   "time": 1335453210524
  },
  {
   "type": 0,
   "pos": {
    "x": 180,
    "y": 230
   },
   "time": 1335453210563
  },
  {
   "type": 0,
   "pos": {
    "x": 180,
    "y": 232
   },
   "time": 1335453210638
  },
  {
   "type": 0,
   "pos": {
    "x": 181,
    "y": 233
   },
   "time": 1335453210690
  },
  {
   "type": 0,
   "pos": {
    "x": 182,
    "y": 233
   },
   "time": 1335453210740
  },
  {
   "type": 0,
   "pos": {
    "x": 182,
    "y": 235
   },
   "time": 1335453210833
  },
  {
   "type": 1
  },
  {
   "type": 2,
   "color": {
    "red": 0,
    "green": 0,
    "blue": 255,
    "alpha": 255
   }
  },
  {
   "type": 3,
   "brush_type": 0,
   "size": 20,
   "opacity": 0.8,
   "spacing": 0.2
  }
 ],
 "end": 256,
 "nlayers": 1,
 "width": 1114,
 "height": 411,
 "pixelRatio": 1,
 "checkpoints": []
}
;});
