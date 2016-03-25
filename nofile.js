var kit = require("nokit");
var async = kit.async;

module.exports = (task, option) => {
    option("-w", "watch build");

    task("build", ["clean", "build-docs"], async(function * (opts) {
        yield kit.spawn("babel", ["src", "--loose", "all", "--out-dir", "lib"]);

        yield kit.spawn("webpack", [
            "--output-pathinfo",
            "lib/browser.js", "dist/junit.js"
        ]);

        var webpackOpts = [
            "--module-bind", "js=babel",
            "--output-pathinfo",
            "test/browser/index.js", "dist/test-basic.js"
        ];
        if (opts.W) webpackOpts.push("-w");
        yield kit.spawn("webpack", webpackOpts);
    }));

    task("clean", () => kit.remove("{dist,lib}"));

    task("build-docs", "build readme.md", () =>
        kit.warp("src/**/*.js")
        .load(
            kit.drives.comment2md({ h: 2, tpl: "doc/readme.jst.md" })
        ).run()
    );

    task("lint", () =>
        kit.spawn("eslint", ["src", "test", "nofile.js"])
    );

    task("watch-test", "auto watch & reload test", (opts) => {
        return kit.monitorApp({
            bin: "babel-node",
            isNodeDeps: false,
            watchList: ["{src,test}/**/*.js"],
            args: [
                "node_modules/.bin/babel-istanbul", "cover",
                "src/cli.js", "--",
                "-g", opts.grep, "test/*.js"
            ]
        });
    });

    option("-g, --grep <.*>", "unit test regex filter", ".*");
    task("test", ["lint"], async(function * (opts) {
        // Test phantomjs
        yield kit.spawn("webpack", [
            "--module-bind", "js=babel",
            "--output-pathinfo",
            "test/browser/phantom.js", "dist/test-phantom-basic.js"
        ]);

        yield kit.spawn("phantomjs", ["dist/test-phantom-basic.js"]);

        yield kit.spawn(
            "babel-node", [
                "node_modules/.bin/babel-istanbul", "cover",
                "src/cli.js", "--",
                "-t", "30000",
                "-g", opts.grep, "test/*.js"
            ]
        );
    }));
};
