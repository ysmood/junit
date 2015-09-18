import Promise from "yaku";
import yutils from "yaku/lib/utils";
import utils from "./utils";
import reporter from "./reporter";
import br from "./brush";


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
 * @return {Function} `() => Function : { msg: String }` It has two members:
 * `{ async: () => Promise, sync: () => Promise }`.
 * Both of the returned promises will resolve with `{ total, passed, failed }`.
 * @example
 * ```js
 * import junit from "junit";
 * let it = junit();
 *
 * // Async tests
 * it.async([
 *     it("test 1", () =>
 *         // We use `it.eq` to assert on both simple type and complex object.
 *         it.eq("ok", "ok")
 *     ),
 *     it("test 2", async () => {
 *         // No more callback hell while testing async functions.
 *         await new junit.Promise(r => setTimeout(r, 1000));
 *
 *         return it.eq({ a: 1, b: 2 }, { a: 1, b: 2 });
 *     }),
 *
 *     // Sync tests
 *     junit.yutils.flow([
 *         it("test 3", () =>
 *             it.eq("ok", "ok")
 *         ),
 *         it("test 4", () =>
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
 * (async () => {
 *     // Async tests
 *     let { total, passed, failed } = await it.sync(
 *         [
 *             it("test 1", () => it.eq(1, 1)),
 *             it("test 2", () => it.eq(1, 2)),
 *             it("test 3", () => it.eq(2, 2))
 *         ]
 *         .filter((fn, index) => index % 2)
 *         .map(fn => {
 *             // prefix all the messages with current file path
 *             fn.msg = `${__filename} - ${fn.msg}`
 *             return fn
 *         })
 *     );
 *
 *     console.log(total, passed, failed);
 * })();
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
        utils.extend(reporter(br.underline(br.grey("junit >"))), opts.reporter);

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

        /**
         * An deep equality assertion helper function.
         * @param {Any} actual
         * @param {Any} expected
         * @param {Number = 7} maxDepth Optional. The max depth of the recursion check.
         * @return {Promise}
         */
        eq: utils.eq(formatAssertErr)

    });
};

/**
 * An example reporter for junit.
 * @param {String} prompt The prompt prefix.
 * @return {Function} `() => Object`.
 * @example
 * ```js
 * let it = junit({ reporter: junit.reporter('my-prompt > ') });
 * ```
 */
junit.reporter = reporter;

/**
 * The promise class that junit uses: [Yaku](https://github.com/ysmood/yaku)
 * @type {Object}
 */
junit.Promise = Promise;

/**
 * The promise helpers: [Yaku Utils](https://github.com/ysmood/yaku#utils)
 * @type {Object}
 */
junit.yutils = yutils;

export default junit;
