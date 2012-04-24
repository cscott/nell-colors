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
        NUM_COMMAND_TYPES: 4
    };
    Object.freeze(CommandType);

    var DrawCommand = function(type) {
        console.assert(type >= 0 && type < CommandType.NUM_COMMAND_TYPES);
        this.type = type;
    };
    DrawCommand.Type = CommandType;

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
    DrawCommand.create_brush_change = function(brush_type, size,
                                               opacity, spacing) {
        var cmd = new DrawCommand(CommandType.BRUSH_CHANGE);
        cmd.brush_type = brush_type;
        cmd.size = size;
        cmd.opacity = opacity;
        cmd.spacing = spacing;
        return cmd;
    };

    return DrawCommand;
});
