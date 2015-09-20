"use strict";

import cmder from "commander";
import fs from "nofs";
import fsPath from "path";
import br from "./brush";
import reporter from "./reporter";
import junit from "./";

let watchList;

let subArgIndex = process.argv.indexOf("--");

/* istanbul ignore if */
if (subArgIndex > -1) {
    // This is hotfix of the Commander.js bug.
    process.argv.splice(subArgIndex, 1);
}

cmder
    .description("junit cli tool to run / watch tests automatically")
    .usage("[options] [file | pattern...]")
    .option("-r, --register <str>", "language try to register [babel]", "babel")
    .option("-l, --limit <num>", "concurrent test limit", parseInt)
    .option("-g, --grep <pattern>", "only run tests matching the pattern", "")
    .option("-t, --timeout <num>", "case timeout in milliseconds [5000]", parseInt)
    .option("-b, --isBail", "bail after first test failure")
    .option("-f, --isFailOnUnhandled", "failed on unhandled exception")
    .option(
        "-p, --prompt <str>", "the prompt string ['junit cli >']",
        br.underline(br.grey("junit cli >"))
    )
    .option("-w, --watch <pattern>", "watch file pattern list",
        /* istanbul ignore next */
        function (p) {
            if (!watchList) watchList = [];
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
    require(`${cmder.register}/register`);
} catch (err) {
    /* istanbul ignore next */
    null;
}

let testReg = new RegExp(cmder.grep);

function run () {
    let it = junit({
        isExitWithFailed: !watchList,
        reporter: reporter(cmder.prompt),
        isBail: cmder.isBail,
        isFailOnUnhandled: cmder.isFailOnUnhandled,
        timeout: cmder.timeout || 5000
    });
    let tests = [];
    return fs.glob(cmder.args, {
        iter: (f) => tests = tests.concat(require(
            fsPath.resolve(f.path)
        )(it))
    }).then(() => {
        return it.run(
            cmder.limit || Infinity,
            tests.filter(({ msg }) => testReg.test(msg))
        );
    });
}

run();

/* istanbul ignore if */
if (watchList) {
    let sep = "";

    for (let i = process.stdout.columns; i > 0; i--) {
        sep += "*";
    }

    fs.watchFiles(watchList, {
        handler: (path) => {
            process.stdout.write(br.yellow(sep));
            console.log(cmder.prompt, br.cyan("file modified:"), path);
            run();
        }
    });
}
