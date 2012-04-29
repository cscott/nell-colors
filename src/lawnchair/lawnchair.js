// Load lawnchair core and appropriate adapters.
define(['./core',
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
