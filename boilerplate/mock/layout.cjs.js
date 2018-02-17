module.exports = function(ctx) {

    this.set("Content-Type", "application/json");

    var result = {
        menus: [{
            name: '业务统计',
            icon: 'area-chart',
            children: [{
                name: '推广统计',
                url: '/popularization.html',
            }, {
                name: 'xx统计',
                url: '/test.html',
            }, ]
        }, {
            name: '业务监控',
            icon: 'dashboard',
            children: [{
                name: 'xx监控',
                url: '/test.html',
            }, {
                name: 'xx监控',
                url: '/test.html',
            }, ]
        }, ],
        userInfo: {
            name: '管理员',
        },
        sites: [
            { icon: "solution", name: "通讯录", },
            { icon: "team", name: "员工管理" },
            { icon: "share-alt", name: "CRM" },
        ]
    };

    this.response.body = "{_init_(" + JSON.stringify(result) + ")}";
}