var junit = require("../../lib");

var it = junit();
var eq = it.eq;

it.describe("level 01", function (it) {
    it("test 01", function () {
        return eq(1, 1);
    });

    it("test 02", function () {
        return eq(1, 1);
    });

    it.describe("level 02", function (it) {

        it.describe("level 03", function (it) {
            it("test 01", function () {
                return eq(1, 1);
            });

            it("test 02", function () {
                return eq(1, 1);
            });
        });

        it("test 01", function () {
            return eq(1, 1);
        });

        it("test 02", function () {
            return eq(1, 1);
        });
    });
});

it.run();