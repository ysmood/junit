import { spawnSync } from "child_process";


export default (it) => it.describe("cli: ", it => {

    it("cli tool basic", async () => {
        return it.eq(spawnSync("babel-node", [
            "src/cli.js",
            "--", "test/cli-test/a.js", "-p", " sub >"
        ]).status, 0);
    });

    it("cli tool reports err", async () => {
        let { status } = spawnSync("babel-node", [
            "src/cli.js",
            "--", "test/cli-test/*", "-p", " sub >"
        ]);
        return it.eq(status, 1);
    });

    it("cli custom reporter", async () => {
        let { status } = spawnSync("babel-node", [
            "src/cli.js",
            "--", "test/cli-test/a.js",
            "-o", "test/cli/custom-reporter.js"
        ]);
        return it.eq(status, 0);
    });

    it("cli err", async () => {
        let { status } = spawnSync("babel-node", [
            "src/cli.js",
            "--", "test/cli-test/err.js",
            "-o", "test/cli/custom-reporter.js"
        ]);
        return it.eq(status, 1);
    });

    it("cli report", async () => {
        let { stdout } = spawnSync("babel-node", [
            "src/cli.js",
            "-m", "none",
            "--", "test/cli-test/b.js"
        ], { encoding: 'utf8' });
        return it.eq(!!stdout.match(/passed 3[\s\S]+failed 1/), true);
    });

    it("cli bail", async () => {
        let { stdout } = spawnSync("babel-node", [
            "src/cli.js",
            "-m", "none",
            "--bail", "on",
            "--", "test/cli-test/b.js"
        ], { encoding: 'utf8' });
        return it.eq(!!stdout.match(/passed 0[\s\S]+failed 1/), true);
    });

    it("cli grep", async () => {
        let { stdout } = spawnSync("babel-node", [
            "src/cli.js",
            "-m", "none",
            "--grep", "^another 01$",
            "--", "test/cli-test/b.js"
        ], { encoding: 'utf8' });
        return it.eq(!!stdout.match(/passed 1[\s\S]+failed 0/), true);
    });

    it("cli failOnUnhandled", async () => {
        let { status } = spawnSync("babel-node", [
            "src/cli.js",
            "--failOnUnhandled", "off",
            "--", "test/cli-test/c.js"
        ], { encoding: 'utf8' });
        return it.eq(status, 0);
    });

});
