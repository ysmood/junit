import "babel/polyfill";
import junit from "../../src";
import basic from "../basic";

let it = junit();

basic({ it, eq: it.eq });

it.run();
