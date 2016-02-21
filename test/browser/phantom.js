import "babel-polyfill";
import junit from "../../src";
import basic from "../basic";

let it = junit();

basic(it);

it.run().then(({ failed }) => {
    phantom.exit(failed === 0 ? 0 : 1); // eslint-disable-line
});
