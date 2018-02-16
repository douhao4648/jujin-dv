'use strict';

var shelljs = require('shelljs');
var join = require('path').join;
var webpack = require('webpack');
var assign = require('object-assign');
var printResult = require('./printResult');

module.exports = function(args) {
    var cwd = process.cwd();

    var webpackConfig;
    try {
        webpackConfig = require(join(cwd, 'webpack.config.js'))(args);
    } catch (e) {
        webpackConfig = require('../lib/webpack.config.js')(args);

        try {
            var merge = require(join(process.cwd(), 'config.js'));
            if (typeof merge === 'function') {
                webpackConfig = merge(webpackConfig);
            } else {
                webpackConfig = assign({}, webpackConfig, merge);
            }
        } catch (e) {}
    }

    if (args.debug) {
        console.log("debug mode");
    }

    if (args.output) {
        console.log("output path : ", args.output);
        webpackConfig.output.path = args.output;
    }

    shelljs.rm('-rf', webpackConfig.output.path);

    if (args.entry) {
        console.log("build entry : ", args.entry);
        webpackConfig.entry = webpackConfig.initEntry(args.entry);
    }

    delete webpackConfig.initEntry;

    var compiler = webpack(webpackConfig);

    function doneHandler(err, stats) {
        var error = printResult(stats);
        if (err) {
            console.error(err);
        }
        process.exit((error || err) ? 3 : 0);
    }

    compiler.run(doneHandler);
};