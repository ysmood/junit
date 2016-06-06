var kit = require("nokit");

module.exports = function (task, option) {
    option("-w", "watch build");

    task("build", ["lint", "clean", "build-docs"], function (opts) {
        return kit.spawn("webpack", [
            "--output-pathinfo",
            "lib/browser.js", "dist/junit.js"
        ]).then(function () {
            var webpackOpts = [
                "--output-pathinfo",
                "test/browser/index.js", "dist/test-basic.js"
            ];
            if (opts.W) webpackOpts.push("-w");
            return kit.spawn("webpack", webpackOpts);
        });
    });

    task("clean", function () {
        return kit.remove("{dist}");
    });

    task("build-docs", "build readme.md", function () {
        return kit.warp("lib/**/*.js")
        .load(
            kit.drives.comment2md({ h: 2, tpl: "doc/readme.jst.md" })
        ).run();
    });

    task("lint", function () {
        return kit.spawn("eslint", ["lib", "test", "nofile.js"]);
    });

    task("watch-test", "auto watch & reload test", function (opts) {
        return kit.monitorApp({
            bin: "istanbul",
            isNodeDeps: false,
            watchList: ["{lib,test}/**/*.js"],
            args: [
                "cover",
                "lib/cli.js", "--",
                "-g", opts.grep, "test/*.js"
            ]
        });
    });

    option("-g, --grep <.*>", "unit test regex filter", ".*");
    task("test", function (opts) {
        // Test phantomjs
        return kit.spawn("webpack", [
            "--output-pathinfo",
            "test/browser/phantom.js", "dist/test-phantom-basic.js"
        ]).then(function () {
            // return kit.spawn("phantomjs", ["dist/test-phantom-basic.js"]);
        }).then(function () {
            return kit.spawn(
                "istanbul", [
                    "cover",
                    "lib/cli.js", "--",
                    "-t", "30000",
                    "-g", opts.grep, "test/*.js"
                ]
            );
        });
    });
};
