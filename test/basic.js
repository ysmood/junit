import junit from "../src";
import yutils from "yaku/lib/utils";
import br from "../src/brush";
import Promise from "yaku";

let it = junit();
let testOpts = { title: " sub >" };

it.async([

    it("msg", () => {
        let test = junit(testOpts);

        return it.eq(test("test msg").msg, "test msg");
    }),

    // TODO: fix this bug
    // it("order", () =>
    //     it.eq({ a: 1, b: 2 }, { b: 2, a: 1 })
    // ),

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
            new Buffer("test")
        ].map((v, i) => test(`type ${i}`, () => it.eq(v, v)));

        return test.async(tests)
        .then(({ passed }) =>
            it.eq(passed, tests.length)
        );
    }),

    it("failed", () => {
        br.isEnabled = false;
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
            br.isEnabled = true;
            return it.eq(failed, 1);
        });
    }),

    it("isEnd", () => {
        let test = junit(testOpts);

        // Async tests
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
    })

]);
