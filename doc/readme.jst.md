# JUnit

A simple promise based function for unit tests.
I believe we shouldn't waste time on learning, debugging and waiting the unit test framework itself,
that's why I created JUnit. It's just a curried function, everything inside is controllable, nothing
will be fancy.

[![NPM version](https://badge.fury.io/js/junit.svg)](http://badge.fury.io/js/junit) [![Build Status](https://travis-ci.org/ysmood/junit.svg)](https://travis-ci.org/ysmood/junit) [![Deps Up to Date](https://david-dm.org/ysmood/junit.svg?style=flat)](https://david-dm.org/ysmood/junit) [![Coverage Status](https://coveralls.io/repos/ysmood/junit/badge.svg?branch=master&service=github)](https://coveralls.io/github/ysmood/junit?branch=master)


# Install

## Node.js

`npm install junit` then you can `var junit = require("junit").default` or `import junit from "junit"`.

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

- I cannot `require('junit')`.

  > For non-es6, use `require('junit').default`.

- IE6?

  > The core framework of JUnit will work. But the default reporter only supports IE8>=, you may have to
  > install & config to another reporter to support old browsers.


# CLI

Install junit globally: `npm i -g junit`.
It will automatically take advantage of the `babel` if
you have installed it globally.

For example, created a file `test/fib-test.js`,
it should export a function, if the function is async it should return a promise, such as:

```js
module.exports = async it => {
    it("fib 01", () => it.eq(1 + 1, 2));

    it("fib 02", () => it.eq(1 + 2, 3));

    it("fib 03", () => it.eq(2 + 3, 5));
};
```

Run the tests via `junit test/*.js`.

For more documentation, run `junit -h`.

To watch and auto-rerun test please use [`noe`](https://github.com/ysmood/nokit#the-noe-comamnd):

```bash
noe -b junit -w 'test/*.js' -- 'test/*.js'
```

![junit-demo](doc/junit-demo.gif)


# API

<%= doc["lib/index.js-toc"] %>

---------------------------------------

<%= doc["lib/index.js"] %>
