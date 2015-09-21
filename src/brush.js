"use strict";

var codes, genBrush, k, v;

codes = {
    underline: [4, 24],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    cyan: [36, 39],
    white: [37, 39],
    grey: [90, 39]
};

genBrush = function (code) {
    return function (str) {
        if (module.exports.isEnabled) {
            return code.open + str + code.close;
        } else {
            return str;
        }
    };
};

module.exports = {};

for (k in codes) {
    v = codes[k];
    module.exports[k] = genBrush({
        open: "\u001b[" + v[0] + "m",
        close: "\u001b[" + v[1] + "m"
    });
}

module.exports.isEnabled = typeof window === "undefined";
