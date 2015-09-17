import br from "./brush";

export default (prompt) => {
    return {
        formatAssertErr: (actual, expected, stack) => (
                `${br.red("\n<<<<<<< actual")}\n` +
                `${actual}\n` +
                `${br.red("=======")}\n` +
                `${expected}\n` +
                `${br.red(">>>>>>> expected")}\n\n` +
                br.grey(stack)
            ).replace(/^/mg, "  "),

        logPass: (msg, span) => {
            console.log(prompt, br.green("o"), msg, br.grey(`(${span}ms)`));
        },

        logFail: (msg, err, span) => {
            err = err instanceof Error ? err.stack : err;
            console.error(
                `${prompt} ${br.red("x")} ${msg} ` +
                br.grey(`(${span}ms)`) + `\n${err}\n`
            );
        },

        logFinal: (total, passed, failed) => {
            console.info(
                `${prompt} ${br.cyan(" total")} ${br.white(total)}\n` +
                `${prompt} ${br.cyan("passed")} ${br.green(passed)}\n` +
                `${prompt} ${br.cyan("failed")} ${br.red(failed)}`);
        }
    };
};
