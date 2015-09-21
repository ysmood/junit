import junit from "../../src";

let it = junit();

// Async tests
it.run([

    it("sleep 1 sec", () =>
        junit.yutils.sleep(1000)
    ),

    it("sleep 1 sec", () =>
        junit.yutils.sleep(1000)
    ),

    it("test number", () =>
        it.eq(1, 2)
    )

]);
