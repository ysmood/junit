"use strict";

import cmder from "commander";
import fs from "nofs";
import fsPath from "path";
import br from "./brush";
import junit from "./";
import defaultReporter from "./reporter";

let subArgIndex = process.argv.indexOf("--");

/* istanbul ignore if */
if (subArgIndex > -1) {
    // This is hotfix of the Commander.js bug.
    process.argv.splice(subArgIndex, 1);
}

cmder
    .description("junit cli tool to run tests automatically")
    .usage("[options] [file | pattern...]")
    .option("-o --reporter <module>", "a reporter module [{ formatAssertErr, logPass, logFail, logFinal }]", null)
    .option("-r, --requires <str>", "pre-require modules [babel-core/register,babel-polyfill]", "babel-core/register,babel-polyfill")
    .option("-g, --grep <pattern>", "only run tests matching the pattern", "")
    .option("-t, --timeout <num>", "case timeout in milliseconds [5000]", parseInt)
    .option("-b, --isBail", "bail after first test failure [true]")
    .option("-f, --isFailOnUnhandled", "failed on unhandled exception [true]")
    .option(
        "-p, --prompt <str>", "the prompt string ['junit cli >']",
        br.underline(br.grey("junit cli >"))
    )
    .on("--help",
        /* istanbul ignore next */
        function () {
            console.log(
                "  Examples:\n\n" +
                "    junit test/*.js\n" +
                "    junit test.es7.js\n" +
                "    junit -r coffee-script test.coffee\n" +
                "    noe -b junit -w '*.js' -- test.js\n"
            );
        }
    )
.parse(process.argv);

try {
    cmder.requires.split(",").map(require);
} catch (err) {
    /* istanbul ignore next */
    null;
}

let testReg = new RegExp(cmder.grep);
let reporter;

/* istanbul ignore next */
function loadModule (name) {
    try {
        return require.resolve(name);
    } catch (err) {
        let mod = require(fsPath.resolve(name));
        mod = typeof mod === "function" ? mod : mod.default;
        return mod;
    }
}

function run () {
    // reporter hook
    /* istanbul ignore if */
    if (cmder.reporter) {
        reporter = loadModule(cmder.reporter);
    } else {
        reporter = defaultReporter(cmder.prompt);
    }

    let it = junit({
        filter: msg => testReg.test(msg),
        reporter: reporter,
        isBail: cmder.isBail,
        isThrowOnFinal: false,
        isFailOnUnhandled: cmder.isFailOnUnhandled,
        timeout: cmder.timeout || 5000
    });

    return fs.glob(cmder.args, {
        iter: ({ path }) => {
            let mod = require(fsPath.resolve(path));
            return (typeof mod === "function" ? mod : mod.default)(it);
        }
    }).then(it.run).then(({ failed }) => {
        /* istanbul ignore next */
        if (failed) process.exit(1);
    });
}

run();
