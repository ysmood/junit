"use strict";

import Promise from "yaku";
import yutils from "yaku/lib/utils";
import { extend, eq } from "./utils";
import reporter from "./reporter";


/**
 * A simple promise based module for unit tests.
 * @param  {Object} opts Defaults:
 * ```js
 * {
 *     filter: (msg) => true
 *
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
 * @return {Function} `(msg, fn) => Function` The `msg` can be anything.
 * @example
 * ```js
 * import junit from "junit";
 * let it = junit();
 * (async () => {
 *     // Async tests.
 *     it("test 1", () =>
 *         // We use `it.eq` to assert on both simple type and complex object.
 *         it.eq("ok", "ok")
 *     );
 *
 *     it("test 2", async () => {
 *         // No more callback hell while testing async functions.
 *         await new junit.Promise(r => setTimeout(r, 1000));
 *
 *         return it.eq({ a: 1, b: 2 }, { a: 1, b: 2 });
 *     });
 *
 *     // Run sync tests within the main async flow.
 *     await it("test 3", () =>
 *         it.eq("ok", "ok")
 *     );
 *
 *     it.run();
 * })()
 * ```
 * @example
 * Filter the tests, only the message starts with "test" will be tested.
 * ```js
 * import junit from "junit";
 * let it = junit({
 *     filter: (msg) => msg.indexOf("test")
 * });
 *
 * (async () => {
 *     it("basic 1", () => it.eq(1, 1));
 *     it("test 1", () => it.eq(1, 1));
 *     it("test 2", () => it.eq(1, 1));
 *
 *     // Get the result of the test.
 *     let { total, passed, failed } = await it.run();
 *
 *     console.log(total, passed, failed);
 * })();
 * ```
 */
let junit = (opts = {}) => {
    opts = extend({
        isBail: true,
        isFailOnUnhandled: true,
        isThrowOnFinal: true,
        timeout: 5000,
        filter: () => true,
        reporter: {}
    }, opts);

    let { formatAssertErr, logPass, logFail, logFinal } =
        extend(reporter(), opts.reporter);

    let passed = 0;
    let failed = 0;
    let total = 0;
    let tested = 0;
    let isEnd = false;
    let tests = [];

    if (opts.isFailOnUnhandled) {
        let onUnhandledRejection = Promise.onUnhandledRejection;
        /* istanbul ignore next */
        Promise.onUnhandledRejection = (reason, p) => {
            failed++;
            onUnhandledRejection(reason, p);
        };
    }

    function it (msg, fn) {
        total++;

        var ret;
        if (opts.filter(msg)) {
            tested++;
            let timeouter = null;
            let startTime = Date.now();
            ret = new Promise((resolve, reject) => {
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
                logPass(msg, Date.now() - startTime);
            }, (err) => {
                clearTimeout(timeouter);
                if (isEnd) return;
                failed++;
                logFail(msg, err, Date.now() - startTime);
                if (opts.isBail) {
                    isEnd = true;
                    return Promise.reject();
                }
            });
        } else {
            ret = Promise.resolve();
        }

        tests.push(ret);
        return ret;
    }

    function onFinal () {
        isEnd = true;
        logFinal(total, tested, passed, failed);

        /* istanbul ignore if */
        if (opts.isThrowOnFinal && failed)
            yutils.throw(`junit test failed with ${failed}`);

        return { total, tested, passed, failed };
    }

    let describe = (msg, fn, notInit) => {
        let subIt = (subMsg, fn) => Promise.resolve(it(
            notInit ? msg.concat([subMsg]) : [msg, subMsg],
            fn
        ));

        extend(subIt, it);
        subIt.describe = (subMsg, fn) => Promise.resolve(describe(
            notInit ? msg.concat([subMsg]) : [msg, subMsg],
            fn,
            true
        ));

        return Promise.resolve(fn(subIt));
    };

    return extend(it, {

        /**
         * Start the tests.
         * @return {Promise} It will resolve `{ total, passed, failed }`
         */
        run () {
            return Promise.all(tests).then(onFinal, onFinal);
        },

        /**
         * A smart strict deep equality assertion helper function.
         * @param {Any} actual
         * @param {Any} expected
         * @param {Number = 7} maxDepth Optional. The max depth of the recursion check.
         * @return {Promise}
         */
        eq: eq(formatAssertErr),

        /**
         * Extend the msg of the test with a new test closure.
         * @param {Any} msg The msg object of the test.
         * @param {Function} fn `(it, describe) => Promise` The new msg closure.
         * @return {Promise}
         * @example
         * ```js
         * import junit from "junit";
         *
         * let it = junit();
         * let { eq } = it;
         *
         * it.describe("level 01", (it, describe) => {
         *     it("test 01", () => eq(1, 1));
         *
         *     it("test 02", () => eq(1, 1));
         *
         *     describe("level 02", it => {
         *         it("test 01", () => eq(1, 1));
         *
         *         it("test 02", () => eq(1, 1));
         *     });
         * });
         *
         * it.run();
         * ```
         */
        describe: describe
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
