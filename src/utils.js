"use strict";

import br from "./brush";
import { wordDiff } from "diff/lib/diff/word";



function stringify (val) {
    if (typeof val === "undefined") {
        return "undefined";
    } else {
        return JSON.stringify(val, 0, 4);
    }
}

function newStack (info) {
    let { stack } = new Error();
    if (typeof __filename !== "undefined")
        stack = stack.replace(
            new RegExp(`.+${__filename}.+\\n`, "g"), ""
        );

    return indent(info + "\n\n" + br.grey(stack));
}

function indent (text) {
    return text.replace(/^/mg, "  ");
}

export default {
    extend: (obj, src) => {
        for (var key in src) {
            obj[key] = src[key];
        }
        return obj;
    },

    eq: (actual, expected) => {
        actual = stringify(actual);
        expected = stringify(expected);

        if (actual === expected)
            return Promise.resolve();

        let diff = wordDiff.diff(actual, expected).reduce(
            (s, p) => {
                return s + (p.added ? br.bgGreen(p.value) : (
                    p.removed ? br.bgRed(p.value) : br.white(p.value)
                ));
            },
            ""
        );

        return Promise.reject(newStack(
            `${br.bgRed("actual")} ${br.bgGreen("expected")}\n\n${diff}`
        ));
    }
};
