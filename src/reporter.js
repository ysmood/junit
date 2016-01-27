"use strict";

import brush from "./brush";
import util from "util";
import utils from "./utils";

let { red, grey, cyan, green, underline } = brush;
let { inspect } = util;
let { isArray } = utils;

let regCleanStack = /^.+(\/node_modules\/|(node\.js:\d+:\d+)).+\n?/mg;
let regIndent = /^/mg;

function indent (str) {
    return (str + "").replace(regIndent, "  ");
}

function log (type) { return function () {
    /* istanbul ignore next */
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
    if (typeof obj === "string")
        return obj;

    /* istanbul ignore else */
    if (typeof window === "undefined")
        return inspect(obj, { depth: 7, colors: true });
    else
        return JSON.stringify(obj, 0, 4);
}

function formatMsg (msg) {
    if (isArray(msg))
        return msg.join(grey(" - "));
    else
        return msg;
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
            logPass(pt, green("o"), formatMsg(msg), grey(`(${span}ms)`));
        },

        logFail: (msg, err, span) => {
            err = err instanceof Error ?
                indent(err.stack ? err.stack : err.message) : inspectObj(err);

            logFail(
                `${pt} ${red("x")} ${formatMsg(msg)} ` +
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
