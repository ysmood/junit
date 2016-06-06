"use strict";

var junit = require("../lib");
var br = require("../lib/brush");
var Promise = require("yaku");

module.exports = function (it, mode) {
    return it.describe("basic: ", function (it) {
        var testOpts = {
            reporter: junit.reporter({
                prompt: " sub >",
                mode: mode
            }),
            isThrowOnFinal: false
        };

        var eq = it.eq;


        it("empty option", function () {
            var test = junit();

            test("test", function () {
                return eq(1, 1);
            });

            return test.run();
        });

        it("no message", function () {
            var test = junit();

            test(function () {
                return eq(1, 1);
            });

            return test.run();
        });

        it("error object", function () {
            var test = junit(testOpts);

            test("test", function () {
                return Promise.reject({ a: 10 });
            });

            return test.run().catch(function (_ref) {
                var failed = _ref.failed;

                return eq(failed, 1);
            });
        });

        it("after hook", function () {
            var test = junit(testOpts);

            var queue = [];

            test("test", function (after) {
                after(function () {
                    queue.push(2);
                });

                queue.push(1);
                return eq(1, 1);
            });

            return test.run().then(function () {
                return eq(queue, [1, 2]);
            });
        });

        it("after hook when error", function () {
            var test = junit(testOpts);

            var queue = [];

            test("test", function (after) {
                after(function () {
                    queue.push(2);
                });

                queue.push(1);
                return eq(1, 2);
            });

            return test.run().catch(function () {}).then(function () {
                return eq(queue, [1, 2]);
            });
        });

        it("after hook when log error", function () {
            var reporter = junit.reporter({ prompt: " sub >" });
            reporter.logFail = function () {
                throw "err";
            };

            var test = junit({
                reporter: reporter,
                isThrowOnFinal: false
            });

            var queue = [];

            test("test", function (after) {
                after(function () {
                    queue.push(2);
                });

                queue.push(1);
                return eq(1, 2);
            });

            return test.run().catch(function () {}).then(function () {
                return eq(queue, [1, 2]);
            });
        });

        it("all passed", function () {
            var test = junit(testOpts);

            // Async tests
            test("basic 1", function () {
                return eq("ok", "ok");
            });
            test("basic 2", function () {
                return eq({ a: 1, b: 2 }, { a: 1, b: 2 });
            });

            // Sync tests
            return test("basic 3", function () {
                return eq("ok", "ok");
            }).then(function () {
                return test("basic 4", function () {
                    return eq("ok", "ok");
                });
            }).then(function () {
                return test("basic 5", function () {
                    return eq(Promise.resolve("ok"), "ok");
                });
            }).then(function () {
                return test.run().then(function (info) {
                    return eq(info.passed, 5);
                });
            });
        });

        it("sync bail", function () {
            var test = junit(testOpts);

            // Sync tests
            return test("basic 1", function () {
                return eq("ok", "ok1");
            }).then(function () {
                return test("basic 1", function () {
                    return eq("ok", "ok");
                });
            }).then(function () {
                return test.run().then(function (info) {
                    return eq([info.tested, info.failed, info.total], [1, 1, 2]);
                });
            });
        });

        it("all passed sync", function () {
            var test = junit(testOpts);

            return test("basic 1", function () {
                return eq("ok", "ok");
            }).then(function () {
                return test("basic 2", function () {
                    return eq({ a: 1, b: 2 }, { a: 1, b: 2 });
                });
            }).then(function () {
                return test.run().then(function (_ref2) {
                    var passed = _ref2.passed;
                    return eq(passed, 2);
                });
            });
        });

        it("filter", function () {
            var test = junit({
                filter: function (msg) {
                    return msg.indexOf("test") === 0;
                },
                reporter: junit.reporter({ prompt: " sub >" }),
                isThrowOnFinal: false
            });

            test("test 1", function () {
                return eq("ok", "ok");
            });
            test("test 2", function () {
                return eq("ok", "ok");
            });

            test("basic 1", function () {
                return eq(1, 1);
            });
            test("basic 2", function () {
                return eq(1, 1);
            });

            return test.run().then(function (ret) {
                return eq(ret, { total: 4, tested: 2, passed: 2, failed: 0 });
            });
        });

        it("disable brush", function () {
            var _br = br({ mode: "none" });

            var red = _br.red;

            eq(red("ok"), "ok");
        });

        it("type check", function () {
            var test = junit(testOpts);

            var tests = [
                "string",
                new Date(),
                [1, 2],
                0,
                1,
                void 0,
                null,
                { a: { b: { c: "test" } } },
                { 0: 1, 1: 2, length: 2 } // array like object
            ].map(function (v, i) {
                return test("type " + i, function () {
                    return eq(v, v);
                });
            });

            return test.run().then(function (_ref3) {
                var passed = _ref3.passed;
                return eq(passed, tests.length);
            });
        });

        it("failed", function () {
            var test = junit(testOpts);

            test("basic 1", function () {
                return eq("ok", "ok");
            });
            test("basic 2", function () {
                return eq("ok", "ok1");
            });
            test("basic 3", function () {
                return eq({ a: 1, b: 2 }, { a: 1, b: 2 });
            });

            return test.run().then(function (_ref4) {
                var failed = _ref4.failed;

                return eq(failed, 1);
            });
        });

        it("isEnd", function () {
            var test = junit(testOpts);

            test("isEnd resolve", function () {
                return new Promise(function (r) {
                    return setTimeout(r, 100);
                });
            });
            test("isEnd reject", function () {
                return new Promise(function (r, rr) {
                    return setTimeout(rr, 100);
                });
            });
            test("empty", function () {
                return eq(1, 2);
            });

            return test.run().then(function (_ref5) {
                var failed = _ref5.failed;

                return eq(failed, 1);
            });
        });

        it("error", function () {
            var test = junit({
                isFailOnUnhandled: true,
                isBail: false,
                isThrowOnFinal: false,
                reporter: junit.reporter({ prompt: " sub >" })
            });

            test("empty", function () {
                throw new Error("fake err");
            });
            return test.run().then(function (_ref6) {
                var failed = _ref6.failed;

                eq(failed, 1);
            });
        });

        it("error with no stack", function () {
            var test = junit(testOpts);
            test("empty", function () {
                var err = new Error("fake err");
                err.stack = null;
                throw err;
            });
            return test.run().then(function (_ref7) {
                var failed = _ref7.failed;

                eq(failed, 1);
            });
        });

        it("nesting", function () {
            var data1 = {
                a: 1,
                b: [1, 2, 3],
                c: "ok",
                d: null,
                e: {
                    f: 2,
                    g: true
                }
            };
            var data2 = {
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

        it("max depth", function () {
            var test = junit({
                reporter: junit.reporter({ prompt: " sub >" }),
                isThrowOnFinal: false,
                isBail: false
            });

            test("over max depth", function () {
                var data1 = {
                    a: { b: { c: { d: { e: { f: { g: { h: {} } } } } } } }
                };
                var data2 = {
                    a: { b: { c: { d: { e: { f: { g: { h: {} } } } } } } }
                };
                return eq(data1, data2);
            });
            test("over max depth", function () {
                var data1 = {
                    a: { b: { c: {} } }
                };
                var data2 = {
                    a: { b: { c: {} } }
                };
                return eq(data1, data2, 2);
            });
            test("over max depth2", function () {
                var data1 = {
                    a: [[[[[[[[]]]]]]]]
                };
                var data2 = {
                    a: [[[[[[[[]]]]]]]]
                };
                return eq(data1, data2);
            });
            test("not over max depth with complex data", function () {
                var data1 = {
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
                var data2 = {
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
                return eq(data1, data2);
            });

            return test.run().then(function (_ref8) {
                var failed = _ref8.failed;

                return eq(failed, 3);
            });
        });

        it("undefined", function () {
            var test = junit(testOpts);

            test("undefined & null", function () {
                return eq(void 0, null);
            });

            return test.run().then(function (_ref9) {
                var failed = _ref9.failed;

                return eq(failed, 1);
            });
        });

        it("elements number", function () {
            var test = junit(testOpts);

            test("elements number", function () {
                var data1 = {
                    a: 1,
                    b: {
                        d: ["1", "2"]
                    }
                };
                var data2 = {
                    b: {
                        d: ["1", "2", "3"]
                    },
                    a: 1
                };
                return eq(data1, data2);
            });

            return test.run().then(function (_ref10) {
                var failed = _ref10.failed;

                return eq(failed, 1);
            });
        });

        it("attributes number", function () {
            var test = junit(testOpts);

            test("attributes number", function () {
                var data1 = {
                    b: {
                        d: ["1", "2"],
                        c: "10-2",
                        e: 5
                    },
                    a: 1
                };
                var data2 = {
                    a: 1,
                    b: {
                        c: "10-2",
                        d: ["1", "2"]
                    }
                };
                return eq(data1, data2);
            });

            return test.run().then(function (_ref11) {
                var failed = _ref11.failed;

                return eq(failed, 1);
            });
        });

        it("describe error", function () {
            var test = junit({
                reporter: junit.reporter({ prompt: " sub >" }),
                isThrowOnFinal: false
            });

            test("01", function () {
                return eq(1, 1);
            });

            test.describe("a", function (it) {
                it("01", function () {
                    return eq(1, 2);
                });
            });

            return test.run().then(function (_ref12) {
                var passed = _ref12.passed;
                var failed = _ref12.failed;

                return eq([passed, failed], [1, 1]);
            });
        });

        it("describe deep", function () {
            var reporter = junit.reporter({ prompt: " sub >" });
            var out = [];
            reporter.logPass = function (msg) {
                return out.push(msg);
            };

            var test = junit({
                reporter: reporter,
                isThrowOnFinal: false
            });

            test("01", function () {
                return eq(1, 1);
            });

            test.describe("a", function (it) {
                it("01", function () {
                    return eq(1, 1);
                });
                it("02", function () {
                    return eq(1, 1);
                });

                it.describe("b", function (it) {
                    it(function () {
                        return eq(1, 1);
                    });
                    it("02", function () {
                        return eq(1, 1);
                    });

                    it.describe("c", function (it) {
                        it("01", function () {
                            return eq(1, 1);
                        });
                        it("02", function () {
                            return eq(1, 1);
                        });
                    });
                });
            });

            return test.run().then(function () {
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
};