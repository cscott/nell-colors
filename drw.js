/**
 * RequireJS plugin for loading drawing JSON
 * depends on json plugin.
 * Author: C. Scott Ananian
 */
define(['./src/drawing'], function(Drawing) {
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
