"use strict";

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
 *         formatAssertErr: (actual, expected) => {},
 *
 *         logPass: (msg, span) => {},
 *         logFail: (msg, err, span) => {},
 *         logFinal: (total, tested, passed, failed) => {}
 *     }
 * }
 * ```
 * @return {Function} `() => Function : { msg: String }`
 * @example
 * ```js
 * import junit from "junit";
 * let it = junit();
 *
 * // Async tests.
 * it.run([
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
 *     // Run sync tests within the main async flow.
 *     async () => {
 *         await it("test 3", () =>
 *             it.eq("ok", "ok")
 *         )();
 *
 *         await it("test 4", () =>
 *             it.eq("ok", "ok")
 *         )();
 *     }
 * ]);
 * ```
 * @example
 * Filter the tests, only the odd ones will be tested.
 * ```js
 * import junit from "junit";
 * let it = junit();
 *
 * (async () => {
 *     // Get the result of the test.
 *     let { total, passed, failed } = await it.run(1,
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
 * @example
 * You can even change the code style like this.
 * ```js
 * import junit from "junit";
 * import assert from "assert";
 * let it = junit();
 *
 * (async () => {
 *     await it("test 2", async () => {
 *         await new junit.Promise(r => setTimeout(r, 1000));
 *         return it.eq(1, 2);
 *     })();
 *
 *     await it("test 2", async () => {
 *         await new junit.Promise(r => setTimeout(r, 1000));
 *
 *         // Use return or await here are the same.
 *         await it.eq(1, 2);
 *     })();
 *
 *     await it("test 2", async () => {
 *         // You can use any assert tool you like.
 *         // You only have to follow one rule, the async assertion should be
 *         // returned within a promise.
 *         assert.equal(1, 2);
 *     })();
 *
 *     return it.run();
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
    let tested = 0;
    let isEnd = false;

    if (opts.isFailOnUnhandled) {
        let onUnhandledRejection = Promise.onUnhandledRejection;
        Promise.onUnhandledRejection = (reason, p) => {
            failed++;
            onUnhandledRejection(reason, p);
        };
    }

    function it (msg, fn) {
        total++;
        function testFn () {
            tested++;
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
        logFinal(total, tested, passed, failed);

        return { total, tested, passed, failed };
    }

    return utils.extend(it, {

        /**
         * Almost the same with the `yutils.async`, additionally, it will
         * monitor the result of the whole tests.
         * @param  {Int} limit The max task to run at a time. It's optional.
         * Default is `Infinity`. Set it to 1 to run tests synchronously.
         * @param  {Array | Function} list
         * If the list is an array, it should be a list of functions or promises,
         * and each function will return a promise.
         * If the list is a function, it should be a iterator that returns
         * a promise, when it returns `yutils.end`, the iteration ends. Of course
         * it can never end.
         * @return {Promise} It will resolve `{ total, passed, failed }`
         */
        run: function (limit, list) {
            if (opts.isExitWithFailed && root.process)
                /* istanbul ignore next */
                root.process.on("exit", () => root.process.exit(failed));

            if (arguments.length === 0) limit = [];

            return yutils.async(limit, list, false)
            .then(onFinal, onFinal);
        },

        /**
         * A smart strict deep equality assertion helper function.
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
