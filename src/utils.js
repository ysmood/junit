"use strict";

import br from "./brush";

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

        return Promise.reject(newStack(
                `${br.red("<<<<<<< actual")}\n` +
                `${actual}\n` +
                `${br.red("=======")}\n` +
                `${expected}\n` +
                `${br.red(">>>>>>> expected")}`
        ));
    }
};
