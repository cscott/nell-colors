/**
 * RequireJS plugin for loading image elements.
 * Author: C. Scott Ananian
 */
define([], function() {
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
