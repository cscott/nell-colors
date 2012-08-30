/** @license
 * RequireJS plugin for loading web fonts using the WebFont Loader
 * Author: Miller Medeiros
 * Version: 0.2.0 (2011/12/06)
 * Released under the MIT license
 */
// webfont.js is the typekit loader, from
//   https://github.com/typekit/webfontloader
// it defines window.WebFont
define(['propertyParser','webfont'], function (propertyParser, WebFont) {

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
