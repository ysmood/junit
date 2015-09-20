
export default (it) => [
    it("test 03", () => it.eq({ a: 1, b: 2 }, { a: 1, b: "2" })),
    it("test 04", () => it.eq("OK", "OK")),
    it("another 01", () => it.eq("OK", "OK")),
    it("another 02", () => it.eq("OK", "OK"))
];
