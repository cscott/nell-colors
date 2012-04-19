/*jshint
  eqeqeq:true, curly:true, latedef:true, newcap:true, undef:true,
  trailing:true, es5:true
 */
/*global define:false, console:false, Uint8Array:false */
define(['./color','./brush'], function(Color, Brush) {
    // draw commands

    var CommandType = {
        DRAW: 0,
        DRAW_END: 1,
        COLOR_CHANGE: 2,
        SIZE_CHANGE: 3
    };
    Object.freeze(CommandType);

    var DrawCommand = function() {
        this.type = CommandType.DRAW;
        this.pos = { x:0, y: 0 };
        this.color = Color.BLACK;
        this.pressure = 0;
        this.flipx = false;
        this.flipy = false;
        this.is_text = false;
        this.text = null;
        this.brush_control = Brush.Control.NONE;
        this.brush_type = Brush.Type.HARD;
        this.size = 0;
        this.opacity = 0;
    };
    DrawCommand.Type = CommandType;

    DrawCommand.create_color_change = function(color) {
        var cmd = new DrawCommand();
        cmd.type = CommandType.COLOR_CHANGE;
        cmd.color = color.copy();
        return cmd;
    };
    DrawCommand.create_draw = function(pos, pressure) {
        var cmd = new DrawCommand();
        cmd.type = CommandType.DRAW;
        cmd.pos = { x: pos.x, y: pos.y };
        cmd.pressure = pressure;
        return cmd;
    };
    DrawCommand.create_end_draw = function(pressure) {
        var cmd = new DrawCommand();
        cmd.type = CommandType.DRAW_END;
        cmd.pressure = pressure;
        return cmd;

    };
    DrawCommand.create_size_change = function(brush_control, brush_type,
                                              size, opacity) {
        var cmd = new DrawCommand();
        cmd.type = CommandType.SIZE_CHANGE;
        cmd.brush_control = brush_control;
        cmd.brush_type = brush_type;
        cmd.size = size;
        cmd.opacity = opacity;
        return cmd;
    };
    DrawCommand.create_flip = function(flipx) {
        var cmd = new DrawCommand();
        cmd.type = CommandType.COLOR_CHANGE;
        cmd.flipx = flipx;
        cmd.flipy = !flipx;
        return cmd;
    };

    return DrawCommand;
});
