"use strict";

import Promise from "yaku";

function stringify (val) {
    if (typeof val === "undefined") {
        return "undefined";
    } else {
        return JSON.stringify(val, 0, 4);
    }
}

var equal = () => {
    let maxDepth,
        curDepth,
        isArray = Array.isArray;

    let isPureObj = (json) => json && typeof json === "object" && !isArray(json);
    let getLen = (json) => {
        if(isArray(json)) return json.length;
        if(json && typeof json === "object") return Object.getOwnPropertyNames(json).length;
    };
    let nextPath = (path, next) => path === "" ? next : path + "." + next;
    let joinRes = (res, json1, json2, path) => res ? { pass: true } : { pass: false, path, json1, json2 };

    let eq = (json1, json2, path = "") => {
        if(curDepth > maxDepth) {
            throw new Error("exceed max recursive depth: 7");
        }
        let isBothArr = isArray(json1) && isArray(json2);
        let isBothObj = isPureObj(json1) && isPureObj(json2);

        let json = getLen(json1) > getLen(json2) ? json1 : json2;
        if (isBothArr) {
            curDepth++;
            for (let i = 0; i < json.length; i++) {
                let eqRes = eq(json1[i], json2[i], nextPath(path, i));
                if (!eqRes.pass) {
                    return eqRes;
                }
            }
        } else if (isBothObj) {
            curDepth++;
            for (let name in json) {
                let eqRes = eq(json1[name], json2[name], nextPath(path, name));
                if (!eqRes.pass) {
                    return eqRes;
                }
            }
        } else if (json1 !== json2) {
            return joinRes(false, json1, json2, path);
        }

        return joinRes(true);
    };
    return (json1, json2, path, md) => {
        curDepth = 1;
        maxDepth = md || 7;
        return eq(json1, json2, path);
    };
}();

export default {
    extend: (obj, src) => {
        for (var key in src) {
            obj[key] = src[key];
        }
        return obj;
    },

    eq: (formatAssertErr) => (actual, expected) => {
        if(equal(actual, expected).pass)
            return Promise.resolve();

        let { stack } = new Error("Assertion");

        /* istanbul ignore next */
        if (typeof __filename !== "undefined")
            stack = stack.replace(
                new RegExp(`.+${__filename}.+\\n`, "g"), ""
            );

        return Promise.reject(
            formatAssertErr(stringify(actual), stringify(expected), stack)
        );
    }
};
