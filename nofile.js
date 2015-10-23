import kit from "nokit";

export default (task, option) => {
    option("-w", "watch build");

    task("build", ["clean", "build-docs"], async (opts) => {
        await kit.spawn("babel", ["src", "--loose", "all", "--out-dir", "lib"]);

        await kit.spawn("webpack", [
            "lib/browser.js", "dist/junit.js"
        ]);

        var webpackOpts = [
            "--module-bind", "js=babel?stage=0&loose=all",
            "test/browser/index.js", "dist/test-basic.js"
        ];
        if (opts.W) webpackOpts.push("-w");
        await kit.spawn("webpack", webpackOpts);
    });

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
                "-s", "test/testSuit.js",
                "-g", opts.grep, "test/*.js"
            ]
        });
    });

    option("-g, --grep <.*>", "unit test regex filter", ".*");
    task("test", ["lint"], async (opts) => {
        try {
            kit.spawn(
                "babel-node", [
                    "node_modules/.bin/babel-istanbul", "cover",
                    "src/cli.js", "--",
                    "-s", "test/testSuit.js",
                    "-g", opts.grep, "test/*.js"
                ]
            );
        } catch ({ code }) {
            process.exit(code);
        }
    });
};
