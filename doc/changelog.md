- v1.4

  - opt: Default test message now is empty
  - **API CHANGE** cli `--isBailed` and `--isFailOnUnhandled` are replaced by `--bail`, `failOnUnhandled`

- v1.3

  - add: junit-debug command for `node debug`

- v1.2

  - **API CHANGE** `junit.reporter` now accpet an object as argument
  - add: better support for phantomjs now

- v1.1.2

  - **API CHANGE** now `it.eq` will auto-resolve promise arguments by default.
  - upd: deps
  - opt: reporter format

- v0.9.5

  - add: after hook api
  - add: support babel 6

- v0.8.3

  - fix: a cli sync test bug
  - opt: the error handling

- v0.8.1

  - **API CHANGE** The flow control is changed
  - **API CHANGE** removed the `test suite` cli option
  - add: `describe` api

- v0.6.1

  - **API CHANGE** `isThrowOnFinal` changed to `isExitWithFailed`
  - opt: minor

- v0.5.6

  - opt: cli tool
  - upd: deps
