/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, Uint8Array:false */
define(['./color','./brush'], function(Color, Brush) {
    'use strict';

    // draw commands

    var CommandType = {
        DRAW: 0,
        DRAW_END: 1,
        COLOR_CHANGE: 2,
        BRUSH_CHANGE: 3,
        DRAW_START: 4,
        NUM_COMMAND_TYPES: 5
    };
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
