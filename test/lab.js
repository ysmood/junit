import ken from "../src";

let it = ken({ isThrowOnFinal: false });

// Async tests
it.async([
    it("basic 2", () =>
        it.eq("10", undefined)
    )
]);
