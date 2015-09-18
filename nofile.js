import kit from "nokit";

export default (task) => {
    task("build", ["clean", "build-docs"], async () => {
        await kit.spawn("babel", ["src", "--out-dir", "lib"]);

        await kit.spawn("webpack", [
            "--module-bind", "js=babel?stage=0",
            "test/basic.js", "dist/test-basic.js"
        ]);
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

    task("test", ["lint"], async () => {
        return kit.spawn(
            "babel-node",
            [
                "node_modules/.bin/babel-istanbul",
                "cover",
                "test/basic.js"
            ]
        ).catch(({ code }) => process.exit(code));
    });
};
