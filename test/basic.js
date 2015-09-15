import ken from "../src";
import yutils from "yaku/lib/utils";

let it = ken();

it.async([

    it("all passed", () => {
        let test = ken({ isThrowOnFinal: false });

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
            it.eq(4, passed)
        );
    }),

    it("failed", () => {
        let test = ken({ isThrowOnFinal: false });

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
        .then(({ failed }) =>
            it.eq(1, failed)
        );
    })
]);
