import junit from "../src";
import yutils from "yaku/lib/utils";
import br from "../src/brush";
import Promise from "yaku";

let it = junit();
let testOpts = { reporter: junit.reporter(" sub >") };


it.async([

    it("msg", () => {
        let test = junit(testOpts);

        return it.eq(test("test msg").msg, "test msg");
    }),

    it("all passed", () => {
        let test = junit(testOpts);

        // Async tests
        return test.async([
            test("basic 1", () =>
                it.eq("ok", "ok")
            ),
            test("basic 2", () =>
                it.eq({ a: 1, b: 2 }, { a: 1, b: 2 })
            ),

            // Sync tests
            yutils.flow([
                test("basic 3", () =>
                    it.eq("ok", "ok")
                ),
                test("basic 4", () =>
                    it.eq("ok", "ok")
                )
            ])
        ])
        .then(({ passed }) =>
            it.eq(passed, 4)
        );
    }),

    it("all passed sync", () => {
        let test = junit(testOpts);

        return test.sync([
            test("basic 1", () =>
                it.eq("ok", "ok")
            ),
            test("basic 2", () =>
                it.eq({ a: 1, b: 2 }, { a: 1, b: 2 })
            )
        ])
        .then(({ passed }) =>
            it.eq(passed, 2)
        );
    }),

    it("type check", () => {
        let test = junit(testOpts);

        let tests = [
            "string",
            new Date(),
            [1, 2],
            0,
            1,
            undefined,
            null,
            { a: { b: { c: "test" } } },
            { 0: 1, 1: 2, length: 2 } // array like object
        ].map((v, i) => test(`type ${i}`, () => it.eq(v, v)));

        return test.async(tests)
        .then(({ passed }) =>
            it.eq(passed, tests.length)
        );
    }),

    it("failed", () => {
        br.isEnabled = false;

        global.window = global;
        let test = junit(testOpts);

        // Async tests
        return test.async([
            test("basic 1", () =>
                it.eq("ok", "ok")
            ),
            test("basic 2", () =>
                it.eq("ok", "ok1")
            ),
            test("basic 3", () =>
                it.eq({ a: 1, b: 2 }, { a: 1, b: 2 })
            )
        ])
        .then(({ failed }) => {
            global.window = null;
            if (typeof window === "undefined")
                br.isEnabled = true;
            return it.eq(failed, 1);
        });
    }),

    it("isEnd", () => {
        let test = junit(testOpts);

        return test.async([
            test("isEnd resolve", () =>
                new Promise((r) => setTimeout(r, 100))
            ),
            test("isEnd reject", () =>
                new Promise((r, rr) => setTimeout(rr, 100))
            ),
            test("empty", () =>
                it.eq(1, 2)
            )
        ])
        .then(({ failed }) => {
            return it.eq(failed, 1);
        });
    }),

    it("error", () => {
        let test = junit({
            isFailOnUnhandled: false,
            isBail: false,
            isExitWithFailed: false,
            reporter: junit.reporter(" sub >")
        });

        return test.async([
            test("empty", () => {
                throw new Error("fake err");
            })
        ]);
    }),

    it("unhandled", () => {
        let exit = process.exit;

        process.exit = (v) => {
            if (v === 1) {
                exit(0);
            } else {
                exit(1);
            }
        };

        Promise.reject("fake unhandled");
    }),

    it("nesting", () => {
        let data1 = {
            a: 1,
            b: [1, 2, 3],
            c: "ok",
            d: null,
            e: {
                f: 2,
                g: true
            }
        };
        let data2 = {
            b: [1, 2, 3],
            a: 1,
            c: "ok",
            d: null,
            e: {
                f: 2,
                g: true
            }
        };

        it.eq(data1, data2);
    }),

    it("max depth", () => {
        let test = junit(testOpts);

        return test.async([
            test("over max depth", () => {
                    let data1 = {
                        a: { b: { c: { d:{ e:{ f:{ g:{} } } } } } }
                    };
                    let data2 = {
                        a: { b: { c: { d:{ e:{ f:{ g:{} } } } } } }
                    };
                    return it.eq(data1, data2);
                }
            )
        ])
        .then(({ failed }) => {
            return it.eq(failed, 1);
        });
    }),

    it("undefined", () => {
        let test = junit(testOpts);

        return test.async([
            test("undefined & null", () =>
                it.eq(undefined, null)
            )
        ])
        .then(({ failed }) => {
            return it.eq(failed, 1);
        });
    }),

    it("elements number", () => {
        let test = junit(testOpts);

        return test.async([
            test("elements number", () => {
                let data1 = {
                    a: 1,
                    b: {
                        d: ["1", "2"]
                    }
                };
                let data2 = {
                    b: {
                        d: ["1", "2", "3"]
                    },
                    a: 1
                };
                return it.eq(data1, data2);
            })
        ])
        .then(({ failed }) => {
            return it.eq(failed, 1);
        });
    }),

    it("attributes number", () => {
        let test = junit(testOpts);

        return test.async([
            test("attributes number", () => {
                let data1 = {
                    b: {
                        d: ["1", "2"],
                        c: "10-2",
                        e: 5
                    },
                    a: 1
                };
                let data2 = {
                    a: 1,
                    b: {
                        c: "10-2",
                        d: ["1", "2"]
                    }
                };
                return it.eq(data1, data2);
            })
        ])
        .then(({ failed }) => {
            return it.eq(failed, 1);
        });
    })

]);
