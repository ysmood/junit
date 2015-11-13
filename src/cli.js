"use strict";

import cmder from "commander";
import fs from "nofs";
import fsPath from "path";
import br from "./brush";
import junit from "./";
import defaultReporter from "./reporter";

let watchList = [];

let subArgIndex = process.argv.indexOf("--");

/* istanbul ignore if */
if (subArgIndex > -1) {
    // This is hotfix of the Commander.js bug.
    process.argv.splice(subArgIndex, 1);
}

cmder
    .description("junit cli tool to run / watch tests automatically")
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
    .option("-w, --watch [pattern]", "watch file pattern list",
        /* istanbul ignore next */
        function (p) {
            watchList.push(p);
        }
    )
    .on("--help",
        /* istanbul ignore next */
        function () {
            console.log(
                "  Examples:\n\n" +
                "    junit test/*.js\n" +
                "    junit test.es7.js\n" +
                "    junit -w 'test/**/*.js' -w 'src/*.js' test.js\n" +
                "    junit -r coffee-script test.coffee\n"
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
        mod = mod && mod.default;
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
        isThrowOnFinal: !cmder.watch,
        reporter: reporter,
        isBail: cmder.isBail,
        isFailOnUnhandled: cmder.isFailOnUnhandled,
        timeout: cmder.timeout || 5000
    });

    return fs.glob(cmder.args, {
        iter: ({ path }) => {
            let mod = require(fsPath.resolve(path));
            return (mod && mod.default)(it);
        }
    }).then(() => {
        return it.run();
    });
}

run();

/* istanbul ignore if */
if (cmder.watch) {
    let sep = "";

    for (let i = process.stdout.columns; i > 0; i--) {
        sep += "*";
    }

    let handler = (path) => {
        process.stdout.write(br.yellow(sep));
        console.log(cmder.prompt, br.cyan("file modified:"), path);
        delete require.cache[fsPath.resolve(path)];
        run();
    };

    let list = [];
    fs.glob(cmder.args.concat(watchList), { iter: ({path}) => {
        if (list.indexOf(path) > -1) return;
        list.push(path);
        fs.watchPath(path, { handler });
    } });
}
