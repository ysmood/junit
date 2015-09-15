import Promise from "yaku";
import yutils from "yaku/lib/utils";
import utils from "./utils";
import br from "./brush";

/**
 * A simple promise based module for unit tests.
 * @param  {Object} opts Defaults:
 * ```js
 * {
 *  isBail: true,
 *  isFailOnUnhandled: true,
 *  isThrowOnFinal: true,
 *  timeout: 5000,
 *  logPass: (msg, span) => {},
 *  logFail: (msg, err, span) => {},
 *  logFinal: (passed, failed) => {}
 * }
 * ```
 * @return {Function} It has two members: `{ async, sync }`.
 * Both of them will resolve `{ passed, failed }`.
 * The function it generates has a string property `msg`.
 * @example
 * ```js
 * import ken from "ken";
 * let it = ken();
 *
 * // Async tests
 * it.async([
 *     it("basic 1", =>
 *         it.eq("ok", "ok")
 *     ),
 *     it("basic 2", =>
 *         it.eq({ a: 1, b: 2 }, { a: 1, b: 2 })
 *     ),
 *
 *     // Sync tests
 *     kit.flow([
 *         it("basic 3", =>
 *             it.eq("ok", "ok")
 *         ),
 *         it("basic 4", =>
 *             it.eq("ok", "ok")
 *         )
 *     ])
 * ]);
 * ```
 * @example
 * Filter the tests, only it the odd ones.
 * ```js
 * import ken from "ken";
 * let it = ken();
 *
 * // Async tests
 * it.async(
 *     [
 *         it("basic 1", =>
 *             it.eq("ok", "ok")
 *         ),
 *         it("basic 2", =>
 *             it.eq({ a: 1, b: 2 }, { a: 1, b: 2 })
 *         ),
 *         it("basic 3", =>
 *             it.eq(1, 1)
 *         )
 *     ]
 *     .filter((fn, index) => index % 2)
 *     .map((fn) => {
 *         // prefix all the messages with current file path
 *         fn.msg = `${__filename} - ${fn.msg}`
 *         return fn
 *     })
 * );
 * ```
 */
let ken = (opts = {}) => {
    let title = br.underline(br.grey("ken >"));

    opts = utils.extend({
        isBail: true,
        isFailOnUnhandled: true,
        isThrowOnFinal: true,
        timeout: 5000,
        logPass: (msg, span) => {
            console.log(title, br.green("o"), msg, br.grey(`(${span}ms)`));
        },
        logFail: (msg, err, span) => {
            err = err instanceof Error ? err.stack : err;
            console.error(
                title, br.red("x"), msg, br.grey(`(${span}ms)`),
                "\n\n" + err + "\n"
            );
        },
        logFinal: (passed, failed) => {
            console.log(`${title} ${br.cyan("passed")} ${br.green(passed)}\n` +
                `${title} ${br.cyan("failed")} ${br.red(failed)}`);
        }
    }, opts);

    let passed = 0;
    let failed = 0;
    let isEnd = false;

    if (opts.isFailOnUnhandled) {
        let onUnhandledRejection = Promise.onUnhandledRejection;
        Promise.onUnhandledRejection = (reason, p) => {
            onUnhandledRejection(reason, p);
            failed++;
        };
    }

    if (opts.isThrowOnFinal && failed) {
        setTimeout(() => { throw new Error(`test_failed: ${failed}`); });
    }

    function it (msg, fn) {
        function testFn () {
            let timeouter = null;
            let startTime = Date.now();
            return new Promise((resolve, reject) => {
                resolve(fn());
                timeouter = setTimeout(
                    reject,
                    opts.timeout,
                    new Error("test_timeout")
                );
            }).then(() => {
                clearTimeout(timeouter);
                passed++;
                if (isEnd) return;
                opts.logPass(testFn.msg, Date.now() - startTime);
            }, (err) => {
                clearTimeout(timeouter);
                failed++;
                if (isEnd) return;
                opts.logFail(testFn.msg, err, Date.now() - startTime);
                if (opts.isBail) return Promise.reject(err);
            });
        }

        testFn.msg = msg;

        return testFn;
    }

    function onFinal () {
        isEnd = true;
        opts.logFinal(passed, failed);
        return { passed, failed };
    }

    return utils.extend(it, {
        async: function () {
            return yutils.async.apply(0, arguments)
            .then(onFinal, onFinal);
        },

        sync: function () {
            return yutils.flow.apply(0, arguments)()
            .then(onFinal, onFinal);
        },

        eq: utils.eq

    });
};

export default ken;
