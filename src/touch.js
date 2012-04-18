/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, document:false, window:false */
define([], function() {
    var TouchEvent = function(type) { this.type = type; };
    TouchEvent.prototype = {
        toString: function() {
            return this.type+":"+this.globalPositions.map(function(p) { return p.toString(); }).join(',');
        }
    };
    var TouchPoint = function(id, e) {
        this.id = id;
        var offsetLeft = 0; // XXX could fill these in based on the position
        var offsetTop =  0; //     of a containing element.
        this.x = e.pageX - offsetLeft;
        this.y = e.pageY - offsetTop;
    };
    TouchPoint.prototype = {
        equals: function(pt) {
            return this.id===pt.id && this.x===pt.x && this.y===pt.y;
        },
        toString: function() { return "("+this.x+","+this.y+")"; }
    };

    // add touch event handlers
    var addTouchEventHandler = function(elem, handleTouch) {
        var onTouch = function(evtype) {
            return function(e) {
                e.preventDefault();
                var ev = new TouchEvent(evtype);
                ev.globalPositions =
                    Array.prototype.map.call(e.targetTouches, function (pt) {
                        return new TouchPoint(pt.identifier, pt);
                    });
                return handleTouch(ev);
            };
        };
        elem.addEventListener('touchstart', onTouch('start'), false);
        elem.addEventListener('touchmove', onTouch('move'), false);
        elem.addEventListener('touchend', onTouch('end'), false);
        elem.addEventListener('touchcancel', onTouch('cancel'), false);

        // emulate touches with mouse events for desktop platform
        var MOUSE_ID = 0xCAFEBABE;
        var onMouseMove = function(e) {
            e.preventDefault();
            var ev = new TouchEvent('move');
            ev.emulated = true;
            ev.globalPositions = [ new TouchPoint(MOUSE_ID, e) ];
            return handleTouch(ev);
        };
        var onMouseUp = function(e) {
            e.preventDefault();
            var ev = new TouchEvent('end');
            ev.emulated = true;
            ev.globalPositions = [ ];
            elem.removeEventListener('mousemove', onMouseMove, false);
            elem.removeEventListener('mouseup', onMouseUp, false);
            return handleTouch(ev);
        };
        var onMouseDown = function(e) {
            e.preventDefault();
            var ev = new TouchEvent('start');
            ev.emulated = true;
            ev.globalPositions = [ new TouchPoint(MOUSE_ID, e) ];
            elem.addEventListener('mousemove', onMouseMove, false);
            elem.addEventListener('mouseup', onMouseUp, false);
            return handleTouch(ev);
        };
        elem.addEventListener('mousedown', onMouseDown, false);
    };
    return {
        TouchEvent: TouchEvent,
        TouchPoint: TouchPoint,
        addTouchEventHandler: addTouchEventHandler
    };
});
