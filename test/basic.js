import junit from "../src";
import br from "../src/brush";
import Promise from "yaku";

let testOpts = {
    reporter: junit.reporter(" sub >"),
    isExitWithFailed: false
};

export default ({ it, eq }) => [

    it("msg", () => {
        let test = junit();

        return eq(test("test msg").msg, "test msg");
    }),

    it("all passed", () => {
        let test = junit(testOpts);

        // Async tests
        return test.run([
            test("basic 1", () =>
                eq("ok", "ok")
            ),
            test("basic 2", () =>
                eq({ a: 1, b: 2 }, { a: 1, b: 2 })
            ),

            // Sync tests
            async () => {
                await test("basic 3", () =>
                    eq("ok", "ok")
                )();

                await test("basic 4", () =>
                    eq("ok", "ok")
                )();
            }
        ])
        .then(({ passed }) =>
            eq(passed, 4)
        );
    }),

    it("async await all", async () => {
        let test = junit(testOpts);

        await test("basic 1", () =>
            eq("ok", "ok")
        )();

        await test("basic 2", () =>
            eq({ a: 1, b: 2 }, { a: 1, b: 2 })
        )();

        return eq((await test.run()).passed, 2);
    }),

    it("all passed sync", () => {
        let test = junit(testOpts);

        return test.run(1, [
            test("basic 1", () =>
                eq("ok", "ok")
            ),
            test("basic 2", () =>
                eq({ a: 1, b: 2 }, { a: 1, b: 2 })
            )
        ])
        .then(({ passed }) =>
            eq(passed, 2)
        );
    }),

    it("disable brush", () => {
        br.isEnabled = false;
        br.red("ok");
        br.isEnabled = true;
    }),

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

        return test.run(tests)
        .then(({ passed }) =>
            eq(passed, tests.length)
        );
    }),

    it("failed", () => {
        let test = junit(testOpts);

        // Async tests
        return test.run([
            test("basic 1", () => {
                return eq("ok", "ok");
            }),
            test("basic 2", () => {
                return eq("ok", "ok1");
            }),
            test("basic 3", () =>
                eq({ a: 1, b: 2 }, { a: 1, b: 2 })
            )
        ])
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    }),

    it("isEnd", () => {
        let test = junit(testOpts);

        return test.run([
            test("isEnd resolve", () =>
                new Promise((r) => setTimeout(r, 100))
            ),
            test("isEnd reject", () =>
                new Promise((r, rr) => setTimeout(rr, 100))
            ),
            test("empty", () =>
                eq(1, 2)
            )
        ])
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    }),

    it("error", () => {
        let test = junit({
            isFailOnUnhandled: false,
            isBail: false,
            isExitWithFailed: false,
            reporter: junit.reporter(" sub >")
        });

        return test.run([
            test("empty", () => {
                throw new Error("fake err");
            })
        ]);
    }),

    it("unhandled", () => {
        return new Promise((resolve, reject) => {
            let old = Promise.onUnhandledRejection;

            Promise.onUnhandledRejection = (reason) => {
                if (reason === "fake unhandled")
                    resolve();
                else
                    reject();

                Promise.onUnhandledRejection = old;
            };

            Promise.reject("fake unhandled");
        });
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

        eq(data1, data2);
    }),

    it("max depth", () => {
        let test = junit(testOpts);

        return test.run([
            test("over max depth", () => {
                let data1 = {
                    a: { b: { c: { d:{ e:{ f:{ g:{ h:{} } } } } } } }
                };
                let data2 = {
                    a: { b: { c: { d:{ e:{ f:{ g:{ h:{} } } } } } } }
                };
                return eq(data1, data2);
            }),
            test("over max depth", () => {
                let data1 = {
                    a: { b: { c: {} } }
                };
                let data2 = {
                    a: { b: { c: {} } }
                };
                return eq(data1, data2, 2);
            }),
            test("over max depth2", () => {
                let data1 = {
                    a: [ [ [ [ [ [ [ [ ] ] ] ] ] ] ] ]
                };
                let data2 = {
                    a: [ [ [ [ [ [ [ [ ] ] ] ] ] ] ] ]
                };
                return eq(data1, data2);
            }),
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
            })
        ])
        .then(({ failed }) => {
            return eq(failed, 3);
        });
    }),

    it("undefined", () => {
        let test = junit(testOpts);

        return test.run([
            test("undefined & null", () =>
                eq(void 0, null)
            )
        ])
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    }),

    it("elements number", () => {
        let test = junit(testOpts);

        return test.run([
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
            })
        ])
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    }),

    it("attributes number", () => {
        let test = junit(testOpts);

        return test.run([
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
            })
        ])
        .then(({ failed }) => {
            return eq(failed, 1);
        });
    })

];
