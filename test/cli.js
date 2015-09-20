import kit from "nokit";

async function spawn (bin, args, opts) {
    let { code } = await kit.spawn(bin, args, opts);
    return code;
}

export default (it) => [

    it("cli tool basic", async () => {
        return it.eq(await spawn("babel-node", [
            "src/cli.js",
            "--", "test/cli-test/a.js", "-p", " sub >"
        ]), 0);
    }),

    it("cli tool reports err", async () => {
        try {
            await spawn("babel-node", [
                "src/cli.js",
                "--", "test/cli-test/*", "-p", " sub >"
            ]);
            throw new Error("cli should report error");
        } catch ({ code }) {
            return it.eq(code, 1);
        }
    })

];
