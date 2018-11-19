'use strict';

var http = require('http');
var webpack = require('webpack');
var printResult = require('./printResult');
var assign = require('object-assign');
var path = require('path');
var join = path.join;
var ProgressPlugin = require('webpack/lib/ProgressPlugin');
var fs = require("fs");
var mockUtils = require("./mock-utils");

var walk = function(dir) {
    var results = []
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) results = results.concat(walk(file))
        else results.push(file)
    })
    return results
};

module.exports = function(args) {
    args = args || {};
    args.port = args.port || 8000;
    args.proxy = args.proxy || '';
    args.strip = args.strip || '';
    args.cwd = args.cwd || process.cwd();

    var koa = require('koa');
    var app = new koa();
    var router = require('koa-router')();
    var koaBody = require('koa-body');
    var _stats;
    var io;

    var webpackConfig;

    try {
        webpackConfig = require(join(process.cwd(), 'webpack.dev.config.js'))(args);
    } catch (e) {
        webpackConfig = require('./webpack.dev.config.js')(args);

        try {
            var merge = require(join(process.cwd(), 'config.js'));
            if (typeof merge === 'function') {
                webpackConfig = merge(webpackConfig);
            } else {
                webpackConfig = assign({}, webpackConfig, merge);
            }
        } catch (e) {}
    }

    webpackConfig.plugins.push(
        new ProgressPlugin(function(percentage, msg) {
            var stream = process.stderr;
            if (stream.isTTY && percentage < 0.71) {
                stream.cursorTo(0);
                stream.write(msg);
                stream.clearLine(1);
            } else if (percentage === 1) {
                console.log('\nwebpack: bundle build is now finished.');
            }
        })
    );

    delete webpackConfig.initEntry;

    var compiler = webpack(webpackConfig);
    compiler.plugin('done', function(stats) {
        printResult(stats);
    });
    var invalidPlugin = function() {
        if (io) io.sockets.emit("invalid");
    };
    compiler.plugin("compile", invalidPlugin);
    compiler.plugin("invalid", invalidPlugin);

    app.use(require('./middleware')(compiler));
    app.use(require('koa-static')(join(args.cwd, "./lib")));


    if (args.proxy) {
        var proxies = args.proxy.split(",");
        var prefixes = args.prefix.split(",");
        var strips = args.strip.split(",");

        var len = Math.min(proxies.length, prefixes.length);

        for (var i = 0; i < len; i++) {
            var prefix = prefixes[i];
            var re = new RegExp(prefix == '/' ? "^/" : "^/" + prefix + "/", "gim");

            var koa1Proxy = require('koa-proxy')({
                host: proxies[i],
                match: re,
                map: function(path) {
                    if(this.re.test(path) && this.strip != "false") {
                        return path.replace(this.re, "/");
                    }
                    return path;
                }.bind({re: re, strip: strips[i]})
            });

            app.use(require('koa-convert')(koa1Proxy));
        }
    }

    var testPath = join(args.cwd, "./mock");
    var files = walk(testPath);
    const fileModules = {};
    const getFileModule = function(f) {
        var module = fileModules[f];
        if (!module) {
            module = require(f);
            fileModules[f] = module;
        }
        return module;
    };
    const executeFile = function(context, f) {
        context.mockUtils = mockUtils;
        getFileModule(f).bind(context)(context);
    };
    for (var k in files) {
        const f = files[k];

        var ext = path.extname(f);
        var name = path.basename(f, ext);
        if (!name || !ext || ext != ".js") continue;

        var array = path.relative(testPath, f).split(path.sep);
        array.pop();
        var prefix = "/" + array.join("/") + (array.length > 0 ? "/" : "");
        var method = path.extname(name);
        var name = path.basename(name, method);

        switch (method) {
            case '.get':
            case '.delete':
                router.get(prefix + name, koaBody(), (ctx, next) => {
                    executeFile(ctx, f);
                });
                break;
            case '.put':
            case '.post':
                router.post(prefix + name, koaBody(), (ctx, next) => {
                    executeFile(ctx, f);
                });
                break;
            case '.upload':
                router.post(prefix + name, koaBody({
                    multipart: true,
                    formidable: {
                        uploadDir: testPath + '/temp'
                    }
                }), (ctx, next) => {
                    executeFile(ctx, f);
                });
                break;
            default:
                router.get(prefix + name + method, koaBody(), (ctx, next) => {
                    executeFile(ctx, f);
                });
                break;
        }

        fs.watch(f, function() {
            cleanCache(f);
            require.cache[f] = null;
            fileModules[f] = null;
        });
    }

    app.use(router.routes());

    var server = http.createServer(app.callback());
    server.listen(args.port, function() {
        console.log('\rJuJin Data Visualization Developement Server Listened on %s', args.port);
    });

};

function cleanCache(f) {
    try {
        var module = require.cache[f];
        // remove reference in module.parent
        if (module && module.parent) {
            module.parent.children.splice(module.parent.children.indexOf(module), 1);
        }
    } catch (ex) {}
}