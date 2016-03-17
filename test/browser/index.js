import "babel-polyfill";
import junit from "../../src";
import basic from "../basic";

let it = junit();

basic(it);

it.run();

