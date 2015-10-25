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

You can to use something like `browserify` or `webpack`,
or download the bundled [`junit.js`](https://github.com/ysmood/junit/releases).
[A real world example](test/browser).


# Features

- Supports both Node.js and old browsers
- Should work well from ES3 to ES7
- Make it super easy to concurrently test async functions, designed for `async-await`
- Automatically garbage collect the unhandled error
- Full customizable report style
- Not a single global variable pollution
- Only one dependency, light weight and behavior predictable


# FAQ


- I don't want to use `async-await`.

  > No problem. Just replace all the await expresses with standard promise ones is enough.

- IE6?

  > The core framework of JUnit will work. But the default reporter only supports IE8>=, you may have to
  > install & config to another reporter to support old browsers.


# CLI

Install junit globally: `npm i -g junit`.
It will automatically take advantage of the `babel` if
you have installed it globally.

For example, created a file `test/fib-test.js`,
it should export a function which will return an array of tests, such as:

```js
export default (it) => {
    it("fib 01", => it.eq(1 + 1, 2));

    it("fib 02", => it.eq(1 + 2, 3));

    it("fib 03", => it.eq(2 + 3, 5));
};
```

Run the tests via `junit test/*.js`.

For more documentation, run `junit -h`.

![junit-demo](doc/junit-demo.gif)


# API

- ## **[junit(opts)](src/index.js?source#L84)**

    A simple promise based module for unit tests.

    - **<u>param</u>**: `opts` { _Object_ }

        Defaults:
        ```js
        {
            filter: (msg) => true

            // Stop test when error occurred.
            isBail: true,

            isFailOnUnhandled: true,

            // If any test failed, throw on final.
            isThrowOnFinal: true,

            // Fail a test after timeout.
            timeout: 5000,

            reporter: {
                // You can even use jsdiff here to generate more fancy error info.
                formatAssertErr: (actual, expected) => {},

                logPass: (msg, span) => {},
                logFail: (msg, err, span) => {},
                logFinal: (total, tested, passed, failed) => {}
            }
        }
        ```

    - **<u>return</u>**: { _Function_ }

        `(msg, fn) => Function` The `msg` can be anything.

    - **<u>example</u>**:

        ```js
        import junit from "junit";
        let it = junit();
        (async () => {
            // Async tests.
            it("test 1", () =>
                // We use `it.eq` to assert on both simple type and complex object.
                it.eq("ok", "ok")
            );

            it("test 2", async () => {
                // No more callback hell while testing async functions.
                await new junit.Promise(r => setTimeout(r, 1000));

                return it.eq({ a: 1, b: 2 }, { a: 1, b: 2 });
            });

            // Run sync tests within the main async flow.
            await it("test 3", () =>
                it.eq("ok", "ok")
            );

            it.run();
        })()
        ```

    - **<u>example</u>**:

        Filter the tests, only the message starts with "test" will be tested.
        ```js
        import junit from "junit";
        let it = junit({
            filter: (msg) => msg.indexOf("test")
        });

        (async () => {
            it("basic 1", () => it.eq(1, 1));
            it("test 1", () => it.eq(1, 1));
            it("test 2", () => it.eq(1, 1));

            // Get the result of the test.
            let { total, passed, failed } = await it.run();

            console.log(total, passed, failed);
        })();
        ```

- ## **[run()](src/index.js?source#L168)**

    Start the tests.

    - **<u>return</u>**: { _Promise_ }

        It will resolve `{ total, passed, failed }`

- ## **[eq(actual, expected, maxDepth)](src/index.js?source#L179)**

    A smart strict deep equality assertion helper function.

    - **<u>param</u>**: `actual` { _Any_ }

    - **<u>param</u>**: `expected` { _Any_ }

    - **<u>param</u>**: `maxDepth` { _Number = 7_ }

        Optional. The max depth of the recursion check.

    - **<u>return</u>**: { _Promise_ }

- ## **[junit.reporter(prompt)](src/index.js?source#L192)**

    An example reporter for junit.

    - **<u>param</u>**: `prompt` { _String_ }

        The prompt prefix.

    - **<u>return</u>**: { _Function_ }

        `() => Object`.

    - **<u>example</u>**:

        ```js
        let it = junit({ reporter: junit.reporter('my-prompt > ') });
        ```

- ## **[junit.Promise](src/index.js?source#L198)**

    The promise class that junit uses: [Yaku](https://github.com/ysmood/yaku)

    - **<u>type</u>**: { _Object_ }

- ## **[junit.yutils](src/index.js?source#L204)**

    The promise helpers: [Yaku Utils](https://github.com/ysmood/yaku#utils)

    - **<u>type</u>**: { _Object_ }


