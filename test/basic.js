import junit from "../src";
import br from "../src/brush";
import Promise from "yaku";

let testOpts = {
    reporter: junit.reporter(" sub >"),
    isThrowOnFinal: false
};

export default ({ it, eq }) => [

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
    })


];
