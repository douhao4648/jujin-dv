'use strict';

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var assign = require('object-assign');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = function(args) {

    var plugins = [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.IgnorePlugin(/^xhr2$/),
        new webpack.IgnorePlugin(/\.\/lib\/\.$/)
    ];

    if (args.css) {
        plugins.push(new ExtractTextPlugin('[name].css', { allChunks: true }));
    }

    if (!args.debug) {
        plugins.push(new UglifyJsPlugin({
            uglifyOptions: {
                output: {
                    ascii_only: true
                }
            }
        }));
    }

    var babel_loader_params = {
        // load the same presets as in the .babelrc file, but in a way that resolves in the parent directory
        presets: [require.resolve('babel-preset-env'), require.resolve('babel-preset-react'), require.resolve('babel-preset-stage-0')],
        plugins: [require.resolve('babel-plugin-transform-decorators-legacy')]
    }

    var common = require('./webpack.common.config')(args.globalConfig, args.css);

    if (args.debug) {
        common.module.loaders.unshift({
            test: /\.html$/,
            loader: 'thtml'
        }, {
            test: /\.(js|jsx)?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: babel_loader_params
        });
    } else {
        common.module.loaders.unshift({
            test: /\.html$/,
            loader: 'thtml-minifier'
        }, {
            test: /\.(js|jsx)?$/,
            exclude: /node_modules/,
            loader: 'strip-loader?strip[]=debugger,strip[]=console.log!babel-loader?' + JSON.stringify(babel_loader_params)
        });
    }

    return assign({}, common, {
        plugins: plugins,
    });
};