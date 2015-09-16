# JUnit

A simple promise based module for unit tests.
I believe we shouldn't waste time on learning, debugging and waiting the unit test framework itself,
that's why I created JUnit. It's just a curried function, everything inside is controllable, nothing
will be fancy.

[![NPM version](https://badge.fury.io/js/noflow.svg)](http://badge.fury.io/js/noflow) [![Build Status](https://travis-ci.org/ysmood/noflow.svg)](https://travis-ci.org/ysmood/noflow) [![Deps Up to Date](https://david-dm.org/ysmood/noflow.svg?style=flat)](https://david-dm.org/ysmood/noflow)


# Install

## Node.js

`npm install junit`

## Browser

You have to use something like `browserify` or `webpack`.


### Features

- Support on both Node.js and browser
- Made for concurrent tests and async flow control, designed for `async-await`
- Automatically garbage collect the unhandled error
- Full customizable report sytle.
- Not a single global variable pollution
- Only one dependency, light weight and behavior predictable

# API

- ## **[let(opts)](src/index.js?source#L88)**

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
                logFinal: (total, passed, failed) => {}
            }
        }
        ```

    - **<u>return</u>**: { _Function_ }

        It has two members: `{ async, sync }`.
        Both of them will resolve `{ passed, failed }`.
        The function it generates has a string property `msg`.

    - **<u>example</u>**:

        ```js
        import junit from "junit";
        let it = junit();

        // Async tests
        it.async([
            it("basic 1", =>
                it.eq("ok", "ok")
            ),
            it("basic 2", =>
                it.eq({ a: 1, b: 2 }, { a: 1, b: 2 })
            ),

            // Sync tests
            kit.flow([
                it("basic 3", =>
                    it.eq("ok", "ok")
                ),
                it("basic 4", =>
                    it.eq("ok", "ok")
                )
            ])
        ]);
        ```

    - **<u>example</u>**:

        Filter the tests, only it the odd ones.
        ```js
        import junit from "junit";
        let it = junit();

        // Async tests
        it.async(
            [
                it("basic 1", =>
                    it.eq("ok", "ok")
                ),
                it("basic 2", =>
                    it.eq({ a: 1, b: 2 }, { a: 1, b: 2 })
                ),
                it("basic 3", =>
                    it.eq(1, 1)
                )
            ]
            .filter((fn, index) => index % 2)
            .map((fn) => {
                // prefix all the messages with current file path
                fn.msg = `${__filename} - ${fn.msg}`
                return fn
            })
        );
        ```


