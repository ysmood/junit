"use strict";

import { red, grey, cyan, green, underline } from "./brush";
import { inspect } from "util";

let regCleanStack = /^.+\/node_modules\/junit\/.+\n?/mg;
let regIndent = /^/mg;

function indent (str) {
    return (str + "").replace(regIndent, "  ");
}

function log (type) { return function () {
    /* istanbul ignore if */
    if (typeof window === "object") {
        let mainElem = window["junit-reporter"];
        if (mainElem) {
            let pre = document.createElement("pre");
            pre.style.fontFamily = `Monaco, "Lucida Console", Courier`;
            for (let i = 0; i < arguments.length; i++) {
                let span = document.createElement("span");
                span.innerHTML = arguments[i] + " ";
                pre.appendChild(span);
            }
            mainElem.appendChild(pre);
        } else {
            alert(`JUnit: You must add a '<div id="junit-reporter"></div>' element to the DOM`);
        }
    } else {
        console[type].apply(console, arguments);
    }
}; }

function inspectObj (obj) {
    /* istanbul ignore else */
    if (typeof window === "undefined")
        return inspect(obj, { depth: 7, colors: true });
    else
        return JSON.stringify(obj, 0, 4);
}

let logPass = log("log");
let logFail = log("error");
let logFinal = log("info");

export default (pt = underline(grey("junit >"))) => {
    return {
        formatAssertErr: (actual, expected) => {
            let { stack } = new Error("Assertion");
            stack = stack && stack.replace(regCleanStack, "");

            return indent(
                `${red("\n<<<<<<< actual")}\n` +
                `${inspectObj(actual)}\n` +
                `${red("=======")}\n` +
                `${inspectObj(expected)}\n` +
                `${red(">>>>>>> expected")}\n\n` +
                grey(stack)
            );
        },

        logPass: (msg, span) => {
            logPass(pt, green("o"), msg, grey(`(${span}ms)`));
        },

        logFail: (msg, err, span) => {
            err = err instanceof Error ?
                indent(err.stack ? err.stack : err.message) : err;

            logFail(
                `${pt} ${red("x")} ${msg} ` +
                grey(`(${span}ms)`) + `\n${err}\n`
            );
        },

        logFinal: (total, tested, passed, failed) => {
            logFinal(
                `${pt} ${cyan("tested")} ${tested} / ${total}\n` +
                `${pt} ${cyan("passed")} ${green(passed)}\n` +
                `${pt} ${cyan("failed")} ${red(failed)}`);
        }
    };
};
