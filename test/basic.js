import junit from "../src";
import br from "../src/brush";
import Promise from "yaku";

export default (it, mode) => it.describe("basic: ", it => {
    let testOpts = {
        reporter: junit.reporter({
            prompt: " sub >",
            mode: mode
        }),
        isThrowOnFinal: false
    };

    let { eq } = it;

    it("empty option", () => {
        let test = junit();

        test("test", () => eq(1, 1));

        return test.run();
    });

    it("no message", () => {
        let test = junit();

        test(() => eq(1, 1));

        return test.run();
    });

    it("error object", () => {
        let test = junit(testOpts);

        test("test", () => Promise.reject({ a: 10 }));

        return test.run().catch(({ failed }) => {
            return eq(failed, 1);
        });
    });

    it("after hook", async () => {
        let test = junit(testOpts);

        let queue = [];

        test("test", (after) => {
            after(() => {
                queue.push(2);
            });

            queue.push(1);
            return eq(1, 1);
        });

        await test.run();

        return eq(queue, [1, 2]);
    });

    it("after hook when error", async () => {
        let test = junit(testOpts);

        let queue = [];

        test("test", (after) => {
            after(() => {
                queue.push(2);
            });

            queue.push(1);
            return eq(1, 2);
        });

        await test.run().catch(() => {});

        return eq(queue, [1, 2]);
    });

    it("after hook when log error", async () => {
        let reporter = junit.reporter({ prompt: " sub >" });
        reporter.logFail = () => { throw "err"; };

        let test = junit({
            reporter: reporter,
            isThrowOnFinal: false
        });

        let queue = [];

        test("test", (after) => {
            after(() => {
                queue.push(2);
            });

            queue.push(1);
            return eq(1, 2);
        });

        await test.run().catch(() => {});

        return eq(queue, [1, 2]);
    });

    it("all passed", async () => {
        let test = junit(testOpts);

        // Async tests
        test("basic 1", () =>
            eq("ok", "ok")
        );
        test("basic 2", () =>
            eq({ a: 1, b: 2 }, { a: 1, b: 2 })
        );

        // Sync tests
        await test("basic 3", () =>
            eq("ok", "ok")
        );

        await test("basic 4", () =>
            eq("ok", "ok")
        );

        await test("basic 5", () =>
            eq(Promise.resolve("ok"), "ok")
        );

        let { passed } = await test.run();
        return eq(passed, 5);
    });

    it("sync bail", async () => {
        let test = junit(testOpts);

        // Sync tests
        await test("basic 1", () =>
            eq("ok", "ok1")
        );

        await test("basic 1", () =>
            eq("ok", "ok")
        );

        let { tested, failed, total } = await test.run();
        return eq([tested, failed, total], [1, 1, 2]);
    });

    it("all passed sync", async () => {
        let test = junit(testOpts);

        await test("basic 1", () =>
            eq("ok", "ok")
        );

        await test("basic 2", () =>
            eq({ a: 1, b: 2 }, { a: 1, b: 2 })
        );

        return test.run()
        .then(({ passed }) =>
            eq(passed, 2)
        );
    });

    it("filter", () => {
        let test = junit({
            filter: (msg) => msg.indexOf("test") === 0,
            reporter: junit.reporter({ prompt: " sub >" }),
            isThrowOnFinal: false
        });

        test("test 1", () => eq("ok", "ok"));
        test("test 2", () => eq("ok", "ok"));

        test("basic 1", () => eq(1, 1));
        test("basic 2", () => eq(1, 1));

        return test.run().then((ret) =>
            eq(ret, { total: 4, tested: 2, passed: 2, failed: 0 })
        );
    });

    it("disable brush", () => {
        let { red } = br({ mode: "none" });
        eq(red("ok"), "ok");
    });

    it("type check", () => {
        let test = junit(testOpts);

        let tests = [
            "string",
            new Date(),
            [1, 2],
            0,
            1,
            void 0,
            null,
            { a: { b: { c: "test" } } },
            { 0: 1, 1: 2, length: 2 } // array like object
        ].map((v, i) => test(`type ${i}`, () => eq(v, v)));

        return test.run()
        .then(({ passed }) =>
            eq(passed, tests.length)
        );
    });

    it("failed", () => {
        let test = junit(testOpts);

        test("basic 1", () => {
            return eq("ok", "ok");
        });
        test("basic 2", () => {
            return eq("ok", "ok1");
        });
        test("basic 3", () =>
            eq({ a: 1, b: 2 }, { a: 1, b: 2 })
        );

        return test.run()
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    });

    it("isEnd", () => {
        let test = junit(testOpts);

        test("isEnd resolve", () =>
            new Promise((r) => setTimeout(r, 100))
        );
        test("isEnd reject", () =>
            new Promise((r, rr) => setTimeout(rr, 100))
        );
        test("empty", () =>
            eq(1, 2)
        );

        return test.run()
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    });

    it("error", () => {
        let test = junit({
            isFailOnUnhandled: true,
            isBail: false,
            isThrowOnFinal: false,
            reporter: junit.reporter({ prompt: " sub >" })
        });

        test("empty", () => {
            throw new Error("fake err");
        });
        return test.run().then(({ failed }) => {
            eq(failed, 1);
        });
    });

    it("error with no stack", () => {
        let test = junit(testOpts);
        test("empty", () => {
            let err = new Error("fake err");
            err.stack = null;
            throw err;
        });
        return test.run().then(({ failed }) => {
            eq(failed, 1);
        });
    });

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

        eq(data1, data2);
    });

    it("max depth", () => {
        let test = junit({
            reporter: junit.reporter({ prompt: " sub >" }),
            isThrowOnFinal: false,
            isBail: false
        });

        test("over max depth", () => {
            let data1 = {
                a: { b: { c: { d:{ e:{ f:{ g:{ h:{} } } } } } } }
            };
            let data2 = {
                a: { b: { c: { d:{ e:{ f:{ g:{ h:{} } } } } } } }
            };
            return eq(data1, data2);
        });
        test("over max depth", () => {
            let data1 = {
                a: { b: { c: {} } }
            };
            let data2 = {
                a: { b: { c: {} } }
            };
            return eq(data1, data2, 2);
        });
        test("over max depth2", () => {
            let data1 = {
                a: [ [ [ [ [ [ [ [ ] ] ] ] ] ] ] ]
            };
            let data2 = {
                a: [ [ [ [ [ [ [ [ ] ] ] ] ] ] ] ]
            };
            return eq(data1, data2);
        });
        test("not over max depth with complex data", () => {
            let data1 = {
                l1: {
                    l2: {
                        l3: {
                            l4: 12,
                            l5: 41
                        },
                        l6: null,
                        l7: "12345",
                        l8: [12356]
                    },
                    l9: {
                        l10: 1,
                        l11: {
                            l12: "fly"
                        },
                        l13: {
                            l14: []
                        },
                        l15: {
                            l16: {
                                l17: null
                            }
                        }
                    }
                }
            };
            let data2 = {
                l1: {
                    l2: {
                        l3: {
                            l4: 12,
                            l5: 41
                        },
                        l6: null,
                        l7: "12345",
                        l8: [12356]
                    },
                    l9:  {
                        l10: 1,
                        l11: {
                            l12: "fly"
                        },
                        l13: {
                            l14: []
                        },
                        l15: {
                            l16: {
                                l17: null
                            }
                        }
                    }
                }
            };
            return eq(data1, data2);
        });

        return test.run()
        .then(({ failed }) => {
            return eq(failed, 3);
        });
    });

    it("undefined", () => {
        let test = junit(testOpts);

        test("undefined & null", () =>
            eq(void 0, null)
        );

        return test.run()
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    });

    it("elements number", () => {
        let test = junit(testOpts);

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
            return eq(data1, data2);
        });

        return test.run()
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    });

    it("attributes number", () => {
        let test = junit(testOpts);

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
            return eq(data1, data2);
        });

        return test.run()
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    });

    it("describe error", () => {
        let test = junit({
            reporter: junit.reporter({ prompt: " sub >" }),
            isThrowOnFinal: false
        });

        test("01", () => eq(1, 1));

        test.describe("a", (it) => {
            it("01", () => eq(1, 2));
        });

        return test.run().then(({ passed, failed }) => {
            return eq([passed, failed], [1, 1]);
        });
    });

    it("describe deep", () => {
        let reporter = junit.reporter({ prompt: " sub >" });
        let out = [];
        reporter.logPass = (msg) => out.push(msg);

        let test = junit({
            reporter: reporter,
            isThrowOnFinal: false
        });

        test("01", () => eq(1, 1));

        test.describe("a", (it) => {
            it("01", () => eq(1, 1));
            it("02", () => eq(1, 1));

            it.describe("b", (it) => {
                it(() => eq(1, 1));
                it("02", () => eq(1, 1));

                it.describe("c", (it) => {
                    it("01", () => eq(1, 1));
                    it("02", () => eq(1, 1));
                });
            });
        });

        return test.run().then(() => {
            return eq(out, [
                "01",
                ["a", "01"],
                ["a", "02"],
                ["a", "b", ""],
                ["a", "b", "02"],
                ["a", "b", "c", "01"],
                ["a", "b", "c", "02"]
            ]);
        });
    });

});
