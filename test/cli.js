"use strict";

var child_process = require("child_process");
var spawnSync = child_process.spawnSync;

module.exports = function (it) {
    return it.describe("cli: ", function (it) {

        it("cli tool basic", function () {
            return it.eq(spawnSync("node", [
                "lib/cli.js",
                "--", "test/cli-test/a.js", "-p", " sub >"
            ]).status, 0);
        });

        it("cli tool reports err", function () {
            var info = spawnSync("node", [
                "lib/cli.js",
                "--", "test/cli-test/*", "-p", " sub >"
            ]);

            var status = info.status;

            return it.eq(status, 1);
        });

        it("cli custom reporter", function () {
            var info = spawnSync("node", ["lib/cli.js",
                "--", "test/cli-test/a.js", "-o", "test/cli/custom-reporter.js"
            ]);

            var status = info.status;

            return it.eq(status, 0);
        });

        it("cli err", function () {
            var info = spawnSync("node", ["lib/cli.js",
                "--", "test/cli-test/err.js", "-o", "test/cli/custom-reporter.js"
            ]);

            var status = info.status;

            return it.eq(status, 1);
        });

        it("cli report", function () {
            var info = spawnSync("node", ["lib/cli.js", "-m", "none",
                "--", "test/cli-test/b.js"
            ], { encoding: 'utf8' });

            var stdout = info.stdout;

            return it.eq(!!stdout.match(/passed 3[\s\S]+failed 1/), true);
        });

        it("cli bail", function () {
            var info = spawnSync("node", ["lib/cli.js",
                "-m", "none", "--bail", "on",
                "--", "test/cli-test/b.js"
            ], { encoding: 'utf8' });

            var stdout = info.stdout;

            return it.eq(!!stdout.match(/passed 0[\s\S]+failed 1/), true);
        });

        it("cli grep", function () {
            var info = spawnSync("node", ["lib/cli.js", "-m", "none",
                "--grep", "^another 01$",
                "--", "test/cli-test/b.js"
            ], { encoding: 'utf8' });

            var stdout = info.stdout;

            return it.eq(!!stdout.match(/passed 1[\s\S]+failed 0/), true);
        });

        it("cli failOnUnhandled", function () {
            var info = spawnSync("node", ["lib/cli.js",
                "--failOnUnhandled", "off",
                "--", "test/cli-test/c.js"
            ], { encoding: 'utf8' });

            var status = info.status;

            return it.eq(status, 0);
        });
    });
};