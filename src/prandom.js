/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['./alea','./lawnchair/lawnchair'], function(Alea, Lawnchair) {

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
                lawnchair.save({ key:'pool', data: random() });
                // improve the lawnchair uuid function
                // (yes, this is a monkey patch, but there's a circular dep)
                var uuid = function () {
                    var S4 = function () {
                        return (((1+random())*0x10000)|0).toString(16)
                            .substring(1);
                    };
                    var S3 = function() {
                        return arguments[Math.floor(random()*arguments.length)]+
                            S4().substring(1);
                    };
                    // "version 4 (random)" UUIDs
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
