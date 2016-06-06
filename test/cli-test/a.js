module.exports = function (it) {
    it("test 01", function () {
        return it.eq(1, 1);
    });
    it("test 02", function () {
        return it.eq("OK", "OK");
    });
};