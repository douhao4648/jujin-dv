module.exports = function(ctx) {

    this.set("Content-Type", "application/json");

    var j = Math.round(Math.random() * 50 + 40);

    var value = [];
    for (var i = 0; i < j; i++) {
        value.push({
            id: 1,
            name: `Edward King ${i}`,
            age: 32,
            address: `London, Park Lane no. ${i}`,
        });
    }

    // value = {
    //     currentPage: 1,
    //     pageSize: 20,
    //     resultList: value,
    //     total: 100,
    // }

    var result = { success: 1, value };

    // if (i < 4) {
    //     result = {
    //         success: 0,
    //         errCode: 405,
    //         message: '随机失败',
    //     };
    // }

    this.response.body = JSON.stringify(result);
}