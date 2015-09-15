import junit from "../src";
import Promise from "yaku";

let it = junit({ isThrowOnFinal: false });

// Async tests
it.async([
    it("basic 2", () =>
        setTimeout(() => Promise.reject(10), 3000)
    )
]);
