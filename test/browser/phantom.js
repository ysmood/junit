var junit = require("../../lib");
var basic = require("../basic");

var it = junit();

basic(it);

it.run().then(function (_ref) {
    var failed = _ref.failed;

    phantom.exit(failed === 0 ? 0 : 1); // eslint-disable-line
});