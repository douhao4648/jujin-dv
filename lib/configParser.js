module.exports = function(args) {
    var config = {};
    for (var idx in args) {
        if (!!!args[idx]) continue;
        var kv = args[idx].split("=");
        config[kv[0]] = kv[1];
    }
    return config;
}