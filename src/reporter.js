"use strict";

import { red, grey, white, cyan, green } from "./brush";

function stringify (val) {
    if (typeof val === "undefined") {
        return "undefined";
    } else {
        return JSON.stringify(val, 0, 4);
    }
}

let regCleanStack = /^.+\/node_modules\/junit\/.+\n?/mg;

export default (pt) => {
    return {
        formatAssertErr: (actual, expected) => {
            let { stack } = new Error("Assertion");
            stack = stack && stack.replace(regCleanStack, "");

            return (
                `${red("\n<<<<<<< actual")}\n` +
                `${stringify(actual)}\n` +
                `${red("=======")}\n` +
                `${stringify(expected)}\n` +
                `${red(">>>>>>> expected")}\n\n` +
                grey(stack)
            ).replace(/^/mg, "  ");
        },

        logPass: (msg, span) => {
            console.log(pt, green("o"), msg, grey(`(${span}ms)`));
        },

        logFail: (msg, err, span) => {
            err = err instanceof Error ? err.stack : err;
            console.error(
                `${pt} ${red("x")} ${msg} ` +
                grey(`(${span}ms)`) + `\n${err}\n`
            );
        },

        logFinal: (total, tested, passed, failed) => {
            console.info(
                `${pt} ${cyan("tested")} ${white(tested)} / ${white(total)}\n` +
                `${pt} ${cyan("passed")} ${green(passed)}\n` +
                `${pt} ${cyan("failed")} ${red(failed)}`);
        }
    };
};
