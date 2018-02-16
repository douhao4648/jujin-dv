module.exports = {

    guid: function() {
        var ret = "";
        var i = 32;

        while (i--) {
            ret += Math.floor(Math.random() * 16.0).toString(16);
        }
        return ret;
    },

    setSession: function(cookies, sessionId, domain) {
        var opt = {};
        if (typeof domain == "object") {
            opt = domain;
        } else if (typeof domain == "string") {
            var expireDate = new Date();
            expireDate.setFullYear(expireDate.getFullYear() + 1);
            opt = {
                expires: expireDate,
                path: '/',
                domain: domain
            }
        }
        cookies.set('SESSION', sessionId, opt);
    }

}