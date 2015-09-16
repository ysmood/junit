import Promise from "yaku";
import yutils from "yaku/lib/utils";
import utils from "./utils";
import reporter from "./reporter";

/**
 * A simple promise based module for unit tests.
 * @param  {Object} opts Defaults:
 * ```js
 * {
 *     // Stop test when error occurred.
 *     isBail: true,
 *
 *     isFailOnUnhandled: true,
 *
 *     // If any test failed, when process finished, set exit code to failed number.
 *     isExitWithFailed: true,
 *
 *     // Fail a test after timeout.
 *     timeout: 5000,
 *
 *     reporter: {
 *         // You can even use jsdiff here to generate more fancy error info.
 *         formatAssertErr: (actual, expected, stack) => {},
 *
 *         logPass: (msg, span) => {},
 *         logFail: (msg, err, span) => {},
 *         logFinal: (total, passed, failed) => {}
 *     }
 * }
 * ```
 * @return {Function} It has two members: `{ async, sync }`.
 * Both of them will resolve `{ total, passed, failed }`.
 * The function it generates has a string property `msg`.
 * @example
 * ```js
 * import junit from "junit";
 * let it = junit();
 *
 * // Async tests
 * it.async([
 *     it("basic 1", =>
 *         // We use `it.eq` to assert on both simple type and complex object.
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
 * Filter the tests, only the odd ones will be tested.
 * ```js
 * import junit from "junit";
 * let it = junit();
 *
 * // Async tests
 * it.async(
 *     [
 *         it("basic 1", => it.eq(1, 1)),
 *         it("basic 2", => it.eq(1, 2)),
 *         it("basic 3", => it.eq(2, 2))
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
let junit = (opts = {}) => {
    let root = typeof window === "object" ? window : global;

    opts = utils.extend({
        isBail: true,
        isFailOnUnhandled: true,
        isExitWithFailed: true,
        timeout: 5000,
        reporter: {}
    }, opts);

    let { formatAssertErr, logPass, logFail, logFinal } =
        utils.extend(reporter(), opts.reporter);

    let passed = 0;
    let failed = 0;
    let total = 0;
    let isEnd = false;

    if (opts.isFailOnUnhandled) {
        let onUnhandledRejection = Promise.onUnhandledRejection;
        Promise.onUnhandledRejection = (reason, p) => {
            onUnhandledRejection(reason, p);
            failed++;
        };
    }

    function it (msg, fn) {
        total++;
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
                if (isEnd) return;
                passed++;
                logPass(testFn.msg, Date.now() - startTime);
            }, (err) => {
                clearTimeout(timeouter);
                if (isEnd) return;
                failed++;
                logFail(testFn.msg, err, Date.now() - startTime);
                if (opts.isBail) return Promise.reject(err);
            });
        }

        testFn.msg = msg;

        return testFn;
    }

    function onFinal () {
        isEnd = true;
        logFinal(total, passed, failed);

        return { total, passed, failed };
    }

    if (opts.isExitWithFailed && root.process)
        /* istanbul ignore next */
        root.process.on("exit", () => process.exit(failed));

    return utils.extend(it, {
        async: function () {
            return yutils.async.apply(0, arguments)
            .then(onFinal, onFinal);
        },

        sync: function () {
            return yutils.flow.apply(0, arguments)()
            .then(onFinal, onFinal);
        },

        eq: utils.eq(formatAssertErr)

    });
};

export default junit;
