import "babel/polyfill";
import junit from "../../src";
import basic from "../basic";

let it = junit();

it.run(basic({ it, eq: it.eq }));
