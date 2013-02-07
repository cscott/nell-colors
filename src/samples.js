/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define(['require','drw','json','text'], function(require) {

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
