import kit from "nokit";

export default (task) => {
    task("build", ["clean", "build-docs"], async () => {
        await kit.spawn("babel", ["src", "--out-dir", "lib"]);
        await kit.spawn("webpack", [
            "lib/index.js",
            "dist/junit.js", "-p"
        ]);
    });

    task("clean", async () => {
        await kit.remove("{dist,lib}");
    });

    task("build-docs", "build readme.md", () => {
        return kit.warp("src/**/*.js")
        .load(
            kit.drives.comment2md({ h: 2, tpl: "doc/readme.jst.md" })
        ).run();
    });

    task("test", async () => {
        let { code } = await kit.spawn("babel-node", ["test/basic"]);
        process.exit(code);
    });
};
