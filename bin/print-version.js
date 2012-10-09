#!/usr/bin/env node
// node script to emit the current version of the source code

var requirejs = require('requirejs');
requirejs(['commander', 'fs', '../src/version'], function(program, fs, version){
    program
        .version(version)
        .usage('')
        .parse(process.argv);

    console.log(version);
});
