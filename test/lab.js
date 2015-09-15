import junit from "../src";

let it = junit({ isThrowOnFinal: false });

// Async tests
it.async([
    it("basic 2", () =>
        it.eq("10", undefined)
    )
]);
