import "babel-polyfill";
import junit from "../../src";
import basic from "../basic";

let it = junit({
    reporter: junit.reporter({
        mode: "browser"
    })
});

basic(it, "browser");

it.run();
