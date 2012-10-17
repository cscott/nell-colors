// Load lawnchair core and appropriate adapters.
define(['./core',
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
