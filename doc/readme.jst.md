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

<%= doc["src/index.js"] %>
