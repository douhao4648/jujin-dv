var htmlMinifier = require("html-minifier");
var fs = require("fs");
var path = require('path');
var configParser = require('./configParser');
var loaderUtils = require("loader-utils");
var artTemplate = require("art-template");
var assign = require('object-assign');

artTemplate.defaults.minimize = false;
artTemplate.defaults.cache = false;

function randomUri(uri, configs) {
    if (!!!configs) configs = {};

    uri = uri.replace(/#{(\S*?)}/gi, function($0, $1) {
        var value = configs[$1];
        return !!value ? value : "";
    });
    if (uri.indexOf("?") > 0) {
        return uri + "&r=" + new Date().getTime();
    }
    return uri + "?" + new Date().getTime();
}

module.exports = function(content) {
    this.cacheable && this.cacheable();

    if (!this.emitFile) throw new Error("emitFile is required from module system");

    var query = loaderUtils.parseQuery(this.query);

    query.minify = query.minify || false;
    query.removeComments = query.removeComments || true;
    query.collapseWhitespace = query.collapseWhitespace || true;
    query.collapseBooleanAttributes = query.collapseBooleanAttributes || true;
    query.removeAttributeQuotes = query.removeAttributeQuotes || true;
    query.removeRedundantAttributes = query.removeRedundantAttributes || true;
    query.useShortDoctype = query.useShortDoctype || true;
    query.removeEmptyAttributes = query.removeEmptyAttributes || true;
    query.removeOptionalTags = query.removeOptionalTags || true;
    query.minifyJS = query.minifyJS || true;
    query.minifyCSS = query.minifyCSS || true;


    var configParams = configParser(query.config.split("_+_"));
    configParams["entry"] = path.basename(this.resource, '.html');

    content = content.replace(/<include(.*)(\/>|>\s*<\/include>)/gi, function($0, $1) {
        var group = $1.match(/\S+\s*=\s*["']{1}\S+["']{1}/gi);
        var templateData = {};
        group.forEach(function(item) {
            var list = /(\S+)\s*=\s*["']{1}(\S+)["']{1}/gi.exec(item);
            templateData[list[1]] = list[2];
        });
        assign(templateData, configParams);
        var fileName = path.resolve(this.context, templateData.src);
        var fileContent = fs.readFileSync(fileName, "utf8");
        return artTemplate.compile(fileContent)(templateData);
    }.bind(this));


    var relative = "";
    if (!this.context.endsWith("src")) {
        relative = Array.apply(null, new Array(this.context.split(path.sep).reverse().indexOf("src"))).map((s) => { return '..'; }).join("/") + "/";
    }


    content = content.replace(/(<a[^<>]*href\s*=\s*['"]{1})([^\s>'"]+)/gi, function($0, $1, $2) {
        var href = $2.toLowerCase();
        if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#{") || href.startsWith("{{")) {
            href = randomUri($2, configParams);
        } else if (href.startsWith("#") || href.startsWith("javascript:")) {
            href = $2;
        } else {
            href = relative + randomUri($2, configParams);
        }
        return $1 + href;
    }).replace(/(<link[^<>]*href\s*=\s*['"]{1})([^\s>'"]+)/gi, function($0, $1, $2) {
        var href = $2.toLowerCase();
        if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#{") || href.startsWith("{{")) {
            href = randomUri($2, configParams);
        } else {
            href = relative + randomUri($2, configParams);
        }
        return $1 + href;
    }).replace(/(<script[^<>]*src\s*=\s*['"]{1})([^\s>'"]+)/gi, function($0, $1, $2) {
        var href = $2.toLowerCase();
        if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#{") || href.startsWith("{{")) {
            href = randomUri($2, configParams);
        } else {
            href = relative + randomUri($2, configParams);
        }
        return $1 + href;
    }).replace(/(<img[^<>]*src\s*=\s*['"]{1})([^\s>'"]+)/gi, function($0, $1, $2) {
        var href = $2.toLowerCase();
        if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#{") || href.startsWith("{{")) {
            href = randomUri($2, configParams);
        } else {
            href = relative + randomUri($2, configParams);
        }
        return $1 + href;
    }).replace(/(<form[^<>]*action\s*=\s['"]{1}\s*)([^\s>'"]+)/gi, function($0, $1, $2) {
        var href = $2.toLowerCase();
        if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("#{") || href.startsWith("{{")) {
            href = randomUri($2, configParams);
        } else {
            href = relative + randomUri($2, configParams);
        }
        return $1 + href;
    });


    if (query.minify) {
        content = htmlMinifier.minify(content, {
            removeComments: query.removeComments,
            collapseWhitespace: query.collapseWhitespace,
            collapseBooleanAttributes: query.collapseBooleanAttributes,
            removeAttributeQuotes: query.removeAttributeQuotes,
            removeRedundantAttributes: query.removeRedundantAttributes,
            useShortDoctype: query.useShortDoctype,
            removeEmptyAttributes: query.removeEmptyAttributes,
            removeOptionalTags: query.removeOptionalTags,
            minifyCSS: query.minifyCSS,
            minifyJS: query.minifyJS,
            ignoreCustomFragments: [/\s*?<#[\s\S]*?>\s+/g, /\s*?<\/#[\s\S]*?>\s+/g, /\$\{\%[\s\S]*?\}/g]
        });
    }

    var arr = this.resource.split(path.sep);
    arr = arr.slice(arr.lastIndexOf("src") + 1);

    var fn = loaderUtils.interpolateName(this, arr.pop() || "[name].[ext]", {
        context: query.context,
        regExp: query.regExp
    });
    arr.push(fn);

    var url = arr.join(path.sep);
    this.emitFile(url, content);

    return "";
}