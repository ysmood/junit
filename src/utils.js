"use strict";

import Promise from "yaku";

function stringify (val) {
    if (typeof val === "undefined") {
        return "undefined";
    } else {
        return JSON.stringify(val, 0, 4);
    }
}

export default {
    extend: (obj, src) => {
        for (var key in src) {
            obj[key] = src[key];
        }
        return obj;
    },

    eq: (formatAssertErr) => (actual, expected) => {
        actual = stringify(actual);
        expected = stringify(expected);

        if (actual === expected)
            return Promise.resolve();

        let { stack } = new Error("Assertion");

        /* istanbul ignore next */
        if (typeof __filename !== "undefined")
            stack = stack.replace(
                new RegExp(`.+${__filename}.+\\n`, "g"), ""
            );

        return Promise.reject(
            formatAssertErr(actual, expected, stack)
        );
    }
};
