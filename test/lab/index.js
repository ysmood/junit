import junit from "../../src";

let it = junit();
let {eq} = it;

it.describe("level 01", (it) => {
    it("test 01", () => eq(1, 1));

    it("test 02", () => eq(1, 1));

    it.describe("level 02", (it) => {

        it.describe("level 03", it => {
            it("test 01", () => eq(1, 1));

            it("test 02", () => eq(1, 1));
        });

        it("test 01", () => eq(1, 1));

        it("test 02", () => eq(1, 1));

    });
});

it.run();
