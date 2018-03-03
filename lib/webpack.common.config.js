'use strict';

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var fs = require("fs");
var pkg = require(path.join(process.cwd(), 'package.json'));

var initEntryFunction = function(entry) {
    var entries = entry || {};

    if (typeof entries === 'string') entries = [entries];

    if (toString.apply(entries) === "[object Array]") {
        var tmp = {};

        entries.forEach((item) => {
            var ext = path.extname(item);
            var name = path.basename(item, ext);
            var arr = item.split("/");

            var key = arr.slice(arr.lastIndexOf("src") + 1, arr.length - 1);
            key.push(name);
            key = key.join(path.sep);

            item = [item];
            var f = path.resolve(item[0], "../" + name + ".html");
            if (fs.existsSync(f)) {
                item.push(f);
            }
            tmp[key] = item;
        });

        entries = tmp;
    }

    return entries;

};

function resolveExternals(externals, globalConfig) {
    var defaults = {
        React: 'window.React',
        react: 'window.React',
        ReactDOM: 'window.ReactDOM',
        'react-dom': 'window.ReactDOM',
        ReactRouterDOM: 'window.ReactRouterDOM',
        'react-router-dom': 'window.ReactRouterDOM',
        antd: 'window.antd',
        moment: 'window.moment',
        'global-config': JSON.stringify(globalConfig),
    }

    if (!!externals) {
        for (var external in externals) {
            if (externals.hasOwnProperty(external)) {
                defaults[external] = externals[external];
            }
        }
    }

    return defaults;
};

module.exports = function(globalConfig, aloneCssFile) {
    var configParamArray = [];
    for (var configKey in globalConfig) {
        if (globalConfig.hasOwnProperty(configKey)) {
            configParamArray.push(configKey + "=" + globalConfig[configKey]);
        }
    }
    var configParams = "config=" + configParamArray.join("_+_");


    var postcss_loader_config = {
        'autoprefixer': { browsers: 'last 5 version' }
    };

    var style_loader_chain = "css-loader?{modules:true,localIdentName:'[local]__[hash:base64:5]'}!postcss-loader?" + JSON.stringify(postcss_loader_config);

    return {
        output: {
            path: path.join(process.cwd(), './dist/'),
            filename: '[name].js',
            chunkFilename: '[name].js'
        },

        //devtool: '#hidden-source-map',

        resolve: {
            modules: [
                path.join(__dirname, '../node_modules'),
            ],
            extensions: ['.js', '.jsx']
        },

        resolveLoader: {
            modules: [
                path.join(__dirname, '../node_modules'),
            ],
            alias: {
                "thtml-minifier": path.join(__dirname, "./thtml-loader?minify=true&") + configParams,
                "thtml": path.join(__dirname, "./thtml-loader?") + configParams
            }
        },

        initEntry: initEntryFunction,

        entry: initEntryFunction(pkg.entry),

        module: {
            loaders: [{
                    test: /\.css$/,
                    loader: aloneCssFile ? ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: style_loader_chain
                    }) : "style-loader!" + style_loader_chain
                },
                {
                    test: /\.less$/,
                    loader: aloneCssFile ? ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: style_loader_chain + "!less-loader"
                    }) : "style-loader!" + style_loader_chain + "!less-loader"
                },
                {
                    test: /\.scss$/,
                    loader: aloneCssFile ? ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: style_loader_chain + "!sass-loader"
                    }) : "style-loader!" + style_loader_chain + "!sass-loader"
                },
                {
                    test: /\.styl$/,
                    loader: aloneCssFile ? ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: style_loader_chain + "!stylus-loader"
                    }) : "style-loader!" + style_loader_chain + "!stylus-loader"
                },
                { test: /\.jpe?g$|\.gif$|\.png$/, loader: "url-loader?limit=25000&name=/img/jjdv/[hash:8]/[name].[ext]" },
                { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
                { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
                { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&minetype=application/octet-stream' },
                { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&minetype=image/svg+xml' },
                { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' }
            ]
        },

        externals: resolveExternals(pkg.externals, globalConfig)
    };
};