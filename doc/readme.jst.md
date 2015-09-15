# Ken

A simple promise based module for unit tests.
I believe we shouldn't waste time on learning, debugging and waiting the unit test framework itself,
that's why I created JUnit. It's just a curried function, everything inside is controllable, nothing
will be fancy.

### Features

- Support on both Node.js and browser
- Made for concurrent tests and async flow control, designed for `async-await`
- Automatically garbage collect the unhandled error
- Full customizable report sytle.
- Not a single global variable pollution
- Only one dependency, light weight and behavior predictable

# API

<%= doc["src/index.js"] %>
