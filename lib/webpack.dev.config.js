'use strict';

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var assign = require('object-assign');

module.exports = function(args) {
    var plugins = [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.IgnorePlugin(/^xhr2$/),
        new webpack.IgnorePlugin(/\.\/lib\/\.$/),
        //    new webpack.optimize.CommonsChunkPlugin({name: "m/common"})
    ];

    if (args.css) {
        plugins.push(new ExtractTextPlugin('[name].css', { allChunks: true }));
    }

    var common = require('./webpack.common.config')(args.globalConfig, args.css);
    common.module.loaders.unshift({
        test: /\.html$/,
        loader: 'thtml'
    }, {
        test: /\.(js|jsx)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: { // load the same presets as in the .babelrc file, but in a way that resolves in the parent directory
            presets: [require.resolve('babel-preset-env'), require.resolve('babel-preset-react'), require.resolve('babel-preset-stage-0')],
            plugins: [require.resolve('babel-plugin-transform-decorators-legacy'), [require.resolve('babel-plugin-transform-runtime'), {
                "helpers": false,
                "polyfill": false,
                "regenerator": true,
                "moduleName": "babel-runtime"
            }]]
        }
    });

    return assign({}, common, {
        devtool: '#source-map',
        plugins: plugins
    });
};