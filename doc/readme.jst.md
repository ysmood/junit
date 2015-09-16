# JUnit

A simple promise based module for unit tests.
I believe we shouldn't waste time on learning, debugging and waiting the unit test framework itself,
that's why I created JUnit. It's just a curried function, everything inside is controllable, nothing
will be fancy.

[![NPM version](https://badge.fury.io/js/noflow.svg)](http://badge.fury.io/js/noflow) [![Build Status](https://travis-ci.org/ysmood/noflow.svg)](https://travis-ci.org/ysmood/noflow) [![Deps Up to Date](https://david-dm.org/ysmood/noflow.svg?style=flat)](https://david-dm.org/ysmood/noflow) [![Coverage Status](https://coveralls.io/repos/ysmood/junit/badge.svg?branch=master&service=github)](https://coveralls.io/github/ysmood/junit?branch=master)


# Install

## Node.js

`npm install junit`

## Browser

You have to use something like `browserify` or `webpack`.


### Features

- Supports both Node.js and browser
- Made for concurrent tests and async flow control, designed for `async-await`
- Automatically garbage collect the unhandled error
- Full customizable report sytle.
- Not a single global variable pollution
- Only one dependency, light weight and behavior predictable

# API

<%= doc["src/index.js"] %>
