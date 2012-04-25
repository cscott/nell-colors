#!/usr/bin/env node
// node script to translate Colors .drw files into our own format.

var requirejs = require('requirejs');
requirejs(['commander', 'fs', '../src/brush', '../src/color', '../src/drawcommand', '../src/version'], function(program, fs, Brush, Color, DrawCommand, version) {
    var SPEED = 100; // milliseconds, per point.

    program
        .version(version)
        .usage('[options] <input file>.drw')
        .option('-o, --output <output>',
                'Output to the specified file (default stdout)',
                null)
        .option('-s, --scale <number>',
                "Scaling factor for drawing (default 512)",
                Number, 512)
        .parse(process.argv);

    if (program.args.length===0) {
        console.error('Missing .drw input filename');
        return;
    }
    var output = process.stdout;
    if (program.output) {
        output = fs.createWriteStream(program.output, { encoding: 'utf-8' });
    }
    var filename = program.args.shift();
    var buffer = fs.readFileSync(filename);

    var header = {}; // 64 byte header
    header.id                    = buffer.readUInt32LE( 0);
    console.assert(header.id===0x436f6c21 /* 'Col!' */,
                   "Not a valid .drw file");
    header.version               = buffer.readUInt32LE( 4);
    header.colorsversion_initial = buffer.readInt32LE ( 8);
    header.colorsversion_saved   = buffer.readInt32LE (12);
    header.strokes               = buffer.readInt32LE (16);
    header.time                  = buffer.readInt32LE (20);
    header.timessaved            = buffer.readInt32LE (24);
    // 8*4 filler bytes here: [28, 60)
    header.ncommands             = buffer.readInt32LE (60);

    var commands = [];
    var now = Date.now();
    var inStroke = false;
    var maxx, maxy, minx, miny;
    var parse_cmd0 = function(cmd) {
        // TYPE_DRAW
        var pressure = cmd & 0xFF; cmd >>= 8; /* pressure is unused */
        var x = cmd & 0x7FF; cmd >>= 11;
        var y = cmd & 0x7FF; cmd >>= 11;
        var pos = { x: (x-512)/1024, y: (y-512)/1024 };
        pos.x *= program.scale; pos.y *= program.scale;
        maxx = Math.max(maxx, pos.x);
        maxy = Math.max(maxy, pos.y);
        minx = Math.min(minx, pos.x);
        miny = Math.min(miny, pos.y);
        var layer = 0;
        if (!inStroke) {
            commands.push(DrawCommand.create_draw_start(layer));
            inStroke = true;
        }
        commands.push(DrawCommand.create_draw(pos, now));
    };
    var parse_cmd1 = function(cmd) {
        if (!inStroke) {
            console.warn("Extraneous DRAW_END, ignoring.");
            return;
        }
        // TYPE_DRAWEND
        var pressure = cmd & 0xFF; cmd >>= 8; /* pressure is unused */
        commands.push(DrawCommand.create_draw_end());
        inStroke = false;
    };
    var parse_cmd2 = function(cmd) {
        console.assert(!inStroke);
        // TYPE_COLORCHANGE
        var b = cmd & 0xFF; cmd >>= 8;
        var g = cmd & 0xFF; cmd >>= 8;
        var r = cmd & 0xFF; cmd >>= 8;
        var flipx = cmd & 1; cmd >>= 1;
        var flipy = cmd & 1; cmd >>= 1;
        if (flipx || flipy) {
            console.warn("Unsupported flip operation");
        }

        commands.push(DrawCommand.create_color_change(new Color(r,g,b,255)));
    };
    var parse_cmd3 = function(cmd) {
        console.assert(!inStroke);
        // TYPE_SIZECHANGE
        var size = cmd & 0xFFFF; cmd >>= 16;
        var brushcontrol = cmd & 3; cmd >>= 2;
        var brushtype = cmd & 3; cmd >>= 2;
        var opacity = cmd & 0xFF; cmd >>= 8;
        var spacing = 0.225;

        var type = Brush.Type.SOFT;
        if (brushtype===0) { type = Brush.Type.HARD; }

        console.assert(brushtype < 2);
        if (brushcontrol!==0) {
            console.warn("Unsupported brush control", brushcontrol);
        }
        size /= 1<<15;
        opacity /= 255;

        size *= program.scale;

        commands.push(DrawCommand.create_brush_change(type, size,
                                                      opacity, spacing));
    };

    var parse_cmd = function(cmd) {
        var type = cmd & 3;
        cmd >>= 2;
        if (type===0) { return parse_cmd0(cmd); }
        if (type===1) { return parse_cmd1(cmd); }
        if (type===2) { return parse_cmd2(cmd); }
        if (type===3) { return parse_cmd3(cmd); }
        console.assert(false, "Impossible");
    };

    var i, pos = 64;
    for (i=0; i<header.ncommands; i++, pos+=4) {
        var cmd = buffer.readUInt32LE(pos);
        parse_cmd(cmd);
        now += SPEED;
    }

    // emit the output file in a different format.
    var jsonout = {
        header: header,
        commands: commands,
        end: commands.length,
        nlayers: 1,
        width: maxx,
        height: maxy,
        pixelRatio: 1,
        checkpoints: []
    };
    output.write(JSON.stringify(jsonout));
    if (program.output) { output.end(); }
});
