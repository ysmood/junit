"use strict";

import { spawn } from "child_process";

let argv = process.argv.slice(2);

let binIndex = argv.indexOf("-b");
let bin = "node";

if (binIndex > -1) {
    bin = argv[binIndex + 1];
    argv.splice(binIndex, 2);
}

argv.forEach((file) => {
    let ps = spawn(bin, [file], { stdio: "inherit" });
    ps.on("close", code => process.exit(code));
});
