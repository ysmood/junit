
module.exports = function (it) {
    it("test 03", function () {
        return it.eq({ a: 1, b: 2 }, { a: 1, b: "2" });
    });
    it("test 04", function () {
        return it.eq("OK", "OK");
    });
    it("another 01", function () {
        return it.eq("OK", "OK");
    });
    it("another 02", function () {
        return it.eq("OK", "OK");
    });
};