# JUnit

A simple promise based function for unit tests.
I believe we shouldn't waste time on learning, debugging and waiting the unit test framework itself,
that's why I created JUnit. It's just a curried function, everything inside is controllable, nothing
will be fancy.

[![NPM version](https://badge.fury.io/js/junit.svg)](http://badge.fury.io/js/junit) [![Build Status](https://travis-ci.org/ysmood/junit.svg)](https://travis-ci.org/ysmood/junit) [![Deps Up to Date](https://david-dm.org/ysmood/junit.svg?style=flat)](https://david-dm.org/ysmood/junit) [![Coverage Status](https://coveralls.io/repos/ysmood/junit/badge.svg?branch=master&service=github)](https://coveralls.io/github/ysmood/junit?branch=master)


# Install

## Node.js

`npm install junit`

## Browser

You have to use something like `browserify` or `webpack`.


### Features

- Supports both Node.js and browser
- Should work well from ES3 to ES7
- Make it super easy to concurrently test async functions, designed for `async-await`
- Automatically garbage collect the unhandled error
- Full customizable report style
- Not a single global variable pollution
- Only one dependency, light weight and behavior predictable


# FAQ

- IE6?

  > If you use webpack, you may need an `Object.defineProperty` polyfill to bundle your tests.
  > You may also need to install a `reporter` designed for old browser, they don't support `console.log`.

- No ES7?

  > Replace all the await expresses with standard promise ones is enough.


# CLI

You always have to import `junit` in test files.

Normal node way:

```shell
node test.js
```

JUnit also exposed a simple cli tool:

```shell
junit test/*.js

junit -b babel-node test/**/*.js

junit -b coffee test/*.coffee
```


# API

- ## **[junit(opts)](src/index.js?source#L123)**

    A simple promise based module for unit tests.

    - **<u>param</u>**: `opts` { _Object_ }

        Defaults:
        ```js
        {
            // Stop test when error occurred.
            isBail: true,

            isFailOnUnhandled: true,

            // If any test failed, when process finished, set exit code to failed number.
            isExitWithFailed: true,

            // Fail a test after timeout.
            timeout: 5000,

            reporter: {
                // You can even use jsdiff here to generate more fancy error info.
                formatAssertErr: (actual, expected, stack) => {},

                logPass: (msg, span) => {},
                logFail: (msg, err, span) => {},
                logFinal: (total, tested, passed, failed) => {}
            }
        }
        ```

    - **<u>return</u>**: { _Function_ }

        `() => Function : { msg: String }`

    - **<u>example</u>**:

        ```js
        import junit from "junit";
        let it = junit();

        // Async tests.
        it.run([
            it("test 1", () =>
                // We use `it.eq` to assert on both simple type and complex object.
                it.eq("ok", "ok")
            ),
            it("test 2", async () => {
                // No more callback hell while testing async functions.
                await new junit.Promise(r => setTimeout(r, 1000));

                return it.eq({ a: 1, b: 2 }, { a: 1, b: 2 });
            }),

            // Run sync tests within the main async flow.
            async () => {
                await it("test 3", () =>
                    it.eq("ok", "ok")
                )();

                await it("test 4", () =>
                    it.eq("ok", "ok")
                )();
            }
        ]);
        ```

    - **<u>example</u>**:

        Filter the tests, only the odd ones will be tested.
        ```js
        import junit from "junit";
        let it = junit();

        (async () => {
            // Get the result of the test.
            let { total, passed, failed } = await it.run(1,
                [
                    it("test 1", () => it.eq(1, 1)),
                    it("test 2", () => it.eq(1, 2)),
                    it("test 3", () => it.eq(2, 2))
                ]
                .filter((fn, index) => index % 2)
                .map(fn => {
                    // prefix all the messages with current file path
                    fn.msg = `${__filename} - ${fn.msg}`
                    return fn
                })
            );

            console.log(total, passed, failed);
        })();
        ```

    - **<u>example</u>**:

        You can even change the code style like this.
        ```js
        import junit from "junit";
        import assert from "assert";
        let it = junit();

        (async () => {
            await it("test 2", async () => {
                await new junit.Promise(r => setTimeout(r, 1000));
                return it.eq(1, 2);
            })();

            await it("test 2", async () => {
                await new junit.Promise(r => setTimeout(r, 1000));

                // Use return or await here are the same.
                await it.eq(1, 2);
            })();

            await it("test 2", async () => {
                // You can use any assert tool you like.
                // You only have to follow one rule, the async assertion should be
                // returned within a promise.
                assert.equal(1, 2);
            })();

            return it.run();
        })();
        ```

- ## **[run(limit, list)](src/index.js?source#L209)**

    Almost the same with the `yutils.async`, additionally, it will
    monitor the result of the whole tests.

    - **<u>param</u>**: `limit` { _Int_ }

        The max task to run at a time. It's optional.
        Default is `Infinity`. Set it to 1 to run tests synchronously.

    - **<u>param</u>**: `list` { _Array | Function_ }

        If the list is an array, it should be a list of functions or promises,
        and each function will return a promise.
        If the list is a function, it should be a iterator that returns
        a promise, when it returns `yutils.end`, the iteration ends. Of course
        it can never end.

    - **<u>return</u>**: { _Promise_ }

        It will resolve `{ total, passed, failed }`

- ## **[eq(actual, expected, maxDepth)](src/index.js?source#L223)**

    A smart strict deep equality assertion helper function.

    - **<u>param</u>**: `actual` { _Any_ }

    - **<u>param</u>**: `expected` { _Any_ }

    - **<u>param</u>**: `maxDepth` { _Number = 7_ }

        Optional. The max depth of the recursion check.

    - **<u>return</u>**: { _Promise_ }

- ## **[junit.reporter(prompt)](src/index.js?source#L237)**

    An example reporter for junit.

    - **<u>param</u>**: `prompt` { _String_ }

        The prompt prefix.

    - **<u>return</u>**: { _Function_ }

        `() => Object`.

    - **<u>example</u>**:

        ```js
        let it = junit({ reporter: junit.reporter('my-prompt > ') });
        ```

- ## **[junit.Promise](src/index.js?source#L243)**

    The promise class that junit uses: [Yaku](https://github.com/ysmood/yaku)

    - **<u>type</u>**: { _Object_ }

- ## **[junit.yutils](src/index.js?source#L249)**

    The promise helpers: [Yaku Utils](https://github.com/ysmood/yaku#utils)

    - **<u>type</u>**: { _Object_ }




# Screenshot

![junit-demo](doc/junit-demo.png)
