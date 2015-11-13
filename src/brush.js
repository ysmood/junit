"use strict";

let codes, genBrush;
let brush = {
    isEnabled: true
};

codes = {
    underline: [`\u001b[4m`, `\u001b[24m`, `<span class="underline" style="text-decoration: underline;">`, `</span>`],
    red: [`\u001b[31m`, `\u001b[39m`, `<span class="red" style="color: #E25757;">`, `</span>`],
    green: [`\u001b[32m`, `\u001b[39m`, `<span class="green" style="color: #66B55E;">`, `</span>`],
    yellow: [`\u001b[33m`, `\u001b[39m`, `<span class="yellow" style="color: #C7B414;">`, `</span>`],
    cyan: [`\u001b[36m`, `\u001b[39m`, `<span class="cyan" style="color: #00B5B5;">`, `</span>`],
    grey: [`\u001b[90m`, `\u001b[39m`, `<span class="grey" style="color: #A5A5A5;">`, `</span>`]
};

genBrush = function (code) {
    return function (str) {
        if (brush.isEnabled) {
            /* istanbul ignore next */
            if (typeof window === "object")
                return code[2] + str + code[3];
            else
                return code[0] + str + code[1];
        } else {
            return str;
        }
    };
};

for (let k in codes) {
    brush[k] = genBrush(codes[k]);
}

export default brush;
