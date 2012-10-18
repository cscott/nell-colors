
/**
 * @license RequireJS domReady 2.0.1 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/domReady for details
 */
/*jslint */
/*global require: false, define: false, requirejs: false,
  window: false, clearInterval: false, document: false,
  self: false, setInterval: false */


define('domReady',[],function () {
    

    var isTop, testDiv, scrollIntervalId,
        isBrowser = typeof window !== "undefined" && window.document,
        isPageLoaded = !isBrowser,
        doc = isBrowser ? document : null,
        readyCalls = [];

    function runCallbacks(callbacks) {
        var i;
        for (i = 0; i < callbacks.length; i += 1) {
            callbacks[i](doc);
        }
    }

    function callReady() {
        var callbacks = readyCalls;

        if (isPageLoaded) {
            //Call the DOM ready callbacks
            if (callbacks.length) {
                readyCalls = [];
                runCallbacks(callbacks);
            }
        }
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

            testDiv = document.createElement('div');
            try {
                isTop = window.frameElement === null;
            } catch (e) {}

            //DOMContentLoaded approximation that uses a doScroll, as found by
            //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
            //but modified by other contributors, including jdalton
            if (testDiv.doScroll && isTop && window.external) {
                scrollIntervalId = setInterval(function () {
                    try {
                        testDiv.doScroll();
                        pageLoaded();
                    } catch (e) {}
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners. Latest webkit browsers also use "interactive", and
        //will fire the onDOMContentLoaded before "interactive" but not after
        //entering "interactive" or "complete". More details:
        //http://dev.w3.org/html5/spec/the-end.html#the-end
        //http://stackoverflow.com/questions/3665561/document-readystate-of-interactive-vs-ondomcontentloaded
        //Hmm, this is more complicated on further use, see "firing too early"
        //bug: https://github.com/requirejs/domReady/issues/1
        //so removing the || document.readyState === "interactive" test.
        //There is still a window.onload binding that should get fired if
        //DOMContentLoaded is missed.
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

    domReady.version = '2.0.1';

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
    var BrushTypes = ['hard', 'medium', 'rough fine', 'rough coarse',
                      'soft', 'dots small', 'dots large', 'rect', 'hlines',
                      'sticks', 'splotch', 'splotches coarse'];
    // map name to index and vice versa
    BrushTypes.forEach(function(type, idx) {
        BrushTypes[type] = idx;
    });
    // default brush spacings
    var BrushSpacing = {
        hard: 0.22,
        medium: 0.06,
        'rough fine': 0.09,
        'rough coarse': 0.20,
        soft: 0.11,
        'dots small': 0.67,
        'dots large': 1.00,
        rect: 0.12,
        hlines: 0.10,
        sticks: 0.19,
        splotch: 0.25,
        'splotches coarse': 0.23
    };
    // per-stamp brush rotation, in radians
    // using rationals for rotation amount means period is infinite.
    var BrushRotation = {
        'rough fine': 0.5,
        'rough coarse': 0.5,
        sticks: 0.66,
        splotch: 0.6,
        'splotches coarse': 1.2
    };
    // brush rotation following path tangent
    var BrushFollowTangent = {
        rect: true,
        hlines: true
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
        this.opacity = (typeof(opacity)==='number') ? opacity : 1.0;
        this.spacing = spacing || 0.225; // fraction of brush size
        return this; // fluent api
    };

    Brush.prototype.set_from_brush = function(brush) {
        return this.set(brush.color, brush.type, brush.size, brush.opacity,
                        brush.spacing);
    };

    Brush.prototype.setToDefaultSpacing = function() {
        this.spacing = BrushSpacing[this.type] || 0.05;
        return this; // fluent api
    };

    Brush.prototype.rotationIncrement = function() {
        return BrushRotation[this.type] || 0;
    };

    Brush.prototype.followsTangent = function() {
        return !!(BrushFollowTangent[this.type]);
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

/**
 * @license RequireJS text 2.0.3 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false, location: false */

define('text',['module'], function (module) {
    

    var text, fs,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = [],
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.3',

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
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
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

            return xhr;
        },

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
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
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

            masterConfig.isBuild = config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName + '.' + parsed.ext,
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
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

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node)) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback) {
            var file = fs.readFileSync(url, 'utf8');
            //Remove BOM (Byte Mark Order) from utf8 files if it is there.
            if (file.indexOf('\uFEFF') === 0) {
                file = file.substring(1);
            }
            callback(file);
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback) {
            var xhr = text.createXhr();
            xhr.open('GET', url, true);

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        callback(xhr.responseText);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
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
    }

    return text;
});

define('text!src/brushdialog.html',[],function () { return '<!-- this is innerHTML for a wrapper div -->\n    <div class="page_select">\n      <a class="color_select" href="#"><span></span></a><!--\n      --><a class="brush_select" href="#"><span></span></a>\n    </div>\n    <div class="panes">\n      <div class="color_options">\n        <div class="swatches">\n             <a href="#" class="white"><span></span></a><!--\n          --><a href="#" class="old"><span></span></a><!--\n          --><a          class="new" tabindex="-1"><span></span></a><!--\n          --><a href="#" class="black"><span></span></a>\n        </div>\n        <div class="wheel">\n          <div class="color" tabindex="0">\n            <div class="white"></div>\n            <div class="black"></div>\n          </div>\n          <div class="thumb"></div>\n          <input type="hidden" class="color_hue" />\n          <input type="hidden" class="color_saturation" />\n        </div>\n        <div class="lightness">\n          <input class="color_lightness" type="hidden" />\n        </div>\n      </div>\n      <div class="brush_options">\n        <div class="stroke"></div>\n        <div class="shape" tabindex="0"><div class="scrollwrapper"><div class="allbrushes"></div></div></div>\n        <div class="spacing">\n          <div class="caption" data-amount="1"></div>\n          <a class="minus" href="#" tabindex="-1"></a><input class="brush_spacing" type="hidden" /><a class="plus" href="#" tabindex="-1"></a>\n        </div>\n        <div class="size">\n          <div class="caption" data-amount="1"></div>\n          <a class="minus" href="#" tabindex="-1"></a><input class="brush_size" type="hidden" /><a class="plus" href="#" tabindex="-1"></a>\n        </div>\n      </div>\n    </div>\n    <div class="spacer"></div>\n    <div class="opacity_options">\n     <input class="color_opacity" type="hidden" />\n    </div>\n    <div class="close_pane">\n      <a class="closer" href="#"></a>\n    </div>\n    <input type="hidden" class="old_color_hue" />\n    <input type="hidden" class="old_color_saturation" />\n    <input type="hidden" class="old_color_lightness"  />\n    <input type="hidden" class="old_color_opacity"  />\n';});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/coords',[], function() {
    
    /** Utility functions to find absolute and relative coordinates for
     *  DOM elements and mouse/touch events.
     */

// return the absolute position of the given element on the page.
var getAbsolutePosition = function(element) {
     if (element.getBoundingClientRect) {
      // roughly, ".offset()" from zepto.js
      var obj = element.getBoundingClientRect();
      return {
        x: obj.left + document.body.scrollLeft,
        y: obj.top + document.body.scrollTop,
      };
     }
     // this technique is more error-prone: CSS transforms, etc, may cause
     // it to return incorrect results.
     var r = { x: element.offsetLeft, y: element.offsetTop };
     if (element.offsetParent) {
       var tmp = getAbsolutePosition(element.offsetParent);
       r.x += tmp.x;
       r.y += tmp.y;
     }
     return r;
};

/**
 * Retrieve the coordinates of the given event relative to a given widget.
 *
 * @param event
 *   A mouse- or touch-related DOM event.
 * @param reference
 *   A DOM element whose position we want to transform the mouse coordinates to.
 * @return
 *    A hash containing keys 'x' and 'y'.
 */
var getRelativeEventPosition = function(event, reference) {
     var x, y, pos;
     event = event || window.event;
     var el = event.target || event.srcElement;

     if (!window.opera && typeof event.offsetX !== 'undefined') {
       // Use offset coordinates and find common offsetParent
       pos = { x: event.offsetX, y: event.offsetY };

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
       e = reference;
       var offset = { x: 0, y: 0 };
       while (e) {
         if (typeof e.mouseX !== 'undefined') {
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
     } else {
       // Use absolute coordinates
       pos = getAbsolutePosition(reference);
       x = event.pageX  - pos.x;
       y = event.pageY - pos.y;
     }
     return { x: x, y: y };
};

    return {
        getRelativeEventPosition: getRelativeEventPosition,
        getAbsolutePosition: getAbsolutePosition
    };
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/colorwheel',['./color','./coords'], function(Color, Coords) {
    
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

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global
  define:true, console:false, require:false, module:false, window:false,
  Float64Array:false, Uint16Array:false,
  self:false, document:false, DomException:false
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

    // polyfill for classList
    /*
     * classList.js: Cross-browser full element.classList implementation.
     * 2011-06-15
     *
     * By Eli Grey, http://eligrey.com
     * Public Domain.
     * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     */

    /*global self, document, DOMException */

    /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

    if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {

        (function (view) {

            

            if (!('HTMLElement' in view) && !('Element' in view)) return;

            var
	    classListProp = "classList"
	    , protoProp = "prototype"
	    , elemCtrProto = (view.HTMLElement || view.Element)[protoProp]
	    , objCtr = Object
	    , strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	    }
	    , arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
		i = 0
		, len = this.length
		;
		for (; i < len; i++) {
		    if (i in this && this[i] === item) {
			return i;
		    }
		}
		return -1;
	    }
	    // Vendors: please allow content code to instantiate DOMExceptions
	    , DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	    }
	    , checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
		    throw new DOMEx(
			"SYNTAX_ERR"
			, "An invalid or illegal string was specified"
		    );
		}
		if (/\s/.test(token)) {
		    throw new DOMEx(
			"INVALID_CHARACTER_ERR"
			, "String contains an invalid character"
		    );
		}
		return arrIndexOf.call(classList, token);
	    }
	    , ClassList = function (elem) {
		var
		trimmedClasses = strTrim.call(elem.className)
		, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
		, i = 0
		, len = classes.length
		;
		for (; i < len; i++) {
		    this.push(classes[i]);
		}
		this._updateClassName = function () {
		    elem.className = this.toString();
		};
	    }
	    , classListProto = ClassList[protoProp] = []
	    , classListGetter = function () {
		return new ClassList(this);
	    }
            ;
            // Most DOMException implementations don't allow calling DOMException's toString()
            // on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function (i) {
	        return this[i] || null;
            };
            classListProto.contains = function (token) {
	        token += "";
	        return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function (token) {
	        token += "";
	        if (checkTokenAndGetIndex(this, token) === -1) {
		    this.push(token);
		    this._updateClassName();
	        }
            };
            classListProto.remove = function (token) {
	        token += "";
	        var index = checkTokenAndGetIndex(this, token);
	        if (index !== -1) {
		    this.splice(index, 1);
		    this._updateClassName();
	        }
            };
            classListProto.toggle = function (token) {
	        token += "";
	        if (checkTokenAndGetIndex(this, token) === -1) {
		    this.add(token);
	        } else {
		    this.remove(token);
	        }
            };
            classListProto.toString = function () {
	        return this.join(" ");
            };

            if (objCtr.defineProperty) {
	        var classListPropDesc = {
		    get: classListGetter
		    , enumerable: true
		    , configurable: true
	        };
	        try {
		    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	        } catch (ex) { // IE 8 doesn't support enumerable:true
		    if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		    }
	        }
            } else if (objCtr[protoProp].__defineGetter__) {
	        elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }

        }(self));

    }

    return Compat;
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
/*global define:false, console:false */
define('src/hslcolor',['./color'], function(Color) {
    

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

/*!
 * iScroll v4.2.2 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
define('src/iscroll',[], function() { return (function(window, doc) {
var m = Math,
	dummyStyle = doc.createElement('div').style,
	vendor = (function () {
		var vendors = 't,webkitT,MozT,msT,OT'.split(','),
			t,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			t = vendors[i] + 'ransform';
			if ( t in dummyStyle ) {
				return vendors[i].substr(0, vendors[i].length - 1);
			}
		}

		return false;
	})(),
	cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',

	// Style properties
	transform = prefixStyle('transform'),
	transitionProperty = prefixStyle('transitionProperty'),
	transitionDuration = prefixStyle('transitionDuration'),
	transformOrigin = prefixStyle('transformOrigin'),
	transitionTimingFunction = prefixStyle('transitionTimingFunction'),
	transitionDelay = prefixStyle('transitionDelay'),

    // Browser capabilities
	isAndroid = (/android/gi).test(navigator.appVersion),
	isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
	isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

    has3d = prefixStyle('perspective') in dummyStyle,
    hasTouch = 'ontouchstart' in window && !isTouchPad,
    hasTransform = !!vendor,
    hasTransitionEnd = prefixStyle('transition') in dummyStyle,

	RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
	START_EV = hasTouch ? 'touchstart' : 'mousedown',
	MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
	END_EV = hasTouch ? 'touchend' : 'mouseup',
	CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
	WHEEL_EV = vendor == 'Moz' ? 'DOMMouseScroll' : 'mousewheel',
	TRNEND_EV = (function () {
		if ( vendor === false ) return false;

		var transitionEnd = {
				''			: 'transitionend',
				'webkit'	: 'webkitTransitionEnd',
				'Moz'		: 'transitionend',
				'O'			: 'otransitionend',
				'ms'		: 'MSTransitionEnd'
			};

		return transitionEnd[vendor];
	})(),

	nextFrame = (function() {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) { return setTimeout(callback, 1); };
	})(),
	cancelFrame = (function () {
		return window.cancelRequestAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.mozCancelRequestAnimationFrame ||
			window.oCancelRequestAnimationFrame ||
			window.msCancelRequestAnimationFrame ||
			clearTimeout;
	})(),

	// Helpers
	translateZ = has3d ? ' translateZ(0)' : '',

	// Constructor
	iScroll = function (el, options) {
		var that = this,
			i;

		that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
		that.wrapper.style.overflow = 'hidden';
		that.scroller = that.wrapper.children[0];

		// Default options
		that.options = {
			hScroll: true,
			vScroll: true,
			x: 0,
			y: 0,
			bounce: true,
			bounceLock: false,
			momentum: true,
			lockDirection: true,
			useTransform: true,
			useTransition: false,
			topOffset: 0,
			checkDOMChanges: false,		// Experimental
			handleClick: true,

			// Scrollbar
			hScrollbar: true,
			vScrollbar: true,
			fixedScrollbar: isAndroid,
			hideScrollbar: isIDevice,
			fadeScrollbar: isIDevice && has3d,
			scrollbarClass: '',

			// Zoom
			zoom: false,
			zoomMin: 1,
			zoomMax: 4,
			doubleTapZoom: 2,
			wheelAction: 'scroll',

			// Snap
			snap: false,
			snapThreshold: 1,

			// Events
			onRefresh: null,
			onBeforeScrollStart: function (e) { e.preventDefault(); },
			onScrollStart: null,
			onBeforeScrollMove: null,
			onScrollMove: null,
			onBeforeScrollEnd: null,
			onScrollEnd: null,
			onTouchEnd: null,
			onDestroy: null,
			onZoomStart: null,
			onZoom: null,
			onZoomEnd: null
		};

		// User defined options
		for (i in options) that.options[i] = options[i];
		
		// Set starting position
		that.x = that.options.x;
		that.y = that.options.y;

		// Normalize options
		that.options.useTransform = hasTransform && that.options.useTransform;
		that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
		that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
		that.options.zoom = that.options.useTransform && that.options.zoom;
		that.options.useTransition = hasTransitionEnd && that.options.useTransition;

		// Helpers FIX ANDROID BUG!
		// translate3d and scale doesn't work together!
		// Ignoring 3d ONLY WHEN YOU SET that.options.zoom
		if ( that.options.zoom && isAndroid ){
			translateZ = '';
		}
		
		// Set some default styles
		that.scroller.style[transitionProperty] = that.options.useTransform ? cssVendor + 'transform' : 'top left';
		that.scroller.style[transitionDuration] = '0';
		that.scroller.style[transformOrigin] = '0 0';
		if (that.options.useTransition) that.scroller.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
		
		if (that.options.useTransform) that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px)' + translateZ;
		else that.scroller.style.cssText += ';position:absolute;top:' + that.y + 'px;left:' + that.x + 'px';

		if (that.options.useTransition) that.options.fixedScrollbar = true;

		that.refresh();

		that._bind(RESIZE_EV, window);
		that._bind(START_EV);
		if (!hasTouch) {
			if (that.options.wheelAction != 'none')
				that._bind(WHEEL_EV);
		}

		if (that.options.checkDOMChanges) that.checkDOMTime = setInterval(function () {
			that._checkDOMChanges();
		}, 500);
	};

// Prototype
iScroll.prototype = {
	enabled: true,
	x: 0,
	y: 0,
	steps: [],
	scale: 1,
	currPageX: 0, currPageY: 0,
	pagesX: [], pagesY: [],
	aniTime: null,
	wheelZoomCount: 0,
	
	handleEvent: function (e) {
		var that = this;
		switch(e.type) {
			case START_EV:
				if (!hasTouch && e.button !== 0) return;
				that._start(e);
				break;
			case MOVE_EV: that._move(e); break;
			case END_EV:
			case CANCEL_EV: that._end(e); break;
			case RESIZE_EV: that._resize(); break;
			case WHEEL_EV: that._wheel(e); break;
			case TRNEND_EV: that._transitionEnd(e); break;
		}
	},
	
	_checkDOMChanges: function () {
		if (this.moved || this.zoomed || this.animating ||
			(this.scrollerW == this.scroller.offsetWidth * this.scale && this.scrollerH == this.scroller.offsetHeight * this.scale)) return;

		this.refresh();
	},
	
	_scrollbar: function (dir) {
		var that = this,
			bar;

		if (!that[dir + 'Scrollbar']) {
			if (that[dir + 'ScrollbarWrapper']) {
				if (hasTransform) that[dir + 'ScrollbarIndicator'].style[transform] = '';
				that[dir + 'ScrollbarWrapper'].parentNode.removeChild(that[dir + 'ScrollbarWrapper']);
				that[dir + 'ScrollbarWrapper'] = null;
				that[dir + 'ScrollbarIndicator'] = null;
			}

			return;
		}

		if (!that[dir + 'ScrollbarWrapper']) {
			// Create the scrollbar wrapper
			bar = doc.createElement('div');

			if (that.options.scrollbarClass) bar.className = that.options.scrollbarClass + dir.toUpperCase();
			else bar.style.cssText = 'position:absolute;z-index:100;' + (dir == 'h' ? 'height:7px;bottom:1px;left:2px;right:' + (that.vScrollbar ? '7' : '2') + 'px' : 'width:7px;bottom:' + (that.hScrollbar ? '7' : '2') + 'px;top:2px;right:1px');

			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:opacity;' + cssVendor + 'transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:' + (that.options.hideScrollbar ? '0' : '1');

			that.wrapper.appendChild(bar);
			that[dir + 'ScrollbarWrapper'] = bar;

			// Create the scrollbar indicator
			bar = doc.createElement('div');
			if (!that.options.scrollbarClass) {
				bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);' + cssVendor + 'background-clip:padding-box;' + cssVendor + 'box-sizing:border-box;' + (dir == 'h' ? 'height:100%' : 'width:100%') + ';' + cssVendor + 'border-radius:3px;border-radius:3px';
			}
			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:' + cssVendor + 'transform;' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform: translate(0,0)' + translateZ;
			if (that.options.useTransition) bar.style.cssText += ';' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1)';

			that[dir + 'ScrollbarWrapper'].appendChild(bar);
			that[dir + 'ScrollbarIndicator'] = bar;
		}

		if (dir == 'h') {
			that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
			that.hScrollbarIndicatorSize = m.max(m.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
			that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
			that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
			that.hScrollbarProp = that.hScrollbarMaxScroll / that.maxScrollX;
		} else {
			that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
			that.vScrollbarIndicatorSize = m.max(m.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
			that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
			that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
			that.vScrollbarProp = that.vScrollbarMaxScroll / that.maxScrollY;
		}

		// Reset position
		that._scrollbarPos(dir, true);
	},
	
	_resize: function () {
		var that = this;
		setTimeout(function () { that.refresh(); }, isAndroid ? 200 : 0);
	},
	
	_pos: function (x, y) {
		if (this.zoomed) return;

		x = this.hScroll ? x : 0;
		y = this.vScroll ? y : 0;

		if (this.options.useTransform) {
			this.scroller.style[transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ')' + translateZ;
		} else {
			x = m.round(x);
			y = m.round(y);
			this.scroller.style.left = x + 'px';
			this.scroller.style.top = y + 'px';
		}

		this.x = x;
		this.y = y;

		this._scrollbarPos('h');
		this._scrollbarPos('v');
	},

	_scrollbarPos: function (dir, hidden) {
		var that = this,
			pos = dir == 'h' ? that.x : that.y,
			size;

		if (!that[dir + 'Scrollbar']) return;

		pos = that[dir + 'ScrollbarProp'] * pos;

		if (pos < 0) {
			if (!that.options.fixedScrollbar) {
				size = that[dir + 'ScrollbarIndicatorSize'] + m.round(pos * 3);
				if (size < 8) size = 8;
				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
			}
			pos = 0;
		} else if (pos > that[dir + 'ScrollbarMaxScroll']) {
			if (!that.options.fixedScrollbar) {
				size = that[dir + 'ScrollbarIndicatorSize'] - m.round((pos - that[dir + 'ScrollbarMaxScroll']) * 3);
				if (size < 8) size = 8;
				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
				pos = that[dir + 'ScrollbarMaxScroll'] + (that[dir + 'ScrollbarIndicatorSize'] - size);
			} else {
				pos = that[dir + 'ScrollbarMaxScroll'];
			}
		}

		that[dir + 'ScrollbarWrapper'].style[transitionDelay] = '0';
		that[dir + 'ScrollbarWrapper'].style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
		that[dir + 'ScrollbarIndicator'].style[transform] = 'translate(' + (dir == 'h' ? pos + 'px,0)' : '0,' + pos + 'px)') + translateZ;
	},
	
	_start: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e,
			matrix, x, y,
			c1, c2;

		if (!that.enabled) return;

		if (that.options.onBeforeScrollStart) that.options.onBeforeScrollStart.call(that, e);

		if (that.options.useTransition || that.options.zoom) that._transitionTime(0);

		that.moved = false;
		that.animating = false;
		that.zoomed = false;
		that.distX = 0;
		that.distY = 0;
		that.absDistX = 0;
		that.absDistY = 0;
		that.dirX = 0;
		that.dirY = 0;

		// Gesture start
		if (that.options.zoom && hasTouch && e.touches.length > 1) {
			c1 = m.abs(e.touches[0].pageX-e.touches[1].pageX);
			c2 = m.abs(e.touches[0].pageY-e.touches[1].pageY);
			that.touchesDistStart = m.sqrt(c1 * c1 + c2 * c2);

			that.originX = m.abs(e.touches[0].pageX + e.touches[1].pageX - that.wrapperOffsetLeft * 2) / 2 - that.x;
			that.originY = m.abs(e.touches[0].pageY + e.touches[1].pageY - that.wrapperOffsetTop * 2) / 2 - that.y;

			if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
		}

		if (that.options.momentum) {
			if (that.options.useTransform) {
				// Very lame general purpose alternative to CSSMatrix
				matrix = getComputedStyle(that.scroller, null)[transform].replace(/[^0-9\-.,]/g, '').split(',');
				x = +matrix[4];
				y = +matrix[5];
			} else {
				x = +getComputedStyle(that.scroller, null).left.replace(/[^0-9-]/g, '');
				y = +getComputedStyle(that.scroller, null).top.replace(/[^0-9-]/g, '');
			}
			
			if (x != that.x || y != that.y) {
				if (that.options.useTransition) that._unbind(TRNEND_EV);
				else cancelFrame(that.aniTime);
				that.steps = [];
				that._pos(x, y);
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);
			}
		}

		that.absStartX = that.x;	// Needed by snap threshold
		that.absStartY = that.y;

		that.startX = that.x;
		that.startY = that.y;
		that.pointX = point.pageX;
		that.pointY = point.pageY;

		that.startTime = e.timeStamp || Date.now();

		if (that.options.onScrollStart) that.options.onScrollStart.call(that, e);

		that._bind(MOVE_EV, window);
		that._bind(END_EV, window);
		that._bind(CANCEL_EV, window);
	},
	
	_move: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e,
			deltaX = point.pageX - that.pointX,
			deltaY = point.pageY - that.pointY,
			newX = that.x + deltaX,
			newY = that.y + deltaY,
			c1, c2, scale,
			timestamp = e.timeStamp || Date.now();

		if (that.options.onBeforeScrollMove) that.options.onBeforeScrollMove.call(that, e);

		// Zoom
		if (that.options.zoom && hasTouch && e.touches.length > 1) {
			c1 = m.abs(e.touches[0].pageX - e.touches[1].pageX);
			c2 = m.abs(e.touches[0].pageY - e.touches[1].pageY);
			that.touchesDist = m.sqrt(c1*c1+c2*c2);

			that.zoomed = true;

			scale = 1 / that.touchesDistStart * that.touchesDist * this.scale;

			if (scale < that.options.zoomMin) scale = 0.5 * that.options.zoomMin * Math.pow(2.0, scale / that.options.zoomMin);
			else if (scale > that.options.zoomMax) scale = 2.0 * that.options.zoomMax * Math.pow(0.5, that.options.zoomMax / scale);

			that.lastScale = scale / this.scale;

			newX = this.originX - this.originX * that.lastScale + this.x,
			newY = this.originY - this.originY * that.lastScale + this.y;

			this.scroller.style[transform] = 'translate(' + newX + 'px,' + newY + 'px) scale(' + scale + ')' + translateZ;

			if (that.options.onZoom) that.options.onZoom.call(that, e);
			return;
		}

		that.pointX = point.pageX;
		that.pointY = point.pageY;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < that.maxScrollX) {
			newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
		}
		if (newY > that.minScrollY || newY < that.maxScrollY) {
			newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= that.minScrollY || that.maxScrollY >= 0 ? that.minScrollY : that.maxScrollY;
		}

		that.distX += deltaX;
		that.distY += deltaY;
		that.absDistX = m.abs(that.distX);
		that.absDistY = m.abs(that.distY);

		if (that.absDistX < 6 && that.absDistY < 6) {
			return;
		}

		// Lock direction
		if (that.options.lockDirection) {
			if (that.absDistX > that.absDistY + 5) {
				newY = that.y;
				deltaY = 0;
			} else if (that.absDistY > that.absDistX + 5) {
				newX = that.x;
				deltaX = 0;
			}
		}

		that.moved = true;
		that._pos(newX, newY);
		that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if (timestamp - that.startTime > 300) {
			that.startTime = timestamp;
			that.startX = that.x;
			that.startY = that.y;
		}
		
		if (that.options.onScrollMove) that.options.onScrollMove.call(that, e);
	},
	
	_end: function (e) {
		if (hasTouch && e.touches.length !== 0) return;

		var that = this,
			point = hasTouch ? e.changedTouches[0] : e,
			target, ev,
			momentumX = { dist:0, time:0 },
			momentumY = { dist:0, time:0 },
			duration = (e.timeStamp || Date.now()) - that.startTime,
			newPosX = that.x,
			newPosY = that.y,
			distX, distY,
			newDuration,
			snap,
			scale;

		that._unbind(MOVE_EV, window);
		that._unbind(END_EV, window);
		that._unbind(CANCEL_EV, window);

		if (that.options.onBeforeScrollEnd) that.options.onBeforeScrollEnd.call(that, e);

		if (that.zoomed) {
			scale = that.scale * that.lastScale;
			scale = Math.max(that.options.zoomMin, scale);
			scale = Math.min(that.options.zoomMax, scale);
			that.lastScale = scale / that.scale;
			that.scale = scale;

			that.x = that.originX - that.originX * that.lastScale + that.x;
			that.y = that.originY - that.originY * that.lastScale + that.y;
			
			that.scroller.style[transitionDuration] = '200ms';
			that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + that.scale + ')' + translateZ;
			
			that.zoomed = false;
			that.refresh();

			if (that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
			return;
		}

		if (!that.moved) {
			if (hasTouch) {
				if (that.doubleTapTimer && that.options.zoom) {
					// Double tapped
					clearTimeout(that.doubleTapTimer);
					that.doubleTapTimer = null;
					if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
					that.zoom(that.pointX, that.pointY, that.scale == 1 ? that.options.doubleTapZoom : 1);
					if (that.options.onZoomEnd) {
						setTimeout(function() {
							that.options.onZoomEnd.call(that, e);
						}, 200); // 200 is default zoom duration
					}
				} else if (this.options.handleClick) {
					that.doubleTapTimer = setTimeout(function () {
						that.doubleTapTimer = null;

						// Find the last touched element
						target = point.target;
						while (target.nodeType != 1) target = target.parentNode;

						if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
							ev = doc.createEvent('MouseEvents');
							ev.initMouseEvent('click', true, true, e.view, 1,
								point.screenX, point.screenY, point.clientX, point.clientY,
								e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
								0, null);
							ev._fake = true;
							target.dispatchEvent(ev);
						}
					}, that.options.zoom ? 250 : 0);
				}
			}

			that._resetPos(400);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		if (duration < 300 && that.options.momentum) {
			momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
			momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y - that.minScrollY : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;

			newPosX = that.x + momentumX.dist;
			newPosY = that.y + momentumY.dist;

			if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
			if ((that.y > that.minScrollY && newPosY > that.minScrollY) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
		}

		if (momentumX.dist || momentumY.dist) {
			newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

			// Do we need to snap?
			if (that.options.snap) {
				distX = newPosX - that.absStartX;
				distY = newPosY - that.absStartY;
				if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) { that.scrollTo(that.absStartX, that.absStartY, 200); }
				else {
					snap = that._snap(newPosX, newPosY);
					newPosX = snap.x;
					newPosY = snap.y;
					newDuration = m.max(snap.time, newDuration);
				}
			}

			that.scrollTo(m.round(newPosX), m.round(newPosY), newDuration);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		// Do we need to snap?
		if (that.options.snap) {
			distX = newPosX - that.absStartX;
			distY = newPosY - that.absStartY;
			if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) that.scrollTo(that.absStartX, that.absStartY, 200);
			else {
				snap = that._snap(that.x, that.y);
				if (snap.x != that.x || snap.y != that.y) that.scrollTo(snap.x, snap.y, snap.time);
			}

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		that._resetPos(200);
		if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
	},
	
	_resetPos: function (time) {
		var that = this,
			resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
			resetY = that.y >= that.minScrollY || that.maxScrollY > 0 ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		if (resetX == that.x && resetY == that.y) {
			if (that.moved) {
				that.moved = false;
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
			}

			if (that.hScrollbar && that.options.hideScrollbar) {
				if (vendor == 'webkit') that.hScrollbarWrapper.style[transitionDelay] = '300ms';
				that.hScrollbarWrapper.style.opacity = '0';
			}
			if (that.vScrollbar && that.options.hideScrollbar) {
				if (vendor == 'webkit') that.vScrollbarWrapper.style[transitionDelay] = '300ms';
				that.vScrollbarWrapper.style.opacity = '0';
			}

			return;
		}

		that.scrollTo(resetX, resetY, time || 0);
	},

	_wheel: function (e) {
		var that = this,
			wheelDeltaX, wheelDeltaY,
			deltaX, deltaY,
			deltaScale;

		if ('wheelDeltaX' in e) {
			wheelDeltaX = e.wheelDeltaX / 12;
			wheelDeltaY = e.wheelDeltaY / 12;
		} else if('wheelDelta' in e) {
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 12;
		} else if ('detail' in e) {
			wheelDeltaX = wheelDeltaY = -e.detail * 3;
		} else {
			return;
		}
		
		if (that.options.wheelAction == 'zoom') {
			deltaScale = that.scale * Math.pow(2, 1/3 * (wheelDeltaY ? wheelDeltaY / Math.abs(wheelDeltaY) : 0));
			if (deltaScale < that.options.zoomMin) deltaScale = that.options.zoomMin;
			if (deltaScale > that.options.zoomMax) deltaScale = that.options.zoomMax;
			
			if (deltaScale != that.scale) {
				if (!that.wheelZoomCount && that.options.onZoomStart) that.options.onZoomStart.call(that, e);
				that.wheelZoomCount++;
				
				that.zoom(e.pageX, e.pageY, deltaScale, 400);
				
				setTimeout(function() {
					that.wheelZoomCount--;
					if (!that.wheelZoomCount && that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
				}, 400);
			}
			
			return;
		}
		
		deltaX = that.x + wheelDeltaX;
		deltaY = that.y + wheelDeltaY;

		if (deltaX > 0) deltaX = 0;
		else if (deltaX < that.maxScrollX) deltaX = that.maxScrollX;

		if (deltaY > that.minScrollY) deltaY = that.minScrollY;
		else if (deltaY < that.maxScrollY) deltaY = that.maxScrollY;
    
		if (that.maxScrollY < 0) {
			that.scrollTo(deltaX, deltaY, 0);
		}
	},
	
	_transitionEnd: function (e) {
		var that = this;

		if (e.target != that.scroller) return;

		that._unbind(TRNEND_EV);
		
		that._startAni();
	},


	/**
	*
	* Utilities
	*
	*/
	_startAni: function () {
		var that = this,
			startX = that.x, startY = that.y,
			startTime = Date.now(),
			step, easeOut,
			animate;

		if (that.animating) return;
		
		if (!that.steps.length) {
			that._resetPos(400);
			return;
		}
		
		step = that.steps.shift();
		
		if (step.x == startX && step.y == startY) step.time = 0;

		that.animating = true;
		that.moved = true;
		
		if (that.options.useTransition) {
			that._transitionTime(step.time);
			that._pos(step.x, step.y);
			that.animating = false;
			if (step.time) that._bind(TRNEND_EV);
			else that._resetPos(0);
			return;
		}

		animate = function () {
			var now = Date.now(),
				newX, newY;

			if (now >= startTime + step.time) {
				that._pos(step.x, step.y);
				that.animating = false;
				if (that.options.onAnimationEnd) that.options.onAnimationEnd.call(that);			// Execute custom code on animation end
				that._startAni();
				return;
			}

			now = (now - startTime) / step.time - 1;
			easeOut = m.sqrt(1 - now * now);
			newX = (step.x - startX) * easeOut + startX;
			newY = (step.y - startY) * easeOut + startY;
			that._pos(newX, newY);
			if (that.animating) that.aniTime = nextFrame(animate);
		};

		animate();
	},

	_transitionTime: function (time) {
		time += 'ms';
		this.scroller.style[transitionDuration] = time;
		if (this.hScrollbar) this.hScrollbarIndicator.style[transitionDuration] = time;
		if (this.vScrollbar) this.vScrollbarIndicator.style[transitionDuration] = time;
	},

	_momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
		var deceleration = 0.0006,
			speed = m.abs(dist) / time,
			newDist = (speed * speed) / (2 * deceleration),
			newTime = 0, outsideDist = 0;

		// Proportinally reduce speed if we are outside of the boundaries
		if (dist > 0 && newDist > maxDistUpper) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistUpper = maxDistUpper + outsideDist;
			speed = speed * maxDistUpper / newDist;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistLower = maxDistLower + outsideDist;
			speed = speed * maxDistLower / newDist;
			newDist = maxDistLower;
		}

		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: newDist, time: m.round(newTime) };
	},

	_offset: function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;
			
		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}
		
		if (el != this.wrapper) {
			left *= this.scale;
			top *= this.scale;
		}

		return { left: left, top: top };
	},

	_snap: function (x, y) {
		var that = this,
			i, l,
			page, time,
			sizeX, sizeY;

		// Check page X
		page = that.pagesX.length - 1;
		for (i=0, l=that.pagesX.length; i<l; i++) {
			if (x >= that.pagesX[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageX && page > 0 && that.dirX < 0) page--;
		x = that.pagesX[page];
		sizeX = m.abs(x - that.pagesX[that.currPageX]);
		sizeX = sizeX ? m.abs(that.x - x) / sizeX * 500 : 0;
		that.currPageX = page;

		// Check page Y
		page = that.pagesY.length-1;
		for (i=0; i<page; i++) {
			if (y >= that.pagesY[i]) {
				page = i;
				break;
			}
		}
		if (page == that.currPageY && page > 0 && that.dirY < 0) page--;
		y = that.pagesY[page];
		sizeY = m.abs(y - that.pagesY[that.currPageY]);
		sizeY = sizeY ? m.abs(that.y - y) / sizeY * 500 : 0;
		that.currPageY = page;

		// Snap with constant speed (proportional duration)
		time = m.round(m.max(sizeX, sizeY)) || 200;

		return { x: x, y: y, time: time };
	},

	_bind: function (type, el, bubble) {
		(el || this.scroller).addEventListener(type, this, !!bubble);
	},

	_unbind: function (type, el, bubble) {
		(el || this.scroller).removeEventListener(type, this, !!bubble);
	},


	/**
	*
	* Public methods
	*
	*/
	destroy: function () {
		var that = this;

		that.scroller.style[transform] = '';

		// Remove the scrollbars
		that.hScrollbar = false;
		that.vScrollbar = false;
		that._scrollbar('h');
		that._scrollbar('v');

		// Remove the event listeners
		that._unbind(RESIZE_EV, window);
		that._unbind(START_EV);
		that._unbind(MOVE_EV, window);
		that._unbind(END_EV, window);
		that._unbind(CANCEL_EV, window);
		
		if (!that.options.hasTouch) {
			that._unbind(WHEEL_EV);
		}
		
		if (that.options.useTransition) that._unbind(TRNEND_EV);
		
		if (that.options.checkDOMChanges) clearInterval(that.checkDOMTime);
		
		if (that.options.onDestroy) that.options.onDestroy.call(that);
	},

	refresh: function () {
		var that = this,
			offset,
			i, l,
			els,
			pos = 0,
			page = 0;

		if (that.scale < that.options.zoomMin) that.scale = that.options.zoomMin;
		that.wrapperW = that.wrapper.clientWidth || 1;
		that.wrapperH = that.wrapper.clientHeight || 1;

		that.minScrollY = -that.options.topOffset || 0;
		that.scrollerW = m.round(that.scroller.offsetWidth * that.scale);
		that.scrollerH = m.round((that.scroller.offsetHeight + that.minScrollY) * that.scale);
		that.maxScrollX = that.wrapperW - that.scrollerW;
		that.maxScrollY = that.wrapperH - that.scrollerH + that.minScrollY;
		that.dirX = 0;
		that.dirY = 0;

		if (that.options.onRefresh) that.options.onRefresh.call(that);

		that.hScroll = that.options.hScroll && that.maxScrollX < 0;
		that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);

		that.hScrollbar = that.hScroll && that.options.hScrollbar;
		that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

		offset = that._offset(that.wrapper);
		that.wrapperOffsetLeft = -offset.left;
		that.wrapperOffsetTop = -offset.top;

		// Prepare snap
		if (typeof that.options.snap == 'string') {
			that.pagesX = [];
			that.pagesY = [];
			els = that.scroller.querySelectorAll(that.options.snap);
			for (i=0, l=els.length; i<l; i++) {
				pos = that._offset(els[i]);
				pos.left += that.wrapperOffsetLeft;
				pos.top += that.wrapperOffsetTop;
				that.pagesX[i] = pos.left < that.maxScrollX ? that.maxScrollX : pos.left * that.scale;
				that.pagesY[i] = pos.top < that.maxScrollY ? that.maxScrollY : pos.top * that.scale;
			}
                } else if (typeof that.options.snap === 'number') { /*CSA HACK*/
		    that.pagesX = [];
		    while (pos >= that.maxScrollX) {
			that.pagesX[page] = pos;
			pos = pos - that.options.snap;
			page++;
		    }
		    if (that.maxScrollX%that.options.snap) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

		    pos = 0;
		    page = 0;
		    that.pagesY = [];
		    while (pos >= that.maxScrollY) {
			that.pagesY[page] = pos;
			pos = pos - that.options.snap;
			page++;
		    }
		    if (that.maxScrollY%that.options.snap) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];

		} else if (that.options.snap) {
			that.pagesX = [];
			while (pos >= that.maxScrollX) {
				that.pagesX[page] = pos;
				pos = pos - that.wrapperW;
				page++;
			}
			if (that.maxScrollX%that.wrapperW) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

			pos = 0;
			page = 0;
			that.pagesY = [];
			while (pos >= that.maxScrollY) {
				that.pagesY[page] = pos;
				pos = pos - that.wrapperH;
				page++;
			}
			if (that.maxScrollY%that.wrapperH) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];
		}

		// Prepare the scrollbars
		that._scrollbar('h');
		that._scrollbar('v');

		if (!that.zoomed) {
			that.scroller.style[transitionDuration] = '0';
			that._resetPos(400);
		}
	},

	scrollTo: function (x, y, time, relative) {
		var that = this,
			step = x,
			i, l;

		that.stop();

		if (!step.length) step = [{ x: x, y: y, time: time, relative: relative }];
		
		for (i=0, l=step.length; i<l; i++) {
			if (step[i].relative) { step[i].x = that.x - step[i].x; step[i].y = that.y - step[i].y; }
			that.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
		}

		that._startAni();
	},

	scrollToElement: function (el, time) {
		var that = this, pos;
		el = el.nodeType ? el : that.scroller.querySelector(el);
		if (!el) return;

		pos = that._offset(el);
		pos.left += that.wrapperOffsetLeft;
		pos.top += that.wrapperOffsetTop;

		pos.left = pos.left > 0 ? 0 : pos.left < that.maxScrollX ? that.maxScrollX : pos.left;
		pos.top = pos.top > that.minScrollY ? that.minScrollY : pos.top < that.maxScrollY ? that.maxScrollY : pos.top;
		time = time === undefined ? m.max(m.abs(pos.left)*2, m.abs(pos.top)*2) : time;

		that.scrollTo(pos.left, pos.top, time);
	},

	scrollToPage: function (pageX, pageY, time) {
		var that = this, x, y;
		
		time = time === undefined ? 400 : time;

		if (that.options.onScrollStart) that.options.onScrollStart.call(that);

		if (that.options.snap) {
			pageX = pageX == 'next' ? that.currPageX+1 : pageX == 'prev' ? that.currPageX-1 : pageX;
			pageY = pageY == 'next' ? that.currPageY+1 : pageY == 'prev' ? that.currPageY-1 : pageY;

			pageX = pageX < 0 ? 0 : pageX > that.pagesX.length-1 ? that.pagesX.length-1 : pageX;
			pageY = pageY < 0 ? 0 : pageY > that.pagesY.length-1 ? that.pagesY.length-1 : pageY;

			that.currPageX = pageX;
			that.currPageY = pageY;
			x = that.pagesX[pageX];
			y = that.pagesY[pageY];
		} else {
			x = -that.wrapperW * pageX;
			y = -that.wrapperH * pageY;
			if (x < that.maxScrollX) x = that.maxScrollX;
			if (y < that.maxScrollY) y = that.maxScrollY;
		}

		that.scrollTo(x, y, time);
	},

	disable: function () {
		this.stop();
		this._resetPos(0);
		this.enabled = false;

		// If disabled after touchstart we make sure that there are no left over events
		this._unbind(MOVE_EV, window);
		this._unbind(END_EV, window);
		this._unbind(CANCEL_EV, window);
	},
	
	enable: function () {
		this.enabled = true;
	},
	
	stop: function () {
		if (this.options.useTransition) this._unbind(TRNEND_EV);
		else cancelFrame(this.aniTime);
		this.steps = [];
		this.moved = false;
		this.animating = false;
	},
	
	zoom: function (x, y, scale, time) {
		var that = this,
			relScale = scale / that.scale;

		if (!that.options.useTransform) return;

		that.zoomed = true;
		time = time === undefined ? 200 : time;
		x = x - that.wrapperOffsetLeft - that.x;
		y = y - that.wrapperOffsetTop - that.y;
		that.x = x - x * relScale + that.x;
		that.y = y - y * relScale + that.y;

		that.scale = scale;
		that.refresh();

		that.x = that.x > 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x;
		that.y = that.y > that.minScrollY ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		that.scroller.style[transitionDuration] = time + 'ms';
		that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + scale + ')' + translateZ;
		that.zoomed = false;
	},
	
	isReady: function () {
		return !this.moved && !this.zoomed && !this.animating;
	}
};

function prefixStyle (style) {
	if ( vendor === '' ) return style;

	style = style.charAt(0).toUpperCase() + style.substr(1);
	return vendor + style;
}

dummyStyle = null;	// for the sake of it

    return iScroll;

})(window, document) });

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
        this.firstPoint = new Point();
        this.spentDist = 0;
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
            this.spentDist = 0;
            var stamp = this._getBrushStamp(brush);
            var center = stamp.width / 2;
            // possibly rotate brush
            var r = brush.rotationIncrement();
            var f = brush.followsTangent();
            if (f && this.brushPoints===0 && this.tangent === null) {
                /* draw nothing for first point, we need at least two
                 * points to compute a tangent to follow */
                this.firstPoint.set_from_point(pos);
            } else if (r===0 && !f) {
                // easy case, no rotation
                this.progressContext.drawImage(stamp,
                                               pos.x - center,
                                               pos.y - center);
            } else {
                // progressive rotation:
                r *= this.brushPoints;
                // compute tangent to follow:
                if (f) {
                    var SMOOTH_FACTOR = 0.8; // adjust based on brush.spacing?
                    // t is in [-pi, pi]
                    var t = Math.atan2(pos.y - this.lastPoint.y,
                                       pos.x - this.lastPoint.x);
                    if (this.brushPoints===0) {
                        // redrawing point #0 after we've seen point #1
                        t = this.tangent;
                    } else if (this.brushPoints > 1) {
                        // lightly smooth tangent (for small step sizes)
                        var lt = this.tangent;
                        // step 1, ensure that t > lt
                        if (lt >= t) { lt -= 2*Math.PI; }
                        // step 2, compare (t-lt) to (2*pi+lt-t), use closest
                        if ((t-lt) > (2*Math.PI+lt-t)) { lt += 2*Math.PI; }
                        // step 3, average, then restore to [-pi,pi] interval
                        t = (SMOOTH_FACTOR*t) + ((1-SMOOTH_FACTOR)*lt);
                        if (t > Math.PI) { t -= 2*Math.PI; }
                        if (t < -Math.PI) { t += 2*Math.PI; }
                    }
                    this.tangent = t;
                    r += t;
                    if (this.brushPoints === 1) {
                        // go back and draw point #0
                        // note that this.firstPoint !== this.lastPoint,
                        // because lastPoint may be the last path endpoint,
                        // not necessarily the last stamp location
                        this.brushPoints--;
                        this._drawStamp(this.firstPoint, brush);
                        this.brushPoints++;
                    }
                }
                this.progressContext.save();
                this.progressContext.translate(pos.x, pos.y);
                this.progressContext.rotate(r);
                this.progressContext.drawImage(stamp, -center, -center);
                this.progressContext.restore();
            }
            this.lastPoint.set_from_point(pos);
        },
        execDraw: function(x, y, brush) {
            var from=this._draw_from, to=this._draw_to, tmp=this._draw_tmp;

            from.set_from_point(this.lastPoint);
            to.set(x, y);

            var drawn = false;
            if (!this.isDrawingPath) {
                this.brushPoints = 0;
                this.tangent = null;
                this.isDrawingPath = true;
                this._drawStamp(to, brush);
                drawn = true;
            } else {
                // interpolate along path
                var dist = Point.dist(from, to), d;
                // step should never be less than 1 px.
                var step = Math.max(1, brush.size * brush.spacing);
                for (d = (step-this.spentDist); d < dist; d+= step) {
                    this.brushPoints++; // for brush rotation
                    this._drawStamp(Point.interp(from, to, d/dist, tmp),
                                    brush);
                    drawn = true;
                }
                // what's left over?
                this.spentDist = dist - (d-step);
                this.lastPoint.set_from_point(to);

                if (!drawn) {
                    // XXX idle?
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
    Layer.Checkpoint = function(canvas, isThumbnail) {
        this.canvas = canvas;
        this.isThumbnail = !!isThumbnail;
    };
    Layer.Checkpoint.prototype = {};
    Layer.Checkpoint.prototype.toJSON = function() {
        // store at native canvas resolution, if that's not the same as
        // # of canvas CSS pixels
        var toDataURLHD = (this.canvas.toDataURLHD || this.canvas.toDataURL).
            bind(this.canvas);
        // dataURL might end up as image/png regardness of isThumbnail, but
        // that's ok.  lossy compression is only permissible for thumbnails.
        var dataURL = toDataURLHD(this.isThumbnail ? "image/jpeg" :
                                  "image/png");
        var result = {
            canvas: dataURL,
            // we need to store canvas width/height because it may not
            // match image width/height (when we use toDataURLHD)
            w: this.canvas.width,
            h: this.canvas.height
        };
        // don't waste space on isThumbnail field unless it's set.
        if (this.isThumbnail) { result.isThumbnail = true; }
        return result;
    };
    Layer.Checkpoint.fromJSON = function(str, callback) {
        var json = (typeof(str)==='string') ? JSON.parse(str) : str;
        var image = document.createElement('img');
        // xxx can't load image from data: url synchronously
        image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = ('w' in json) ? json.w : image.width;
            canvas.height = ('h' in json) ? json.h : image.height;
            canvas.getContext('2d').drawImage(image, 0, 0,
                                              canvas.width, canvas.height);
            callback(new Layer.Checkpoint(canvas, json.isThumbnail));
        };
        image.src = json.canvas;
    };

    return Layer;
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, window:false */
define('src/nodefault',[], function() {

    /** Simple utility function to ensure that preventDefault() is called
     *  in an event handler. */

    var noDefault = function(f) {
        return function(event) {
            event.preventDefault(); /* don't change history on click */
            return f ? f.apply(this, arguments) /* pass along args */ : false;
        };
    };

    return noDefault;
});

/*jshint
  latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, window:false,
         setTimeout:false, clearTimeout:false, navigator:false */
/*
        Unobtrusive Slider Control by frequency decoder v2.6 (http://www.frequency-decoder.com/)
        HACKED BY C. Scott Ananian.

        Released under a creative commons Attribution-Share Alike 3.0 Unported license (http://creativecommons.org/licenses/by-sa/3.0/)

        You are free:

        * to copy, distribute, display, and perform the work
        * to make derivative works
        * to make commercial use of the work

        Under the following conditions:

                by Attribution.
                --------------
                You must attribute the work in the manner specified by the author or licensor.

                sa
                --
                Share Alike. If you alter, transform, or build upon this work, you may distribute the resulting work only under a license identical to this one.

        * For any reuse or distribution, you must make clear to others the license terms of this work.
        * Any of these conditions can be waived if you get permission from the copyright holder.
*/
define('src/slider',[], function() {
        var sliders           = {},
            uniqueid          = 0,
            mouseWheelEnabled = true;

        var removeMouseWheelSupport = function() {
                mouseWheelEnabled = false;
        };
        var addEvent = function(obj, type, fn) {
                if( obj.attachEvent ) {
                        obj["e"+type+fn] = fn;
                        obj[type+fn] = function(){obj["e"+type+fn]( window.event );};
                        obj.attachEvent( "on"+type, obj[type+fn] );
                } else { obj.addEventListener( type, fn, true ); }
        };
        var removeEvent = function(obj, type, fn) {
                if( obj.detachEvent ) {
                        try {
                                obj.detachEvent( "on"+type, obj[type+fn] );
                                obj[type+fn] = null;
                        } catch(err) { }
                } else { obj.removeEventListener( type, fn, true ); }
        };
        var stopEvent = function(e) {
                if(e == null) e = document.parentWindow.event;
                if(e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                }

                /*@cc_on@*/
                /*@if(@_win32)
                e.cancelBubble = true;
                e.returnValue = false;
                /*@end@*/

                return false;
        };
        var joinNodeLists = function() {
                if(!arguments.length) { return []; };
                var nodeList = [];
                for (var i = 0; i < arguments.length; i++) {
                        for (var j = 0, item; item = arguments[i][j]; j++) { nodeList[nodeList.length] = item; };
                };
                return nodeList;
        };

        // Function by Artem B. with a minor change by f.d.
        var parseCallbacks = function(cbs) {
                if(cbs == null) { return {}; };
                var func,
                    type,
                    cbObj = {},
                    parts,
                    obj;
                for(var i = 0, fn; fn = cbs[i]; i++) {
                        type = fn.match(/(fd_slider_cb_(update|create|destroy|redraw|move|focus|blur|enable|disable)_)([^\s|$]+)/i)[1];
                        fn   = fn.replace(new RegExp("^"+type), "").replace(/-/g, ".");
                        type = type.replace(/^fd_slider_cb_/i, "").replace(/_$/, "");

                        try {
                                if(fn.indexOf(".") != -1) {
                                        parts = fn.split('.');
                                        obj   = window;
                                        for (var x = 0, part; part = obj[parts[x]]; x++) {
                                                if(part instanceof Function) {
                                                        (function() {
                                                                var method = part;
                                                                func = function (data) { method.apply(obj, [data]) };
                                                        })();
                                                } else {
                                                obj = part;
                                                };
                                        };
                                } else {
                                        func = window[fn];
                                };

                                if(!(func instanceof Function)) continue;
                                if(!(type in cbObj)) { cbObj[type] = []; };
                                cbObj[type][cbObj[type].length] = func;
                        } catch (err) {};
                };
                return cbObj;
        };

        var parseClassNames = function(cbs) {
                if(cbs == null) { return ""; };
                var cns = [];
                for(var i = 0, cn; cn = cbs[i]; i++) {
                        cns[cns.length] = cn.replace(/^fd_slider_cn_/, "");
                };
                return cns.join(" ");
        };
        var createSlider = function(options) {
                if(!options || !options.inp || !options.inp.id) { return false; };
                destroySingleSlider(options.inp.id);
                sliders[options.inp.id] = new fdSlider(options);
                return true;
        };
        var init = function( elem ) {
                var ranges     = /fd_range_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/i,
                    increment  = /fd_inc_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/,
                    kIncrement = /fd_maxinc_([-]{0,1}[0-9]+(d[0-9]+){0,1}){1}/,
                    callbacks  = /((fd_slider_cb_(update|create|destroy|redraw|move|focus|blur|enable|disable)_)([^\s|$]+))/ig,
                    classnames = /(fd_slider_cn_([a-zA-Z0-9_\-]+))/ig,
                    inputs     = elem && elem.tagName && elem.tagName.search(/input|select/i) != -1 ? [elem] : joinNodeLists(document.getElementsByTagName('input'), document.getElementsByTagName('select')),
                    range,
                    tmp,
                    options;

                for(var i = 0, inp; inp = inputs[i]; i++) {
                        if((inp.tagName.toLowerCase() == "input" && inp.type == "text" && (inp.className.search(ranges) != -1 || inp.className.search(/fd_slider/) != -1)) || (inp.tagName.toLowerCase() == "select" && inp.className.search(/fd_slider/) != -1)) {
                                // If we haven't been passed a specific id and the slider exists then continue
                                if(!elem && inp.id && document.getElementById("fd-slider-"+inp.id)) { continue; };

                                // Create an id if necessary
                                if(!inp.id) { inp.id == "sldr" + uniqueid++; };

                                options = {
                                        inp:            inp,
                                        inc:            inp.className.search(increment)  != -1 ? inp.className.match(increment)[0].replace("fd_inc_", "").replace("d",".") : "1",
                                        maxInc:         inp.className.search(kIncrement) != -1 ? inp.className.match(kIncrement)[0].replace("fd_maxinc_", "").replace("d",".") : false,
                                        range:          [0,100],
                                        callbacks:      parseCallbacks(inp.className.match(callbacks)),
                                        classNames:     parseClassNames(inp.className.match(classnames)),
                                        tween:          inp.className.search(/fd_tween/i) != -1,
                                        vertical:       inp.className.search(/fd_vertical/i) != -1,
                                        hideInput:      inp.className.search(/fd_hide_input/i) != -1,
                                        clickJump:      inp.className.search(/fd_jump/i) != -1,
                                        fullARIA:       inp.className.search(/fd_full_aria/i) != -1,
                                        noMouseWheel:   inp.className.search(/fd_disable_mousewheel/i) != -1
                                };

                                if(inp.tagName.toLowerCase() == "select") {
                                        options.range = [0, inp.options.length - 1];
                                } else if(inp.className.search(ranges) != -1) {
                                        range = inp.className.match(ranges)[0].replace("fd_range_", "").replace(/d/g,".").split("_");
                                        options.range = [range[0], range[1]];
                                };

                                createSlider(options);
                        };
                };

                return true;
        };
        var destroySingleSlider = function(id) {
                if(id in sliders) {
                        sliders[id].destroy();
                        delete sliders[id];
                        return true;
                };
                return false;
        };
        var destroyAllsliders = function(e) {
                for(slider in sliders) { sliders[slider].destroy(); };
        };
        var unload = function(e) {
                destroyAllsliders();
                sliders = null;
                removeEvent(window, "unload", unload);
                removeEvent(window, "resize", resize);
                removeOnloadEvent();
        };
        var resize = function(e) {
                for(slider in sliders) { sliders[slider].onResize(); };
        };
        var removeOnloadEvent = function() {
                removeEvent(window, "load", init);
                /*@cc_on@*/
                /*@if(@_win32)
                removeEvent(window, "load",   function() { setTimeout(onload, 200) });
                /*@end@*/
        };
        var extractTouch = function(event) {
            // synthesize new event with data from first touch
            return {
                type: event.type,
                pageX: event.touches[0].pageX,
                pageY: event.touches[0].pageY,
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY,
                target: event.touches[0].target || event.target || event.srcElement
            };
        }
        function fdSlider(options) {
                var inp         = options.inp,
                    disabled    = false,
                    tagName     = inp.tagName.toLowerCase(),
                    min         = +options.range[0],
                    max         = +options.range[1],
                    range       = Math.abs(max - min),
                    inc         = tagName == "select" ? 1 : +options.inc||1,
                    maxInc      = options.maxInc ? options.maxInc : inc * 2,
                    precision   = options.inc.search(".") != -1 ? options.inc.substr(options.inc.indexOf(".")+1, options.inc.length - 1).length : 0,
                    steps       = Math.ceil(range / inc),
                    useTween    = !!options.tween,
                    fullARIA    = !!options.fullARIA,
                    hideInput   = !!options.hideInput,
                    clickJump   = useTween ? false : !!options.clickJump,
                    vertical    = !!options.vertical,
                    callbacks   = options.callbacks,
                    classNames  = options.classNames || '',
                    noMWheel    = !!options.noMouseWheel,
                    timer       = null,
                    kbEnabled   = true,
                    sliderH     = 0,
                    sliderW     = 0,
                    tweenX      = 0,
                    tweenB      = 0,
                    tweenC      = 0,
                    tweenD      = 0,
                    frame       = 0,
                    x           = 0,
                    y           = 0,
                    maxPx       = 0,
                    handlePos   = 0,
                    destPos     = 0,
                    mousePos    = 0,
                    deltaPx     = 0,
                    stepPx      = 0,
                    self        = this,
                    changeList  = {},
                    initVal     = null,
                    outerWrapper,
                    wrapper,
                    handle,
                    bar;

                if(max < min) {
                        inc    = -inc;
                        maxInc = -maxInc;
                };

                function disableSlider(noCallback) {
                        if(disabled && !noCallback) { return; };

                        try {
                                removeEvent(outerWrapper, "mouseover", onMouseOver);
                                removeEvent(outerWrapper, "mouseout",  onMouseOut);
                                removeEvent(outerWrapper, "mousedown", onMouseDown);
                                removeEvent(outerWrapper, "touchstart",onMouseDown);
                                removeEvent(handle, "focus",     onFocus);
                                removeEvent(handle, "blur",      onBlur);
                                if(!window.opera) {
                                        removeEvent(handle, "keydown",   onKeyDown);
                                        removeEvent(handle, "keypress",  onKeyPress);
                                } else {
                                        removeEvent(handle, "keypress",  onKeyDown);
                                };
                                removeEvent(handle, "mousedown", onHandleMouseDown);
                                removeEvent(handle, "touchstart",onHandleMouseDown);
                                removeEvent(handle, "mouseup",   onHandleMouseUp);
                                removeEvent(handle, "touchend",  onHandleMouseUp);
                                removeEvent(handle, "touchcancel",onHandleMouseUp);

                                if(mouseWheelEnabled && !noMWheel) {
                                        if (window.addEventListener && !window.devicePixelRatio) window.removeEventListener('DOMMouseScroll', trackMouseWheel, false);
                                        else {
                                                removeEvent(document, "mousewheel", trackMouseWheel);
                                                removeEvent(window,   "mousewheel", trackMouseWheel);
                                        };
                                };
                        } catch(err) {};

                        clearTimeout(timer);
                        outerWrapper.classList.add('slider-disabled');
                        outerWrapper.setAttribute("aria-disabled", true);
                        inp.disabled = disabled = true;

                        if(!noCallback) {
                                callback("disable");
                        };
                };

                function enableSlider(noCallback) {
                        if(!disabled && !noCallback) return;
                        addEvent(outerWrapper, "mouseover", onMouseOver);
                        addEvent(outerWrapper, "mouseout",  onMouseOut);
                        addEvent(outerWrapper, "mousedown", onMouseDown);
                        addEvent(outerWrapper, "touchstart",onMouseDown);
                        if(!window.opera) {
                                addEvent(handle, "keydown",   onKeyDown);
                                addEvent(handle, "keypress",  onKeyPress);
                        } else {
                                addEvent(handle, "keypress",  onKeyDown);
                        };
                        addEvent(handle, "focus",     onFocus);
                        addEvent(handle, "blur",      onBlur);
                        addEvent(handle, "mousedown", onHandleMouseDown);
                        addEvent(handle, "touchstart",onHandleMouseDown);
                        addEvent(handle, "mouseup",   onHandleMouseUp);
                        addEvent(handle, "touchend",  onHandleMouseUp);
                        addEvent(handle, "touchcancel",onHandleMouseUp);

                        outerWrapper.classList.remove("slider-disabled");
                        outerWrapper.setAttribute("aria-disabled", false);
                        inp.disabled = disabled = false;

                        if(!noCallback) {
                                callback("enable");
                        };
                };

                function destroySlider() {
                        try {
                                disableSlider();
                                outerWrapper.parentNode.removeChild(outerWrapper);
                        } catch(err) {};

                        wrapper = bar = handle = outerWrapper = timer = null;
                        callback("destroy");
                        callbacks = null;
                };

                function redraw() {
                        locate();
                        // Internet Explorer requires the try catch
                        try {
                                var sW = outerWrapper.offsetWidth,
                                    sH = outerWrapper.offsetHeight,
                                    hW = handle.offsetWidth,
                                    hH = handle.offsetHeight,
                                    bH = bar.offsetHeight,
                                    bW = bar.offsetWidth;

                                maxPx     = vertical ? sH - hH : sW - hW;
                                stepPx    = maxPx / steps;
                                deltaPx   = maxPx / Math.ceil(range / maxInc);

                                sliderW = sW;
                                sliderH = sH;

                                valueToPixels();
                        } catch(err) { };
                        callback("redraw");
                };

                function callback(type) {
                        var cbObj = {"elem":inp, "value":tagName == "select" ? inp.options[inp.selectedIndex].value : inp.value};
                        if(type in callbacks) {
                                for(var i = 0, func; func = callbacks[type][i]; i++) {
                                        func(cbObj);
                                };
                        };
                };

                function onFocus(e) {
                        outerWrapper.classList.add('focused');
                        if(mouseWheelEnabled && !noMWheel) {
                                addEvent(window, 'DOMMouseScroll', trackMouseWheel);
                                addEvent(document, 'mousewheel', trackMouseWheel);
                                if(!window.opera) addEvent(window,   'mousewheel', trackMouseWheel);
                        };
                        callback("focus");
                };

                function onBlur(e) {
                        outerWrapper.classList.remove('focused');
                        outerWrapper.classList.remove('fd-fc-slider-hover');
                        outerWrapper.classList.remove('fd-slider-hover');
                        if(mouseWheelEnabled && !noMWheel) {
                                removeEvent(document, 'mousewheel', trackMouseWheel);
                                removeEvent(window, 'DOMMouseScroll', trackMouseWheel);
                                if(!window.opera) removeEvent(window,   'mousewheel', trackMouseWheel);
                        };
                        callback("blur");
                };

                function trackMouseWheel(e) {
                        if(!kbEnabled) return;
                        e = e || window.event;
                        var delta = 0;

                        if (e.wheelDelta) {
                                delta = e.wheelDelta/120;
                                if (window.opera && window.opera.version() < 9.2) delta = -delta;
                        } else if(e.detail) {
                                delta = -e.detail/3;
                        };

                        if(vertical) { delta = -delta; };

                        if(delta) {
                                var xtmp = vertical ? handle.offsetTop : handle.offsetLeft;
                                xtmp = (delta < 0) ? Math.ceil(xtmp + deltaPx) : Math.floor(xtmp - deltaPx);
                                pixelsToValue(Math.min(Math.max(xtmp, 0), maxPx));
                        }
                        return stopEvent(e);
                };

                function onKeyPress(e) {
                        e = e || document.parentWindow.event;
                        if ((e.keyCode >= 33 && e.keyCode <= 40) || !kbEnabled || e.keyCode == 45 || e.keyCode == 46) {
                                return stopEvent(e);
                        };
                        return true;
                };

                function onKeyDown(e) {
                        if(!kbEnabled) return true;

                        e = e || document.parentWindow.event;
                        var kc = e.keyCode != null ? e.keyCode : e.charCode;

                        if ( kc < 33 || (kc > 40 && (kc != 45 && kc != 46))) return true;

                        var value = tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex;
                        if(isNaN(value) || value < Math.min(min,max)) value = Math.min(min,max);

                        if( kc == 37 || kc == 40 || kc == 46 || kc == 34) {
                                // left, down, ins, page down
                                value -= (e.ctrlKey || kc == 34 ? maxInc : inc)
                        } else if( kc == 39 || kc == 38 || kc == 45 || kc == 33) {
                                // right, up, del, page up
                                value += (e.ctrlKey || kc == 33 ? maxInc : inc)
                        } else if( kc == 35 ) {
                                // max
                                value = max;
                        } else if( kc == 36 ) {
                                // min
                                value = min;
                        };

                        valueToPixels(value);
                        callback("update");

                        // Opera doesn't let us cancel key events so the up/down arrows and home/end buttons will scroll the screen - which sucks
                        return stopEvent(e);
                };

                function onMouseOver( e ) {
                        /*@cc_on@*/
                        /*@if(@_jscript_version <= 5.6)
                        if(this.className.search(/focused/) != -1) {
                                this.classList.add('fd-fc-slider-hover');
                                return;
                        }
                        /*@end@*/
                        this.classList.add('fd-slider-hover');
                };

                function onMouseOut( e ) {
                        /*@cc_on@*/
                        /*@if(@_jscript_version <= 5.6)
                        if(this.className.search(/focused/) != -1) {
                                this.classList.remove('fd-fc-slider-hover');
                                return;
                        }
                        /*@end@*/
                        this.classList.remove('fd-slider-hover');
                };

                function onHandleMouseUp(e) {
                        e = e || window.event;
                        if (e.type==='mouseup') {
                            removeEvent(document, 'mousemove', trackMouse);
                            removeEvent(document, 'mouseup',   onHandleMouseUp);
                        } else {
                            removeEvent(document, 'touchmove', trackMouse);
                            removeEvent(document, 'touchend',    onHandleMouseUp);
                            removeEvent(document, 'touchcancel', onHandleMouseUp);
                        }

                        kbEnabled = true;

                        // Opera fires the blur event when the mouseup event occurs on a button, so we attept to force a focus
                        if(window.opera) try { setTimeout(function() { onfocus(); }, 0); } catch(err) {};
                        document.body.classList.remove('slider-drag-vertical');
                        document.body.classList.remove('slider-drag-horizontal');

                        return stopEvent(e);
                };

                function onHandleMouseDown(e) {
                        e = e || window.event;
                        // mouse event emulation from touches
                        if (e.touches) {
                            if (e.touches.length===0) { return; }
                            e = extractTouch(e);
                        }
                        mousePos  = vertical ? e.clientY : e.clientX;
                        handlePos = parseInt(vertical ? handle.offsetTop : handle.offsetLeft)||0;
                        kbEnabled = false;

                        clearTimeout(timer);
                        timer = null;

                        if (e.type==='mousedown') {
                            addEvent(document, 'mousemove', trackMouse);
                            addEvent(document, 'mouseup', onHandleMouseUp);
                        } else {
                            addEvent(document, 'touchmove', trackMouse);
                            addEvent(document, 'touchend',    onHandleMouseUp);
                            addEvent(document, 'touchcancel', onHandleMouseUp);
                        }

                        // Force a "focus" on the button on mouse events
                        if(window.devicePixelRatio || (document.all && !window.opera)) try { setTimeout(function() { handle.focus(); }, 0); } catch(err) {};

                        document.body.classList.add("slider-drag-" + (vertical ? "vertical" : "horizontal"));
                };

                function onMouseUp( e ) {
                        e = e || window.event;
                        if (e.type === 'mouseup') {
                            removeEvent(document, 'mouseup', onMouseUp);
                        } else {
                            removeEvent(document, 'touchend', onMouseUp);
                            removeEvent(document, 'touchcancel', onMouseUp);
                        }
                        if(!useTween) {
                                clearTimeout(timer);
                                timer = null;
                                kbEnabled = true;
                        };
                        return stopEvent(e);
                };

                function trackMouse( e ) {
                        e = e || window.event;
                        if (e.touches) {
                            if (e.touches.length===0) { return; }
                            e = extractTouch(e);
                        }
                        pixelsToValue(snapToNearestValue(handlePos + (vertical ? e.clientY - mousePos : e.clientX - mousePos)));
                };

                function onMouseDown( e ) {
                        e = e || window.event;
                        // mouse event emulation from touches
                        if (e.touches) {
                            if (e.type==='touchstart') {
                                e.preventDefault();
                            }
                            if (e.touches.length===0) { return; }
                            e = extractTouch(e);
                        }
                        var targ;
                        if (e.target) targ = e.target;
                        else if (e.srcElement) targ = e.srcElement;
                        if (targ.nodeType == 3) targ = targ.parentNode;

                        if(targ.className.search("fd-slider-handle") != -1) { return true; };

                        try { setTimeout(function() { handle.focus(); }, 0); } catch(err) { };

                        clearTimeout(timer);
                        locate();

                        timer     = null;
                        kbEnabled = false;

                        var posx        = 0,
                            sLft        = 0,
                            sTop        = 0;

                        // Internet Explorer doctype woes
                        if (document.documentElement && document.documentElement.scrollTop) {
                                sTop = document.documentElement.scrollTop;
                                sLft = document.documentElement.scrollLeft;
                        } else if (document.body) {
                                sTop = document.body.scrollTop;
                                sLft = document.body.scrollLeft;
                        };

                        if (e.pageX)            posx = vertical ? e.pageY : e.pageX;
                        else if (e.clientX)     posx = vertical ? e.clientY + sTop : e.clientX + sLft;
                        posx -= vertical ? y + Math.round(handle.offsetHeight / 2) : x + Math.round(handle.offsetWidth / 2);
                        posx = snapToNearestValue(posx);

                        if(useTween) {
                                tweenTo(posx);
                        } else if(clickJump) {
                                pixelsToValue(posx);
                                onHandleMouseDown(e);
                        } else {
                                if (e.type==='mousedown') {
                                    addEvent(document, 'mouseup', onMouseUp);
                                } else {
                                    addEvent(document, 'touchend', onMouseUp);
                                    addEvent(document, 'touchcancel', onMouseUp);
                                }
                                destPos = posx;
                                onTimer();
                        };
                };

                function incrementHandle(numOfSteps) {
                        var value = tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex;
                        if(isNaN(value) || value < Math.min(min,max)) value = Math.min(min,max);
                        value += inc * numOfSteps;
                        valueToPixels(value);
                };

                function snapToNearestValue(px) {
                        var rem = px % stepPx;
                        if(rem && rem >= (stepPx / 2)) { px += (stepPx - rem); }
                        else { px -= rem;  };
                        return Math.min(Math.max(parseInt(px, 10), 0), maxPx);
                };

                function locate(){
                        var curleft = 0,
                            curtop  = 0,
                            obj     = outerWrapper;

                        // in modern browsers; roughly ".offset()" from zepto.js
                        if (obj.getBoundingClientRect) {
                            var rect = obj.getBoundingClientRect();
                            x = rect.left + document.body.scrollLeft;
                            y = rect.top + document.body.scrollTop;
                            return;
                        }
                        // Try catch for IE's benefit
                        try {
                                while (obj.offsetParent) {
                                        curleft += obj.offsetLeft;
                                        curtop  += obj.offsetTop;
                                        obj      = obj.offsetParent;
                                };
                        } catch(err) {};
                        x = curleft;
                        y = curtop;
                };

                function onTimer() {
                        var xtmp = vertical ? handle.offsetTop : handle.offsetLeft;
                        xtmp = Math.round((destPos < xtmp) ? Math.max(destPos, Math.floor(xtmp - deltaPx)) : Math.min(destPos, Math.ceil(xtmp + deltaPx)));
                        pixelsToValue(xtmp);
                        if(xtmp != destPos) timer = setTimeout(onTimer, steps > 20 ? 50 : 100);
                        else kbEnabled = true;
                };

                var tween = function(){
                        frame++;
                        var c = tweenC,
                            d = 20,
                            t = frame,
                            b = tweenB,
                            x = Math.ceil((t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b);

                        pixelsToValue(t == d ? tweenX : x);
                        callback("move");
                        if(t!=d) timer = setTimeout(tween, 20);
                        else {
                                clearTimeout(timer);
                                timer     = null;
                                kbEnabled = true;
                        };
                };

                function tweenTo(tx){
                        kbEnabled = false;
                        tweenX = parseInt(tx, 10);
                        tweenB = parseInt(vertical ? handle.style.top : handle.style.left, 10);
                        tweenC = tweenX - tweenB;
                        tweenD = 20;
                        frame  = 0;
                        if(!timer) timer = setTimeout(tween, 20);
                };

                function pixelsToValue(px) {
                        handle.style[vertical ? "top" : "left"] = px + "px";
                        var val = min + (Math.round(px / stepPx) * inc);
                        setInputValue((tagName == "select" || inc == 1) ? Math.round(val) : val);
                };

                function valueToPixels(val) {
                        var value = isNaN(val) ? tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex : val;
                        if(isNaN(value) || value < Math.min(min,max)) value = Math.min(min,max);
                        else if(value > Math.max(min,max)) value = Math.max(min,max);
                        setInputValue(value);
                        handle.style[vertical ? "top" : "left"] = Math.round(((value - min) / inc) * stepPx) + "px";
                };

                function setInputValue(val) {
                        val = isNaN(val) ? min : val;
                        if(tagName == "select") {
                                try {
                                        val = parseInt(val, 10);
                                        if(inp.selectedIndex == val) return;
                                        inp.options[val].selected = true;
                                } catch (err) {};
                        } else {
                                val = (min + (Math.round((val - min) / inc) * inc)).toFixed(precision);
                                if(inp.value == val) return;
                                inp.value = val;
                        };
                        updateAriaValues();
                        callback("update");
                };

                function findLabel() {
                        var label;
                        if(inp.parentNode && inp.parentNode.tagName.toLowerCase() == "label") label = inp.parentNode;
                        else {
                                var labelList = document.getElementsByTagName('label');
                                // loop through label array attempting to match each 'for' attribute to the id of the current element
                                for(var i = 0, lbl; lbl = labelList[i]; i++) {
                                        // Internet Explorer requires the htmlFor test
                                        if((lbl['htmlFor'] && lbl['htmlFor'] == inp.id) || (lbl.getAttribute('for') == inp.id)) {
                                                label = lbl;
                                                break;
                                        };
                                };
                        };
                        if(label && !label.id) { label.id = inp.id + "_label"; };
                        return label;
                };

                function updateAriaValues() {
                        handle.setAttribute("aria-valuenow",  tagName == "select" ? inp.options[inp.selectedIndex].value : inp.value);
                        handle.setAttribute("aria-valuetext", tagName == "select" ? inp.options[inp.selectedIndex].text  : inp.value);
                };

                function onChange( e ) {
                        valueToPixels();
                        callback("update");
                        return true;
                };

                (function() {
                        if(hideInput) { inp.classList.add("fd_hide_slider_input"); }
                        else { addEvent(inp, 'change', onChange); };

                        outerWrapper              = document.createElement('div');
                        outerWrapper.className    = "fd-slider" + (vertical ? "-vertical " : " ") + classNames;
                        outerWrapper.id           = "fd-slider-" + inp.id;

                        wrapper                   = document.createElement('span');
                        wrapper.className         = "fd-slider-inner";

                        bar                       = document.createElement('span');
                        bar.className             = "fd-slider-bar";

                        if(fullARIA) {
                                handle            = document.createElement('span');
                                handle.setAttribute(!/*@cc_on!@*/false ? "tabIndex" : "tabindex", "0");
                        } else {
                                handle            = document.createElement('button');
                                handle.setAttribute("type", "button");
                        };

                        handle.className          = "fd-slider-handle";
                        handle.appendChild(document.createTextNode(String.fromCharCode(160)));

                        outerWrapper.appendChild(wrapper);
                        outerWrapper.appendChild(bar);
                        outerWrapper.appendChild(handle);

                        inp.parentNode.insertBefore(outerWrapper, inp);

                        /*@cc_on@*/
                        /*@if(@_win32)
                        handle.unselectable       = "on";
                        bar.unselectable          = "on";
                        wrapper.unselectable      = "on";
                        outerWrapper.unselectable = "on";
                        /*@end@*/

                        // Add ARIA accessibility info programmatically
                        handle.setAttribute("role",           "slider");
                        handle.setAttribute("aria-valuemin",  min);
                        handle.setAttribute("aria-valuemax",  max);

                        var lbl = findLabel();
                        if(lbl) {
                                handle.setAttribute("aria-labelledby", lbl.id);
                                handle.id = "fd-slider-handle-" + inp.id;
                                /*@cc_on
                                /*@if(@_win32)
                                lbl.setAttribute("htmlFor", handle.id);
                                @else @*/
                                lbl.setAttribute("for", handle.id);
                                /*@end
                                @*/
                        };

                        // Are there page instructions - the creation of the instructions has been left up to you fine reader...
                        if(document.getElementById("fd_slider_describedby")) {
                                handle.setAttribute("aria-describedby", "fd_slider_describedby");  // aaa:describedby
                        };

                        if(inp.getAttribute("disabled") == true) {
                                disableSlider(true);
                        } else {
                                enableSlider(true);
                        };

                        updateAriaValues();
                        callback("create");
                        redraw();
                })();

                return {
                        onResize:       function(e) { if(outerWrapper.offsetHeight != sliderH || outerWrapper.offsetWidth != sliderW) { redraw(); }; },
                        destroy:        function()  { destroySlider(); },
                        reset:          function()  { valueToPixels(); },
                        increment:      function(n) { incrementHandle(n); },
                        disable:        function()  { disableSlider(); },
                        enable:         function()  { enableSlider(); }
                };
        };

        function addOnLoadEvent() {
            addEvent(window, "load",   init);
            addEvent(window, "unload", unload);
            addEvent(window, "resize", resize);
            /*@cc_on@*/
            /*@if(@_win32)
              var onload = function(e) {
              for(slider in sliders) { sliders[slider].reset(); }
              };
              addEvent(window, "load", function() { setTimeout(onload, 200) });
              /*@end@*/
        };

        return {
                        create:                 function(elem) { init(elem) },
                        createSlider:           function(opts) { createSlider(opts); },
                        destroyAll:             function() { destroyAllsliders(); },
                        destroySlider:          function(id) { return destroySingleSlider(id); },
                        redrawAll:              function() { resize(); },
                        increment:              function(id, numSteps) { if(!(id in sliders)) { return false; }; sliders[id].increment(numSteps); },
                        addEvent:               addEvent,
                        removeEvent:            removeEvent,
                        stopEvent:              stopEvent,
                        updateSlider:           function(id) { if(!(id in sliders)) { return false; }; sliders[id].reset(); },
                        disableMouseWheel:      function() { removeMouseWheelSupport(); },
                        addOnLoadEvent:         addOnLoadEvent,
                        removeOnLoadEvent:      removeOnloadEvent,
                        disableSlider:          function(id) { if(!(id in sliders)) { return false; }; sliders[id].disable(); },
                        enableSlider:           function(id) { if(!(id in sliders)) { return false; }; sliders[id].enable(); }
        }
});



/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true, globalstrict:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/brushdialog',['domReady!', 'text!./brushdialog.html', './brush', './color', './colorwheel', './coords', './compat', './drawcommand', './hslcolor', './iscroll', './layer', './nodefault', './slider'], function(document, innerhtml, Brush, Color, ColorWheel, Coords, Compat, DrawCommand, HSLColor, iScroll, Layer, noDefault, Slider) {

    /* Implement a brush and color options pane. */

    // brush preview widget
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

    // brush and color options dialog
    var BrushDialog = function(brushpane, hidePaneSwitcher) {
        this.id = (cnt++); /* unique for each BrushDialog */
        this.brushpane = brushpane;
        this._initializing = true;
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

        var PAGES = ['color', 'brush'];
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
                this.close(true /*invoke callback */);
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
        var spacing_callback = function() {
            var input = brushpane.querySelector('input.brush_spacing');
            preview.spacing = parseInt(input.value, 10) || 5;
            brushpane.querySelector('.spacing .caption').
                setAttribute('data-amount', preview.spacing);
            if (this._initializing) { return; }
            preview_update();
        }.bind(this);
        Slider.createSlider({
            inp: assignID('brush_spacing'),
            range: [5,200],
            inc: "1",
            clickJump: true,
            hideInput: true,
            callbacks: { update: [spacing_callback] }
        });
        var size_callback = function() {
            var input = brushpane.querySelector('input.brush_size');
            preview.size = parseInt(input.value, 10) || 1;
            brushpane.querySelector('.size .caption').
                setAttribute('data-amount', preview.size);
            if (this._initializing) { return; }
            preview_update();
        }.bind(this);
        Slider.createSlider({
            inp: assignID('brush_size'),
            range: [1,129],
            inc: "1",
            clickJump: true,
            hideInput: true,
            callbacks: { update: [size_callback] }
        });
        // set up lightness/opacity sliders
        var color_slider_callback = function() {
            if (this._initializing) { return; }
            // hook up update callback only after slider has been inited.
            // (otherwise we get a rogue update on the first animation frame)
            updateColorFromInputs();
        }.bind(this);
        ['lightness', 'opacity'].forEach(function(id) {
            var elem = brushpane.querySelector('input.color_'+id);
            Slider.createSlider({
                inp: elem,
                range: [0, 255],
                inc: "1",
                clickJump: true,
                hideInput: true,
                callbacks: { update: [color_slider_callback] }
            });
        });

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
        var colorString = hslColor.rgbaString();
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
        // user-defined callback
        if (this.colorCallback) {
            this.colorCallback(hslColor);
        }
    };
    BrushDialog.prototype.open = function(brush, firstPane, callback) {
        this.callback = callback;
        // bind to window.resize
        this._resize = this.onResize.bind(this);
        window.addEventListener('resize', this._resize, false);
        this.updateBrush(brush);
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
    BrushDialog.prototype.updateBrush = function(brush, preserveOldColor) {
        // set up brush (and adjust sliders)
        this._initializing = true;
        this.preview.setFromBrush(brush);
        this.preview.update();
        // set up color and oldcolor
        var hslColor = HSLColor.from_color(brush.color);
        hslColor.opacity = this.preview.opacity; /* brush.color is opaque */
        this._setInputs(hslColor);
        this._updateColor(hslColor);
        if (preserveOldColor) {
            this._updateOldColor(this._colorFromInputs('old_color_'));
        } else {
            this._setInputs(hslColor, 'old_color_');
            this._updateOldColor(hslColor);
        }
        this.wheel.setHSL(hslColor.hue, hslColor.saturation,
                          hslColor.lightness);
        this.onResize();
        this._initializing = false;
    };
    BrushDialog.prototype.currentPane = function() {
        return this.brushpane.classList.contains('color') ? 'color' : 'brush';
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
    BrushDialog.prototype.isOpen = function() {
        return this.brushpane.classList.contains('visible');
    };
    BrushDialog.prototype.close = function(invokeCallback) {
        window.removeEventListener('resize', this._resize, false);
        this.brushpane.classList.remove('visible');
        if (invokeCallback) { // false to 'cancel'
            this._invokeCallback();
        }
    };
    BrushDialog.prototype.currentBrush = function() {
        var hslColor = this._colorFromInputs();
        // convert the color to rgb and make opaque (by adding to opaque black)
        var rgbColor = hslColor.rgbaColor().add(Color.BLACK);
        return this.preview.toBrush(rgbColor);
    };
    BrushDialog.prototype._invokeCallback = function() {
        if (this.callback) {
            this.callback.call(null, this.currentBrush());
        }
    };
    return BrushDialog;
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
        setTitle(window, "Nell's Colors");
        return insertCanvas(window);
    };
    var new_window = function(parent_window) {
        var nw = parent_window.open("", "_blank");
        insertMeta(nw);
        setTitle(nw, "Nell's Colors");
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
    return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;
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
  var useAutoIncrement = function() {
      // using preliminary mozilla implementation which doesn't support
      // auto-generated keys.  Neither do some webkit implementations.
      return !!window.indexedDB;
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
        this.useAutoIncrement = useAutoIncrement();
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
            var params = {};
            if (self.useAutoIncrement) { params.autoIncrement = true; }
            self.db.createObjectStore(STORE_NAME, params);
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
            
            if(self.db.version != (''+STORE_VERSION)) {
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
         if (obj.key) {
             request = store.put(obj, obj.key);
         } else if (this.useAutoIncrement) {
             request = store.put(obj); // use autoIncrementing key.
         } else {
             request = store.put(obj, this.uuid()); // use randomly-generated key
         }
         
         request.onsuccess = win;
         request.onerror = fail;
         
         return this;
    },
    
    batch: function (objs, callback) {
        
        var results = []
        ,   done = objs.length
        ,   self = this

        var putOne = function(i) {
            self.save(objs[i], function(obj) {
                results[i] = obj;
                if ((--done) > 0) { return; }
                if (callback) {
                    self.lambda(callback).call(self, results);
                }
            });
        };

        for (var i = 0, l = objs.length; i < l; i++) 
            putOne(i);
        
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
        var win  = function (e) {
            var r = e.target.result;
            if (callback) {
                if (r) { r.key = key; }
                self.lambda(callback).call(self, r);
            }
        };
        
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
        
        } else {

            // note: these are hosted.
            var results = []
            ,   done = key.length
            ,   keys = key

            var getOne = function(i) {
                self.get(keys[i], function(obj) {
                    results[i] = obj;
                    if ((--done) > 0) { return; }
                    if (callback) {
                        self.lambda(callback).call(self, results);
                    }
                });
            };
            for (var i = 0, l = keys.length; i < l; i++) 
                getOne(i);
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

    keys:function(callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.keys(callback);
            });
            return;
        }
        var cb = this.fn(this.name, callback) || undefined;
        var self = this;
        var objectStore = this.db.transaction(STORE_NAME).objectStore(STORE_NAME);
        var toReturn = [];
        // in theory we could use openKeyCursor() here, but no one actually
        // supports it yet.
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
               toReturn.push(cursor.key);
               cursor['continue']();
          }
          else {
              if (cb) cb.call(self, toReturn);
          }
        };
        return this;
    },

    remove:function(keyOrArray, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.remove(keyOrArray, callback);
            });
            return;
        }
        var self = this;
        if (this.isArray(keyOrArray)) {
            // batch remove
            var i, done = keyOrArray.length;
            var removeOne = function(i) {
                self.remove(keyOrArray[i], function() {
                    if ((--done) > 0) { return; }
                    if (callback) {
                        self.lambda(callback).call(self);
                    }
                });
            };
            for (i=0; i < keyOrArray.length; i++)
                removeOne(i);
            return this;
        }
        var request;
        var win  = function () {
            request.onsuccess = request.onerror = null;
            if (callback) self.lambda(callback).call(self)
        };
        var key = keyOrArray.key ? keyOrArray.key : keyOrArray;
        request = this.db.transaction(STORE_NAME, READ_WRITE).objectStore(STORE_NAME)['delete'](key);
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
    if (typeof window==='undefined') {
        window = { }; // node/optimizer compatibility
    }
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
            return !!storage && function() {
              // in mobile safari if safe browsing is enabled, window.storage
              // is defined but setItem calls throw exceptions.
              var success = true
              var value = Math.random()
              try {
                storage.setItem(value, value)
              } catch (e) {
                success = false
              }
              storage.removeItem(value)
              return success
            }()
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
                var indices = this.indexer.all();
                var keys = [];
                //Checking for the support of map.
                if(Array.prototype.map) {
                    keys = indices.map(function(r){ return r.replace(name + '.', '') })
                } else {
                    for (var key in indices) {
                        keys.push(key.replace(name + '.', ''));
                    }
                }
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
                    } 
                    r.push(obj)
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
        
        remove: function (keyOrArray, callback) {
            var self = this;
            if (this.isArray(keyOrArray)) {
                // batch remove
                var i, done = keyOrArray.length;
                var removeOne = function(i) {
                    self.remove(keyOrArray[i], function() {
                        if ((--done) > 0) { return; }
                        if (callback) {
                            self.lambda(callback).call(self);
                        }
                    });
                };
                for (i=0; i < keyOrArray.length; i++)
                    removeOne(i);
                return this;
            }
            var key = this.name + '.' +
                ((keyOrArray.key) ? keyOrArray.key : keyOrArray)
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

Lawnchair.adapter('window-name', (function() {
    if (typeof window==='undefined') {
        window = { top: { } }; // node/optimizer compatibility
    }

    // edited from the original here by elsigh
    // Some sites store JSON data in window.top.name, but some folks (twitter on iPad)
    // put simple strings in there - we should make sure not to cause a SyntaxError.
    var data = {}
    try {
        data = JSON.parse(window.top.name)    
    } catch (e) {}
    
    
    return {

        valid: function () {
            return typeof window.top.name != 'undefined' 
        },

        init: function (options, callback) {
            data[this.name] = data[this.name] || {index:[],store:{}}
            this.index = data[this.name].index
            this.store = data[this.name].store
            this.fn(this.name, callback).call(this, this)
            return this
        },

        keys: function (callback) {
            this.fn('keys', callback).call(this, this.index)
            return this
        },

        save: function (obj, cb) {
            // data[key] = value + ''; // force to string
            // window.top.name = JSON.stringify(data);
            var key = obj.key || this.uuid()
            this.exists(key, function(exists) {
                if (!exists) {
                    if (obj.key) delete obj.key
                    this.index.push(key)
                }
                this.store[key] = obj
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
                    r.push(this.store[keyOrArray[i]])
                }
            } else {
                r = this.store[keyOrArray]
                if (r) r.key = keyOrArray
            }
            if (cb) this.lambda(cb).call(this, r)
            return this 
        },
        
        exists: function (key, cb) {
            this.lambda(cb).call(this, !!(this.store[key]))
            return this
        },

        all: function (cb) {
            var r = []
            for (var i = 0, l = this.index.length; i < l; i++) {
                var obj = this.store[this.index[i]]
                obj.key = this.index[i]
                r.push(obj)
            }
            this.fn(this.name, cb).call(this, r)
            return this
        },
        
        remove: function (keyOrArray, cb) {
            var del = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray]
            for (var i = 0, l = del.length; i < l; i++) {
                var key = del[i].key ? del[i].key : del[i]
                var where = this.indexOf(this.index, key)
                if (where < 0) continue /* key not present */
                delete this.store[key]
                this.index.splice(where, 1)
            }
            window.top.name = JSON.stringify(data)
            if (cb) this.lambda(cb).call(this)
            return this
        },

        nuke: function (cb) {
            this.store = data[this.name].store = {}
            this.index = data[this.name].index = []
            window.top.name = JSON.stringify(data)
            if (cb) this.lambda(cb).call(this)
            return this
        }
    }
/////
})())

};
});

/**
 * nell-colors-journal adapter.
 * C. Scott Ananian
 */
define('src/lawnchair/adapters/nell-colors-journal.js',[], function() { return function(Lawnchair) {

Lawnchair.adapter('nell-colors-journal', (function() {
    if (typeof window==='undefined') {
        window = { }; // node/optimizer compatibility
    }
    // use dom storage to store a persistent UUID
    var domStorage = window.localStorage;
    // key name used to store UUID
    var UUID_KEY = 'nell-colors-journal-uuid';
    // server name!
    var NCJ_BASE_URL = 'http://nell-colors-journal.appspot.com';
    // local debugging only!
    //NCJ_BASE_URL = 'http://localhost:8888';

    var uuid = (function() {
        var _uuid = null;
        return function(lawnchair) {
            if (lawnchair._wildcard) { return '*'; }
            if (!_uuid) {
                // try to get uuid from domStorage
                _uuid = domStorage.getItem(UUID_KEY);
            }
            if (!_uuid) {
                // create a new uuid (and store it)
                _uuid = lawnchair.uuid();
                domStorage.setItem(UUID_KEY, _uuid);
            }
            console.assert(_uuid);
            return _uuid;
        };
    })();

    // serialize parameters (borrowed then simplified from zepto.js)

    var $param = function(obj) {
        var escape = encodeURIComponent;
        var k, params = [];
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                params.push(escape(k) + '=' + escape(obj[k]));
            }
        }
        return params.join('&').replace(/%20/g, '+');
    };
    var appendQuery = function(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    };
    var doReq = function(method, url, params, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var result = null, error = false;
            if (xhr.readyState !== 4) { return; /* not interesting */ }
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status==304){
                result = xhr.responseText;
                try {
                    result = JSON.parse(result);
                } catch (e) { error = 'parsererror'; }
            } else {
                error = 'error';
            }
            callback(result, error);
        };
        var data = $param(params);
        if (method==='GET') { url = appendQuery(url, data); data = null; }
        xhr.open(method, NCJ_BASE_URL + url, true/*async*/);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        if (method==='POST') {
            xhr.setRequestHeader('Content-Type',
                                 'application/x-www-form-urlencoded');
        }
        if (data) { xhr.send(data); } else { xhr.send(); }
        return xhr;
    };
    // do a request with a 'cursor' in the callback
    var doMultipartReq = function(method, url, params, callback) {
        var r = [];
        var doOne = function(lastCursor) {
            if (lastCursor) { params.cursor = lastCursor; }
            doReq(method, url, params, function(result, error) {
                if (error) { callback(null, error); }
                if (result.result) { r.push.apply(r, result.result); }
                if (result.cursor) {
                    doOne(result.cursor);
                } else {
                    callback(r, false);
                }
            });
        };
        doOne(null);
    };

    var setVersion = function(obj, version) {
        // add non-enumerable property to obj
        Object.defineProperty(obj, "__version__", {
            value: version,
            enumerable: false
        });
    };

    return {
        valid: function() {
            if (!domStorage) { return false; }
            // xxx query the 'version' API on the server?
            return true;
        },
        init: function(options, callback) {
            this._wildcard = !!options.wildcard;
            uuid(this);
            this.fn(this.name, callback).call(this, this);
            return this;
        },
        save: function(obj, callback) {
            var key = obj.key || this.uuid();
            if (arguments.length > 2) {
                // store this value iff current value is still equal
                // to condObj (condObj is optional second argument)
                var condObj = arguments[1]; callback = arguments[2];
                if (!obj.key) { key = condObj.key || key; }
                doReq('POST', '/putif/'+uuid(this), {
                    dbname: this.name,
                    key:    key,
                    value:  JSON.stringify(obj),
                    version: condObj.__version__
                }, function(result, error) {
                    console.assert(!error);
                    if (callback) {
                        obj.key = key;
                        // extra arg to callback saying whether write was
                        // successful (or you could look at the object)
                        if (result.success) {
                            setVersion(obj, result.version);
                            this.lambda(callback).call(this, obj, true);
                        } else {
                            this.lambda(callback).call(this, condObj, false);
                        }
                    }
                }.bind(this));
                return this;
            }
            doReq('POST', '/put/'+uuid(this), {
                dbname: this.name,
                key:    key,
                value:  JSON.stringify(obj)
            }, function(result, error) {
                console.assert(!error);
                if (callback) {
                    obj.key = key;
                    setVersion(obj, result.version);
                    this.lambda(callback).call(this, obj);
                }
            }.bind(this));
            return this;
        },
        remove: function(keyOrArray, callback) {
            // handle case where we were given an array.
            if (this.isArray(keyOrArray)) {
                var i, left = keyOrArray.length;
                var done = function() {
                    // are we done with all the requests yet?
                    if ((--left) > 0) { return; }
                    if (callback) { this.lambda(callback).call(this); }
                }.bind(this);
                for (i=0; i<keyOrArray.length; i++) {
                    // recurse to handle a single key
                    this.remove(keyOrArray[i], done);
                }
                return;
            }
            // ok, now we only need to handle a single key.
            var key = keyOrArray.key ? keyOrArray.key: keyOrArray;
            doReq('POST', '/delete/'+uuid(this), {
                dbname: this.name,
                key:    key
            }, function(result, error) {
                console.assert(!error);
                if (callback) { this.lambda(callback).call(this); }
            }.bind(this));
            return this;
        },
        batch: function(objs, callback) {
            var i, r = [], left = objs.length;
            var doOne = function(i) {
                this.save(objs[i], function(val) {
                    r[i] = val;
                    if ((--left) > 0) { return; }
                    if (callback) { this.lambda(callback).call(this, r); }
                }.bind(this));
            }.bind(this);
            for (i=0; i<objs.length; i++) {
                doOne(i);
            }
            return this;
        },
        get: function(keyOrArray, callback) {
            // handle case where we were given an array.
            if (this.isArray(keyOrArray)) {
                var i, r = [], left = keyOrArray.length;
                var doOne = function(i) {
                    // recurse to handle a single key
                    this.get(keyOrArray[i], function(val) {
                        r[i] = val;
                        // are we done with all the requests yet?
                        if ((--left) > 0) { return; }
                        if (callback) { this.lambda(callback).call(this, r); }
                    }.bind(this));
                }.bind(this);
                for (i=0; i<keyOrArray.length; i++) {
                    doOne(i);
                }
                return this;
            }
            // ok, now we only need to handle a single key.
            doReq('GET', '/get/'+uuid(this), {
                dbname: this.name,
                key: keyOrArray
            }, function(result, error) {
                console.assert(!error);
                // result.value is null if key is not found.
                var r = result ? JSON.parse(result.value) : null;
                if (r) {
                    r.key = keyOrArray;
                    setVersion(r, result.version);
                }
                if (callback) { this.lambda(callback).call(this, r); }
            }.bind(this));
            return this;
        },
        exists: function(key, callback) {
            doReq('GET', '/exists/'+uuid(this), {
                dbname: this.name,
                key: key
            }, function(result, error) {
                console.assert(!error);
                if (callback) { this.lambda(callback).call(this, result); }
            }.bind(this));
            return this;
        },
        keys: function(callback) {
            doMultipartReq('GET', '/keys/'+uuid(this), { dbname: this.name }, function(result, error) {
                console.assert(!error);
                if (callback) { this.lambda(callback).call(this, result); }
            }.bind(this));
            return this;
        },
        all: function(callback) {
            doMultipartReq('GET', '/list/'+uuid(this), { dbname: this.name }, function(result, error) {
                console.assert(!error);
                result = result.map(function(obj) {
                    var r = JSON.parse(obj.value);
                    if (r) { r.key = obj.key; }
                    setVersion(r, obj.version);
                    return r;
                });
                if (callback) { this.lambda(callback).call(this, result); }
            }.bind(this));
            return this;
        },
        nuke: function(callback) {
            doMultipartReq('POST', '/nuke/'+uuid(this), { dbname: this.name }, function(result, error) {
                console.assert(!error);
                if (callback) { this.lambda(callback).call(this); }
            }.bind(this));
            return this;
        }
    };
})());

};
});

// Load lawnchair core and appropriate adapters.
define('src/lawnchair/lawnchair',['./core',
        // use these adapters, in this order (prefer the first)
        './adapters/indexed-db.js',
        './adapters/dom.js',
        './adapters/window-name.js',
        // nell-colors-journal will never be used unless it's
        // specifically asked for (since window-name will always be valid)
        './adapters/nell-colors-journal.js'], function(Lawnchair) {

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
                        return window.btoa(s).
                            replace(/\+/g,'-').replace(/\//g,'_');
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
    var DEBUG = false; // emit checkpoint logic debugging info to console

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
        this.brush = new Brush(Color.from_string('brown'), 'rect',
                               /*size*/20, /*opacity*/0.88, /*spacing*/0.12);
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
    Drawing.prototype.makeThumbnail = function(width, height) {
        var ncanvas = document.createElement('canvas');
        ncanvas.width = width;
        ncanvas.height = height;
        var context = ncanvas.getContext('2d');
        // thumbnails should be opaque, so we can store as JPEG
        context.fillStyle='white';
        context.fillRect(0,0,width,height);
        // scale to cover, ie no unused space in thumbnail
        var w = Math.max.apply(Math, this.layers.map(function(layer) {
            return layer.completedCanvas.width;
        }));
        var h = Math.max.apply(Math, this.layers.map(function(layer) {
            return layer.completedCanvas.height;
        }));
        var scale = Math.max(width/w, height/h);
        context.translate(width/2, height/2);
        context.scale(scale, scale);
        context.translate(-w/2, -h/2);
        this.layers.forEach(function(layer) {
            context.drawImage(layer.completedCanvas, 0, 0);
        });
        return ncanvas;
    };
    Drawing.prototype._saveCheckpoint = function() {
        if (DEBUG) {
            console.log('creating checkpoint ' +
                        this.commands.last + '/' + this.commands.length);
        }
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
    Drawing.Layer = Layer;

    return Drawing;
});

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

define("json!src/fontmetrics.json", function(){ return {"0":{"cx":0,"cy":-34.5,"w":47,"h":68,"fw":59,"fh":80},"1":{"cx":-3.5,"cy":-35,"w":22,"h":67,"fw":34,"fh":79},"2":{"cx":0.5,"cy":-36,"w":40,"h":67,"fw":52,"fh":79},"3":{"cx":0,"cy":-34,"w":39,"h":67,"fw":51,"fh":79},"4":{"cx":-1,"cy":-35,"w":45,"h":67,"fw":57,"fh":79},"5":{"cx":0.5,"cy":-33.5,"w":40,"h":66,"fw":52,"fh":78},"6":{"cx":0.5,"cy":-34,"w":40,"h":67,"fw":52,"fh":79},"7":{"cx":1,"cy":-34.5,"w":37,"h":66,"fw":49,"fh":78},"8":{"cx":0.5,"cy":-34.5,"w":40,"h":68,"fw":52,"fh":80},"9":{"cx":-0.5,"cy":-35,"w":40,"h":67,"fw":52,"fh":79},"font":"100px Delius","textAlign":"center","textBaseline":"alphabetic","outerOutline":6,"innerOutline":3,"A":{"cx":0,"cy":-38,"w":51,"h":71,"fw":63,"fh":83},"B":{"cx":0.5,"cy":-37,"w":50,"h":73,"fw":62,"fh":85},"C":{"cx":2,"cy":-37,"w":51,"h":73,"fw":63,"fh":85},"D":{"cx":-0.5,"cy":-37,"w":54,"h":73,"fw":66,"fh":85},"E":{"cx":0.5,"cy":-37.5,"w":44,"h":70,"fw":56,"fh":82},"F":{"cx":0.5,"cy":-37,"w":44,"h":71,"fw":56,"fh":83},"G":{"cx":0.5,"cy":-37,"w":56,"h":73,"fw":68,"fh":85},"H":{"cx":0,"cy":-37.5,"w":57,"h":72,"fw":69,"fh":84},"I":{"cx":0.5,"cy":-37.5,"w":30,"h":70,"fw":42,"fh":82},"J":{"cx":0,"cy":-37,"w":39,"h":71,"fw":51,"fh":83},"K":{"cx":5,"cy":-37.5,"w":45,"h":72,"fw":57,"fh":84},"L":{"cx":4,"cy":-38,"w":35,"h":71,"fw":47,"fh":83},"M":{"cx":0,"cy":-37,"w":55,"h":71,"fw":67,"fh":83},"N":{"cx":0,"cy":-37.5,"w":43,"h":72,"fw":55,"fh":84},"O":{"cx":0.5,"cy":-37,"w":60,"h":73,"fw":72,"fh":85},"P":{"cx":2,"cy":-38,"w":45,"h":73,"fw":57,"fh":85},"Q":{"cx":0.5,"cy":-30,"w":58,"h":87,"fw":70,"fh":99},"R":{"cx":2.5,"cy":-37.5,"w":50,"h":72,"fw":62,"fh":84},"S":{"cx":0,"cy":-37,"w":41,"h":73,"fw":53,"fh":85},"T":{"cx":1,"cy":-37,"w":41,"h":71,"fw":53,"fh":83},"U":{"cx":0.5,"cy":-37,"w":44,"h":73,"fw":56,"fh":85},"V":{"cx":0.5,"cy":-37.5,"w":52,"h":72,"fw":64,"fh":84},"W":{"cx":0,"cy":-37.5,"w":79,"h":72,"fw":91,"fh":84},"X":{"cx":1.5,"cy":-37,"w":52,"h":73,"fw":64,"fh":85},"Y":{"cx":0.5,"cy":-37.5,"w":46,"h":72,"fw":58,"fh":84},"Z":{"cx":0.5,"cy":-37.5,"w":44,"h":70,"fw":56,"fh":82},"a":{"cx":1,"cy":-25,"w":43,"h":47,"fw":55,"fh":59},"b":{"cx":1.5,"cy":-37.5,"w":38,"h":72,"fw":50,"fh":84},"c":{"cx":1,"cy":-24.5,"w":37,"h":48,"fw":49,"fh":60},"d":{"cx":1,"cy":-37.5,"w":45,"h":72,"fw":57,"fh":84},"e":{"cx":-0.5,"cy":-24.5,"w":42,"h":48,"fw":54,"fh":60},"f":{"cx":1.5,"cy":-37.5,"w":26,"h":72,"fw":38,"fh":84},"g":{"cx":-0.5,"cy":-14,"w":38,"h":69,"fw":50,"fh":81},"h":{"cx":2.5,"cy":-37.5,"w":42,"h":72,"fw":54,"fh":84},"i":{"cx":0,"cy":-35.5,"w":3,"h":68,"fw":15,"fh":80},"j":{"cx":-3,"cy":-26,"w":11,"h":87,"fw":23,"fh":99},"k":{"cx":2,"cy":-37.5,"w":35,"h":72,"fw":47,"fh":84},"l":{"cx":0.5,"cy":-37.5,"w":2,"h":72,"fw":14,"fh":84},"m":{"cx":2.5,"cy":-25,"w":72,"h":47,"fw":84,"fh":59},"n":{"cx":2.5,"cy":-25,"w":42,"h":47,"fw":54,"fh":59},"o":{"cx":0,"cy":-24.5,"w":41,"h":48,"fw":53,"fh":60},"p":{"cx":1,"cy":-14,"w":41,"h":69,"fw":53,"fh":81},"q":{"cx":-0.5,"cy":-14,"w":38,"h":69,"fw":50,"fh":81},"r":{"cx":3,"cy":-25,"w":27,"h":47,"fw":39,"fh":59},"s":{"cx":-0.5,"cy":-25,"w":32,"h":47,"fw":44,"fh":59},"t":{"cx":0,"cy":-32.5,"w":23,"h":62,"fw":35,"fh":74},"u":{"cx":1,"cy":-24.5,"w":43,"h":46,"fw":55,"fh":58},"v":{"cx":0.5,"cy":-25,"w":38,"h":47,"fw":50,"fh":59},"w":{"cx":0.5,"cy":-24.5,"w":68,"h":46,"fw":80,"fh":58},"x":{"cx":1,"cy":-24.5,"w":39,"h":48,"fw":51,"fh":60},"y":{"cx":-0.5,"cy":-14,"w":38,"h":69,"fw":50,"fh":81},"z":{"cx":1,"cy":-25,"w":35,"h":45,"fw":47,"fh":57}};});

// encapsulate Funf functionality
define('src/funf',[], function() {
    var DEBUG = false; // dump funf output to console

    var FUNF_ACTION_RECORD = 'edu.mit.media.funf.RECORD';
    var FUNF_ACTION_ARCHIVE = 'edu.mit.media.funf.ARCHIVE';
    var FUNF_DATABASE_NAME = 'mainPipeline';

    var Funf = function(appName) {
        console.assert(appName.indexOf('-') < 0,
                       "funf doesn't like hyphens in the appName");
        this.appName = appName;
    };
    Funf.prototype = {};
    Funf.prototype.record = function(name, value) {
        if (typeof value === 'object' /* includes arrays */) {
            // protect complex values from funf flattening
            value = JSON.stringify(value);
        }
        if (DEBUG) { console.log('FUNF '+name+' / '+value); }
        try {
            // send custom event; there's a Firefox add-on which will
            // turn this into an Android Intent:
            //     https://github.com/cscott/intent-addon
            var event = document.createEvent('CustomEvent');
            var o = { name: name, value: value, millis: Date.now() };
            var intent = {
                action: FUNF_ACTION_RECORD,
                method: 'sendBroadcast',
                extras: {
                    DATABASE_NAME: FUNF_DATABASE_NAME,
                    TIMESTAMP: Math.floor(Date.now()/1000),
                    NAME: this.appName,
                    VALUE: JSON.stringify(o)
                }
	    };
            event.initCustomEvent("intent-addon", true, true, intent);
	    document.documentElement.dispatchEvent(event);
        } catch(e) {
            console.log("Sending custom event failed: "+e);
        }
    };
    Funf.prototype.archive = function() {
        try {
            var event = document.createEvent('CustomEvent');
            var intent = {
                action: FUNF_ACTION_ARCHIVE,
                method: 'sendBroadcast',
                extras: {
                    DATABASE_NAME: FUNF_DATABASE_NAME
                }
	    };
            event.initCustomEvent("intent-addon", true, true, intent);
	    document.documentElement.dispatchEvent(event);
        } catch(e) {
            console.log("Sending custom event failed: "+e);
        }
    };
    return Funf;
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
        hold_timeout       : 500,

        // apply a 'hover' class to the element as soon as it is touched
        apply_hover        : false,
        // only bind touch events (mouse events use native DnD, say)
        only_touch         : false
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
                if (options.apply_hover) {
                    element.classList.add('hover');
                }

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
                if (options.apply_hover) {
                    element.classList.remove('hover');
                }

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
    else if (!options.only_touch) {

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
    if (options.prevent_default && !options.only_touch) {
        // prevent 'click' and 'contextmenu' events from being fired, too.
        if (element.addEventListener) {
            element.addEventListener('click', cancelEvent, false);
            element.addEventListener('contextmenu', cancelEvent, false);
        } else {
            element.attachEvent('click', cancelEvent);
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
define('src/samples',['require'], function(require) {

    /* A list of samples currently included with nell-colors, and
     * a method to load them. */

    var SAMPLE_DESCRIPTIONS = {
        'castle': 'A drawing of a gloomy castle',
        'intro':  'The XO Colors activity startup screen',
        'lounge': 'A sketch of some people in a lounge',
        'r':      'Capital letter R, in dotted lines',
        'roger':  'The words ROGER and RED',
        'tree':   'Tree & balloon, from xoom',
        'stick':  'Stick figure holding balloon',
        'balloon':'Balloon in field'
    };

    return {
        exists: function(uuid) {
            return SAMPLE_DESCRIPTIONS.hasOwnProperty(uuid);
        },
        load: function(uuid, callback) {
            require(['drw!samples/'+uuid+'.json'], callback);
        }
    };
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/sync',['./drawing', './lzw', './lawnchair/lawnchair', './samples'], function(Drawing, LZW, Lawnchair, Samples) {
    var DEBUG = false;
    var TOP = 'top';
    // keep these constants in sync with .gallery rule in ncolors.css
    // (proportions should match, but we might want to account for some
    //  CSS-pixel-to-device-pixel scaling here)
    var THUMB_WIDTH = 160, THUMB_HEIGHT = 120;

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

    var addToIndex = function(drawing, adapter, callback) {
        Lawnchair({name:'drawing_index', adapter:adapter}, function() {
            var lawnchair = this;
            var thumb = drawing.makeThumbnail(THUMB_WIDTH, THUMB_HEIGHT);
            lawnchair.save({
                key: drawing.uuid,
                thumb: JSON.stringify(new Drawing.Layer.Checkpoint(thumb,true)),
                ctime: drawing.ctime,
                mtime: Date.now()
            }, function() {
                callback.call(drawing);
            });
        });
    };
    var removeFromIndex = function(uuid, adapter, callback) {
        Lawnchair({name:'drawing_index', adapter:adapter}, function() {
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
                // second arg is a list of promises for the thumbnails
                //  ie, a function which you can call with a callback which
                //      will then get invoked with a decoded <canvas>
                callback(results.map(function(r) { return r.key; }),
                         results.map(function(r) {
                             if (!r.thumb) { return null; /* no thumbnail */}
                             return function(callback) {
                                 var cb = function(layerCheckpoint) {
                                     callback(layerCheckpoint.canvas);
                                 };
                                 Drawing.Layer.Checkpoint.fromJSON(r.thumb,cb);
                             };
                         }));
            });
        });
    };

    Sync['delete'] = function(uuid, where, callback) {
        var lawnchairParams = { name: 'drawing.'+uuid };
        if (where === 'remote') {
            lawnchairParams.adapter = 'nell-colors-journal';
        }
        removeFromIndex(uuid, lawnchairParams.adapter, function() {
            Lawnchair(lawnchairParams, function() {
                this.nuke(callback, true);
            });
        });
    };

    Sync.load = function(uuid, where, callback) {
        if (where==='sample') {
            return Samples.load(uuid, callback);
        }
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
        var lawnchairParams = { name: 'drawing.'+uuid };
        if (where === 'remote') {
            lawnchairParams.adapter = 'nell-colors-journal';
            lawnchairParams.wildcard = true;
        }
        Lawnchair(lawnchairParams, function() { withLawnchair(this); });
    };

    Sync.exists = function(uuid, callback) {
        if (Samples.exists(uuid)) {
            return callback(true, 'sample');
        }
        var lawnchairParams = { name: 'drawing.'+uuid };
        Lawnchair(lawnchairParams, function() {
            var lawnchair = this;
            lawnchair.exists(TOP, function(exists) {
                if (exists) {
                    callback(true, 'local');
                } else if (window.navigator && window.navigator.onLine) {
                    lawnchairParams.adapter = 'nell-colors-journal';
                    lawnchairParams.wildcard = true;
                    Lawnchair(lawnchairParams, function() {
                        var lawnchair = this;
                        lawnchair.exists(TOP, function(exists) {
                            callback(exists, 'remote');
                        });
                    });
                } else {
                    callback(false, 'local');
                }
            });
        });
    };

    Sync.save = function(drawing, callback, optForce) {
        console.assert(drawing.uuid);
        var saveWithLawnchair = function(lawnchair, dj, callback) {
            var wrapUp = function() {
                if (DEBUG) { console.log('writing', drawing.uuid); }
                lawnchair.save({ key: TOP, data: dj }, function() {
                    addToIndex(drawing, lawnchair.adapter, callback);
                });
            };
            var chunk = dj.nChunks;
            var saveChunk = function() {
                chunk--;
                if (chunk < 0) {
                    wrapUp();
                } else {
                    getDefault(lawnchair, ''+chunk, null, function(c) {
                        if (chunk >= drawing.chunks.length) {
                            // whoops, we're stale!
                            // XXX clean up written chunks
                            // bail
                            callback.call(drawing);
                        }
                        // XXX we should check to be sure this chunk's UUID
                        // still matches what we expect it to be.
                        if (c && c.uuid === drawing.chunks[chunk].uuid) {
                            // all the rest of the chunks are up to date
                            wrapUp();
                        } else {
                            if (DEBUG) { console.log('writing', chunk); }
                            drawing.chunks[chunk].checkpoint = false;
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
        var dj = drawing.toJSON('use chunks');
        var withLawnchair = function(callback) {
            return function() {
                var lawnchair = this;
                var s = function() {
                    saveWithLawnchair(lawnchair, dj, callback);
                };
                if (optForce) {
                    lawnchair.nuke(s);
                } else {
                    s();
                }
            };
        };
        var lawnchairParams = { name: 'drawing.'+drawing.uuid };
        // save locally.
        Lawnchair(lawnchairParams, withLawnchair(function() {
            if (window.navigator && window.navigator.onLine) {
                // try to save to cloud
                if (DEBUG) { console.log('saving to cloud'); }
                lawnchairParams.adapter = 'nell-colors-journal';
                dj.checkpoints = [];
                Lawnchair(lawnchairParams, withLawnchair(callback));
            } else {
                callback.call(drawing);
            }
        }));
    }
    return Sync;
});

/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define('src/gallery',['domReady!','./compat','./coords','../lib/hammer', './sync'], function(document, Compat, Coords, Hammer, Sync) {
    var firstGallery = true;

    var useNativeDnD = ('ondragstart' in document.createElement('a'));
    // might have to use browser sniffing (sigh) to identify browsers
    // on which we can't rely on the native DnD support, since
    // Firefox/Android (at least) implements ondragstart, it just
    // never invokes it.  But at the moment the touch support on
    // Firefox/Android works fine even if we register ondragstart.

    var Gallery = function(funf, toolbarPort) {
        this.domElement = document.createElement('div');
        this.domElement.classList.add('gallery');
        this.funf = funf;
        this.toolbarPort = toolbarPort;
        this.first = firstGallery;
        firstGallery = false;
        // start populating with thumbnails
        Sync.list(this._populate.bind(this));
    };
    Gallery.prototype = {};
    Gallery.prototype._populate = function(uuids, thumbnails) {
        // record number of thumbnails via funf
        this.funf.record('gallery', { drawings: uuids.length });
        var toolbarPort = this.toolbarPort;
        var addUUID = function(uuid, idx) {
            var a = document.createElement('a');
            a.href='./#' + uuid; // for iOS
            a.className = 'UUID-' + uuid; // class must start with [_a-zA-Z]
            a.textContent = uuid; // hidden by thumbnail (if present)
            this.domElement.appendChild(a);
            a.addEventListener('click', function(event) {
                event.preventDefault();
                this._callback(uuid);
            }.bind(this), false);
            a.addEventListener('contextmenu', function(event) {
                event.preventDefault();
            }, false);

            // make bookmarkable URL for this document
            var url = document.URL.
                // strip document hash and 'ncolors.html'
                replace(/#[^#]*$/, '').replace(/[\/][^\/]*$/, '') +
                // add uuid for this document.
                '/#' + uuid;
            a.addEventListener('dragstart', function(event) {
                if (uuid==='new') { event.preventDefault(); return; }
                event.dataTransfer.items.add(uuid, 'text/x-nell-colors');
                event.dataTransfer.items.add(url, 'text/uri-list');
                event.dataTransfer.items.add(url, 'text/plain');
                a.classList.add('dragging');
            }, false);
            a.addEventListener('dragend', function(event) {
                a.classList.remove('dragging');
            }, false);

            if (uuid === 'new') { return; }

            a.draggable = true;

            var thumbUrl;
            var raiseDragShadow = function(isTouch) {
                var bbInner = Coords.getAbsolutePosition(a);
                toolbarPort.postMessage(JSON.stringify({
                    type: 'drag-shadow',
                    uuid: uuid,
                    show: true,
                    dragging: isTouch,
                    x: bbInner.x,
                    y: bbInner.y,
                    thumb: thumbUrl,
                    captureEvents: !isTouch
                }));
            };
            if (!useNativeDnD) {
                var that = this;
                a.addEventListener('mouseover', function(event) {
                    raiseDragShadow(false);
                }, false);
                a.addEventListener('mouseout', function(event) {
                    var related = event.relatedTarget, target = this;
                    // For mousenter/leave call the handler if related is
                    // outside the target.
                    // NB: No relatedTarget if the mouse left/entered the
                    // browser window
                    if (!related ||
                        (related !== target && !target.contains(related))) {
                        // emualate mouseleave event
                        toolbarPort.postMessage(JSON.stringify({
                            type: 'drag-shadow',
                            uuid: uuid,
                            show: false,
                        }));
                    }
                }, false);
            }
            var hammer = new Hammer(a, {
                only_touch: true,
                apply_hover: true,
                prevent_default: true,
                css_hacks: false,
                drag_min_distance: 5,
                transform: false,
                tap_double: false,
                hold: false
            });
            hammer.ontap = function(event) {
                // needed on touch platforms, since prevent default prevents
                // both scrolling during drag (which we need) and the click
                // event (which we'd like to have, oh well)
                this._callback(uuid);
            }.bind(this);
            hammer.ondragstart = function(event) {
                raiseDragShadow(true/*is touch*/);
            };
            hammer.ondrag = function(event) {
                toolbarPort.postMessage(JSON.stringify({
                    type: 'drag-shadow-move',
                    x: event.distanceX,
                    y: event.distanceY
                }));
            };
            hammer.ondragend = function(event) {
                toolbarPort.postMessage(JSON.stringify({
                    type: 'drag-shadow-drop'
                }));
            };

            // decode thumbnail
            if (thumbnails[idx]) {
                thumbnails[idx](function(canvas) {
                    a.appendChild(canvas);
                    window.setTimeout(function() {
                        // convert to jpeg in timeout so we don't delay the
                        // initial appearance of the gallery thumbs
                        thumbUrl = canvas.toDataURL('image/jpeg');
                        // log thumbnail to funf when we first start
                        // each thumbnail is 16k when a PNG; half that as a JPEG
                        // to save space we don't use toDataURLHD here
                        if (this.first) {
                            this.funf.record('thumb', { uuid: uuid,
                                                        data: thumbUrl });
                        }
                    }.bind(this), 100);
                }.bind(this));
            }
        }.bind(this);
        uuids.forEach(addUUID);
        // make "new document" element
        addUUID('new', -1);
    };
    Gallery.prototype.trash = function(uuid) {
        Sync['delete'].call(Sync, uuid, 'local', function() {
            var a = this.domElement.querySelector('a.UUID-'+uuid);
            this.domElement.removeChild(a);
        }.bind(this));
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
        'webm': 'audio/webm',
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
            try {
                audio.currentTime = 0;
            } catch (e) {
                console.log("AUDIO PROBLEM: "+e);
            }
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

define('src/version',[], function() {
    // the version of the nell-colors source code.
    return "1";
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

/* canvas-toBlob.js
 * A canvas.toBlob() implementation.
 * 2011-07-13
 * 
 * By Eli Grey, http://eligrey.com and Devin Samarin, https://github.com/eboyjr
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global self */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/canvas-toBlob.js/blob/master/canvas-toBlob.js */

define('lib/canvas-toBlob',[], function() {

var view = window;
var
	  Uint8Array = view.Uint8Array
	, HTMLCanvasElement = view.HTMLCanvasElement
	, is_base64_regex = /\s*;\s*base64\s*(?:;|$)/i
	, base64_ranks
	, decode_base64 = function(base64) {
		var
			  len = base64.length
			, buffer = new Uint8Array(len / 4 * 3 | 0)
			, i = 0
			, outptr = 0
			, last = [0, 0]
			, state = 0
			, save = 0
			, rank
			, code
			, undef
		;
		while (len--) {
			code = base64.charCodeAt(i++);
			rank = base64_ranks[code-43];
			if (rank !== 255 && rank !== undef) {
				last[1] = last[0];
				last[0] = code;
				save = (save << 6) | rank;
				state++;
				if (state === 4) {
					buffer[outptr++] = save >>> 16;
					if (last[1] !== 61 /* padding character */) {
						buffer[outptr++] = save >>> 8;
					}
					if (last[0] !== 61 /* padding character */) {
						buffer[outptr++] = save;
					}
					state = 0;
				}
			}
		}
		// 2/3 chance there's going to be some null bytes at the end, but that
		// doesn't really matter with most image formats.
		// If it somehow matters for you, truncate the buffer up outptr.
		return buffer.buffer;
	}
;
if (Uint8Array) {
	base64_ranks = new Uint8Array([
		  62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1
		, -1, -1,  0, -1, -1, -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9
		, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
		, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
		, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
	]);
}
var makeToBlob;
if (HTMLCanvasElement) {
    makeToBlob = function(isHD) {
	return function(callback, type /*, ...args*/) {
		  if (!type) {
			type = "image/png";
		} if (this.mozGetAsFile && !isHD) {
			callback(this.mozGetAsFile("canvas", type));
			return;
		}
		var
			  args = Array.prototype.slice.call(arguments, 1)
	                , dataURI = (isHD ? this.toDataURLHD : this.toDataURL).apply(this, args)
			, header_end = dataURI.indexOf(",")
			, data = dataURI.substring(header_end + 1)
			, is_base64 = is_base64_regex.test(dataURI.substring(0, header_end))
			, BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder
			, bb = new BlobBuilder
			, blob
		;
		if (BlobBuilder.fake) {
			// no reason to decode a data: URI that's just going to become a data URI again
			blob = bb.getBlob(type);
			if (is_base64) {
				blob.encoding = "base64";
			} else {
				blob.encoding = "URI";
			}
			blob.data = data;
			blob.size = data.length;
		} else if (Uint8Array) {
			if (is_base64) {
				bb.append(decode_base64(data));
			} else {
				bb.append(decodeURIComponent(data));
			}
			blob = bb.getBlob(type);
		}
		callback(blob);
	};
    };
}
if (HTMLCanvasElement && !HTMLCanvasElement.prototype.toBlob) {
    HTMLCanvasElement.prototype.toBlob = makeToBlob(false);
}
if (HTMLCanvasElement && HTMLCanvasElement.prototype.toDataURLHD && !HTMLCanvasElement.prototype.toBlobHD) {
    HTMLCanvasElement.prototype.toBlobHD = makeToBlob(true);
}
    return HTMLCanvasElement && HTMLCanvasElement.prototype.toBlob;
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
                data.active = function() {
                    onLoad(true);
                };
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
define('ncolors',['domReady!', /*'./src/audio-map.js',*/ './src/brush', './src/brushdialog', './src/color', './src/compat', './src/dom', './src/drawcommand', './src/drawing', 'json!./src/fontmetrics.json', './src/funf', './src/gallery', './lib/hammer', './src/layer', './src/lzw', './src/nodefault', './src/postmessage', './src/prandom!', './src/recog', './src/sound', './src/sync', './src/version', './lib/BlobBuilder', './lib/canvas-toBlob', './lib/FileSaver', 'font!custom,families:[Delius,DejaVu LGC Sans Book],urls:[fonts/style.css]'], function(document, /*audioMap,*/ Brush, BrushDialog, Color, Compat, Dom, DrawCommand, Drawing, FontMetrics, Funf, Gallery, Hammer, Layer, LZW, noDefault, postMessage, prandom, Recog, Sound, Sync, version, BlobBuilder, canvasToBlob, saveAs) {
    
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

    // start up Funf logger
    var funf = new Funf('NellColors'+version);
    funf.record('startVersion', version);

    // transfer 'dev' tag from parent to this context
    if (window.parent.document.body.classList.contains('dev')) {
        document.body.classList.add('dev');
    } else {
        SHOW_FRAME_RATE = false;
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
    // brush dialog
    var brushdialog = new BrushDialog(document.getElementById('brushdialog'),
                                      true /* hide pane selector */);

    var maybeRequestAnim, removeRecogCanvas;
    var updateToolbarBrush, replaceDrawing, maybeSyncDrawing;
    var doTrash = null;

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
        toolbarPort.postMessage(JSON.stringify({type:'stopping'}));
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
                if (playbackInfo.speed === INSTANTANEOUS) {
                    toolbarPort.postMessage(JSON.stringify({type:'stopping'}));
                } else {
                    toolbarPort.postMessage(JSON.stringify({type:'playing'}));
                }
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
            removeRecogCanvas();
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
            funf.record('stroke', {});
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
                                       instances: 1,
                                       formats: ['webm'] });
        }
        audio_snippets[id] = audio;
        });

    removeRecogCanvas = function() {
        var lastRecogCanvas = drawingElem.querySelector('canvas.recogCanvas');
        if (lastRecogCanvas) {
            lastRecogCanvas.style.display = 'none';
        }
    };
    var handleRecog = function(model, prob, bbox) {
        if (prob < 400) { removeRecogCanvas(); return; }
        var letter = model.charAt(0);
        funf.record('recog', { model: model, prob: prob, bbox: bbox });

        // draw recognized letter on "recognition canvas"
        var w = bbox.br.x - bbox.tl.x, h = bbox.br.y - bbox.tl.y;
        var metrics = FontMetrics[letter];
        var c = drawingElem.querySelector('canvas.recogCanvas');
        if (!c) {
            // create & append canvas if not already present.
            c = document.createElement('canvas');
            c.className = 'recogCanvas';
            c.style.position='absolute';
            c.style.opacity = 0.75;
            if (document.body.classList.contains('dev')) {
                c.style.border="1px dashed #ccc";
            }
            drawingElem.appendChild(c);
        }
        c.style.display = 'block';
        // compute 'cover' scale
        var scale = Math.min(w/metrics.w, h/metrics.h);
        // make canvas the right size.
        c.width = Math.ceil(scale * metrics.fw);
        c.height = Math.ceil(scale * metrics.fh);
        c.style.width = c.width + 'px';
        c.style.height = c.height + 'px';
        var ctxt = c.getContext('2d');
        ctxt.clearRect(0,0,c.width,c.height);
        // draw the letter inside this box
        ctxt.font = FontMetrics.font;
        ctxt.textAlign = FontMetrics.textAlign;
        ctxt.textBaseline = FontMetrics.textBaseline;
        ctxt.translate(c.width/2, c.height/2);
        ctxt.scale(scale, scale);
        ctxt.translate(-metrics.cx, -metrics.cy);

        ctxt.strokeStyle='white';
        ctxt.lineWidth=FontMetrics.outerOutline;
        ctxt.strokeText(letter, 0, 0);

        ctxt.strokeStyle='black';
        ctxt.lineWidth=FontMetrics.innerOutline;
        ctxt.strokeText(letter, 0, 0);

        ctxt.fillStyle = drawing.brush.color.to_string().replace(/..$/,'');
        ctxt.fillText(letter, 0, 0);

        // position the canvas: align center w/ center of bbox
        var bbcx = (bbox.tl.x + bbox.br.x)/2;
        var bbcy = (bbox.tl.y + bbox.br.y)/2;
        c.style.left = Math.round(bbcx - (c.width/2)) + 'px';
        c.style.top  = Math.round(bbcy - (c.height/2)) + 'px';

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

    var updateColor = function(rgbColor, opacity) {
        var msg = {
            type: 'color',
            red: rgbColor.red,
            green: rgbColor.green,
            blue: rgbColor.blue,
            opacity: opacity
        };
        toolbarPort.postMessage(JSON.stringify(msg));
    };
    updateToolbarBrush = (function() {
        // don't post redundant updates (ie, while drawing!)
        var lastBrush = new Brush(), first = true;
        return function() {
            if (lastBrush.equals(drawing.brush) && !first) {
                return; // already up to date
            }
            lastBrush.set_from_brush(drawing.brush);
            first = false;
            updateColor(drawing.brush.color, drawing.brush.opacity);
            var msg = {
                type: 'brush',
                brush_type:  drawing.brush.type,
                size:  drawing.brush.size,
                opacity: drawing.brush.opacity,
                spacing: drawing.brush.spacing
            };
            toolbarPort.postMessage(JSON.stringify(msg));
            if (brushdialog.isOpen()) {
                brushdialog.updateBrush(drawing.brush,
                                        true/*preserve old color*/);
            }
            // XXX update undo/redo active as well.
        };
    }());
    brushdialog.colorCallback = function(hslColor) {
        updateColor(hslColor.rgbaColor(), hslColor.opacity/255);
    };

    var handleMaskClick = null;
    (function(mask) {
        mask.addEventListener('click', noDefault(function(event) {
            if (handleMaskClick) { handleMaskClick(); }
        }));
        // ignore double taps / long taps / right clicks
        mask.addEventListener('contextmenu', noDefault(), false);
        mask.addEventListener('dblclick', noDefault(), false);
    })(document.querySelector('#mask'));

    var handleBrushDialog = function(brush) {
        var caughtUp = (drawing.commands.last === drawing.commands.end);
        document.body.classList.remove('mask');
        handleMaskClick = null;
        toolbarPort.postMessage(JSON.stringify({
            type: 'toolbar-mode-switch',
            mode: 'drawing'
        }));

        if (caughtUp && brush.equals(drawing.brush)) { return; }

        var opts = {}, brush_change = false;
        ['type','size','opacity','spacing'].forEach(function(f) {
            if (brush[f] === drawing.brush[f]) { return; }
            opts[(f==='type') ? 'brush_type' : f] = brush[f];
            brush_change = true;
        });
        if (brush_change) {
            drawing.addCmd(DrawCommand.create_brush_change(opts));
        }
        if (!Color.equal(drawing.brush.color, brush.color)) {
            drawing.addCmd(DrawCommand.create_color_change(brush.color));
        }
        if (caughtUp) {
            drawing.setCmdPos(Drawing.END); // update drawing.brush
            updateToolbarBrush();
        }
    };
    var openOrSwitchBrushDialog = function(pane) {
        if (brushdialog.isOpen()) {
            if (brushdialog.currentPane() !== pane) {
                brushdialog.switchPane(pane);
            } else {
                brushdialog.close(true);
            }
        } else {
            brushdialog.open(drawing.brush, pane, handleBrushDialog);
            document.body.classList.add('mask');
            handleMaskClick = function() { brushdialog.close(true); };
            toolbarPort.postMessage(JSON.stringify({
                type: 'toolbar-mode-switch',
                mode: 'brushdialog'
            }));
        }
    };

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
    var doSave = function(asJson) {
        var json = JSON.stringify(drawing, null, 1);
        var mimetype, filename;
        var blob, blobUrl;
        if (asJson) {
            mimetype = "text/plain;charset=ascii";
            filename = 'drawing.json';
            try {
                blob = new window.Blob([json], {type: mimetype});
            } catch (e) {
                var bb = new BlobBuilder();
                bb.append(json);
                blob = bb.getBlob(mimetype);
            }
            saveAs(blob, 'drawing.json');
        } else {
            // hack: encode json as a PNG so that we can export it from
            // android (!)
            mimetype = 'image/png';
            filename = 'drawing-json.png';
            var bytes = LZW.encode(json, true/* to utf8 */);
            // stick in an extra byte to indicate exact length
            bytes = String.fromCharCode((bytes.length+1) % 3) + bytes;
            var size = Math.ceil(Math.sqrt(bytes.length/3));
            var c = document.createElement('canvas');
            var ctxt = c.getContext('2d');
            var createImageData= ctxt.createImageDataHD || ctxt.createImageData;
            // some shenanigans to ensure that HD image has enough pixels.
            var idata = createImageData.call(ctxt, 100, 1);
            var scale = idata.width/100;
            c.width = Math.ceil(size/scale);
            c.height = Math.ceil(bytes.length/(3*scale*size));
            idata = createImageData.call(ctxt, c.width, c.height);
            console.assert(idata.width*idata.height*3 >= bytes.length);
            var i;
            for (i=0; i < bytes.length/3; i++) {
                idata.data[i*4+0] = bytes.charCodeAt(i*3+0) || 0;
                idata.data[i*4+1] = bytes.charCodeAt(i*3+1) || 0;
                idata.data[i*4+2] = bytes.charCodeAt(i*3+2) || 0;
                idata.data[i*4+3] = 255; // avoid problems w/ premult alpha
            }
            var putImageData = ctxt.putImageDataHD || ctxt.putImageData;
            putImageData.call(ctxt, idata, 0, 0);
            var toBlobHD = c.toBlob || c.toBlobHD;
            blob = toBlobHD.call(c, function(blob) {
                saveAs(blob, filename);
            }, mimetype);
        }
    };
    var doSave1 = function() {
        console.log('saving', drawing.uuid);
        Sync.save(drawing, function() {
            console.log('saved!', drawing.uuid);
            Sync.load(drawing.uuid, 'local', function(ndrawing) {
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
        funf.record('toolbar', msg);
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
            if (caughtUp && (!brushdialog.isOpen()) &&
                Color.equal(drawing.brush.color, color) &&
                drawing.brush.opacity===1) {
                break;
            }
            drawing.addCmd(DrawCommand.create_color_change(color));
            /* force color to be opaque, and respect current brush if
             * brush dialog is open. */
            var opts = {};
            if (brushdialog.isOpen()) {
                var brush = brushdialog.currentBrush();
                ['type','size','opacity','spacing'].forEach(function(f) {
                    opts[(f==='type') ? 'brush_type' : f] = brush[f];
                });
            }
            opts.opacity = 1; // force opaque
            drawing.addCmd(DrawCommand.create_brush_change(opts));
            if (caughtUp) {
                drawing.setCmdPos(Drawing.END); // update drawing.brush immed.
                updateToolbarBrush();
            }
            break;

        case 'colorButton':
            openOrSwitchBrushDialog('color');
            break;
        case 'brushButton':
            openOrSwitchBrushDialog('brush');
            break;

        case 'playButton':
            if (playbackInfo.isPlaying &&
                playbackInfo.speed !== INSTANTANEOUS) {
                if (false) {
                    // old behavior: speed up playback
                    playbackInfo.speed *= 4;
                } else {
                    // new behavior: skip to end (if possible)
                    maybeHaltPlayback();
                }
            } else {
                startPlayback();
            }
            break;
        case 'saveButton':
            doSave('json');
            break;
        case 'trashButton':
            /* ignore; this button is meant to be dropped not clicked */
            break;
        case 'trashDrop':
            if (doTrash) { doTrash(msg.uuid); }
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
        toolbarPort.postMessage(JSON.stringify({
            type: 'toolbar-mode-switch',
            mode: 'drawing'
        }));
        funf.record('mode', {
            name: 'drawing',
            uuid: drawing.uuid,
            length: drawing.commands.length // identify new/existing drawings
        });
        // newly loaded sample drawings need to be saved w/ their new UUID
        if (optForceSave) {
            maybeSyncDrawing();
        }
    };

    var loadDrawing = function(uuid, callback) {
        var nd, gallery;
        document.getElementById("loading").style.display="block";
        toolbarPort.postMessage(JSON.stringify({
            type: 'toolbar-mode-switch',
            mode: 'loading'
        }));
        switch(uuid) {
        case '':
        case 'gallery':
            gallery = new Gallery(funf, toolbarPort);
            gallery.wait(function(uuid) {
                // hide the gallery and load the new drawing
                document.body.removeChild(gallery.domElement);
                doTrash = null;
                loadDrawing(uuid, callback);
            });
            doTrash = function(uuid) {
                gallery.trash(uuid);
            };
            document.body.appendChild(gallery.domElement);
            toolbarPort.postMessage(JSON.stringify({
                type: 'toolbar-mode-switch',
                mode: 'gallery'
            }));
            funf.record('mode', { name: 'gallery' });
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
            Sync.exists(uuid, function(exists, where) {
                if (!exists) {
                    nd = new Drawing();
                    nd.uuid = uuid;
                    callback(nd);
                } else if (where==='local') {
                    Sync.load(uuid, 'local', callback);
                } else {
                    // load from sample or network, but rename & save locally
                    Sync.load(uuid, where, function(new_drawing) {
                        new_drawing.uuid = prandom.uuid();
                        new_drawing.ctime = Date.now();
                        if (window.history.replaceState) {
                            window.history.replaceState(null, uuid, '#'+new_drawing.uuid);
                            notifyParentHash('#'+new_drawing.uuid, true, uuid);
                        }
                        callback(new_drawing, true/* force initial save */);
                    });
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
        Gallery.abort(); doTrash = null;
        loadDrawing(uuid, replaceDrawing);
    };
    window.addEventListener('hashchange', onHashChange, false);

    // load the requested doc (based on URL hash)
    loadDrawing(document.location.hash.replace(/^#/,''), replaceDrawing);
});
