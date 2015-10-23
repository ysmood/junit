"use strict";

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
 *     // If any test failed, throw on final.
 *     isThrowOnFinal: true,
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
 * @return {Function} `() => Function : { msg: Any }`
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
    opts = utils.extend({
        isBail: true,
        isFailOnUnhandled: true,
        isThrowOnFinal: true,
        timeout: 5000,
        reporter: {}
    }, opts);

    let { formatAssertErr, logPass, logFail, logFinal } =
        utils.extend(reporter(), opts.reporter);

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
            if (testFn.isTested)
                return;
            else
                testFn.isTested = true;

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
                if (opts.isBail) {
                    isEnd = true;
                    return Promise.reject();
                }
            });
        }

        testFn.msg = msg;
        it.tests.push(testFn);

        return testFn;
    }

    function onFinal () {
        isEnd = true;
        logFinal(total, tested, passed, failed);

        /* istanbul ignore if */
        if (opts.isThrowOnFinal && failed)
            yutils.throw(`junit test failed with ${failed}`);

        return { total, tested, passed, failed };
    }

    return utils.extend(it, {

        /**
         * Start the tests.
         * @param  {Int} limit The max task to run at a time. It's optional.
         * Default is `Infinity`. Set it to 1 to run tests synchronously.
         * @return {Promise} It will resolve `{ total, passed, failed }`
         */
        run (limit = Infinity) {
            let iter = { i: 0, next () {
                let fn = it.tests[this.i++];
                return {
                    value: fn && fn(),
                    done: !fn
                };
            } };

            return yutils.async(limit, iter, false)
            .then(onFinal, onFinal);
        },

        /**
         * A smart strict deep equality assertion helper function.
         * @param {Any} actual
         * @param {Any} expected
         * @param {Number = 7} maxDepth Optional. The max depth of the recursion check.
         * @return {Promise}
         */
        eq: utils.eq(formatAssertErr),

        /**
         * The all the test functions that are generated by `it`.
         * Use it to filter or map test cases.
         * @type {Array}
         */
        tests: []

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
