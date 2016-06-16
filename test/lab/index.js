var junit = require("../../lib");
// var kit = require('nokit');

var it = junit({
});

it.describe("level 01", function (it) {
    it("test 01", function () {
        return it.eq(1, 3);
    });
});

it.run();