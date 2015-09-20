"use strict";

import cmder from "commander";
import fs from "nofs";
import fsPath from "path";
import br from "./brush";
import reporter from "./reporter";
import junit from "./";

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
    .option("-s, --suit <module>", "a 'it' transformer which will be required as an function [(it, path) => it]", null)
    .option("-r, --register <str>", "language try to register [babel]", "babel/register")
    .option("-l, --limit <num>", "concurrent test limit [Infinity]", parseInt)
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
    require(cmder.register);
} catch (err) {
    /* istanbul ignore next */
    null;
}

let testReg = new RegExp(cmder.grep);
let suit;

function run () {
    let it = junit({
        isExitWithFailed: !cmder.watch,
        reporter: reporter(cmder.prompt),
        isBail: cmder.isBail,
        isFailOnUnhandled: cmder.isFailOnUnhandled,
        timeout: cmder.timeout || 5000
    });

    // test suit hook
    /* istanbul ignore else */
    if (cmder.suit) {
        try {
            suit = require.resolve(cmder.suit);
        } catch (err) {
            suit = require(fsPath.resolve(cmder.suit));
        }
    } else {
        suit = (it) => it;
    }

    let tests = [];
    return fs.glob(cmder.args, {
        iter: ({ path }) => tests = tests.concat(require(
            fsPath.resolve(path)
        )(suit(it, path)))
    }).then(() => {
        return it.run(
            cmder.limit || Infinity,
            tests.filter(({ msg }) => testReg.test(msg))
        );
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
