#!/usr/bin/env node
// node script to emit the current version of the source code

var requirejs = require('../r.js');
requirejs(['../src/version'], function(version) {

    try {
        // use the node module 'commander' to give a nicer interface,
        // if installed.
        var program = require('commander');
        program
            .version(version)
            .usage('')
            .parse(process.argv);
    } catch (e) { /* I guess it's not installed */ }

    console.log(version);
});
