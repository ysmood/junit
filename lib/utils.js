"use strict";

var Promise = require("yaku");

var report = function (formatAssertErr, actual, expected) {
    return Promise.reject(formatAssertErr(actual, expected));
};

var isArray = function (json) {
    return json && (typeof json === "undefined" ? "undefined" : typeof json) === "object" && typeof json.length === "number";
};

var getNames = function (json) {
    var names = [];
    if (json && (typeof json === "undefined" ? "undefined" : typeof json) === "object") {
        for (var name in json) {
            names.push(name);
        }
    }
    return names;
};

var isPureObj = function (json) {
    return json && (typeof json === "undefined" ? "undefined" : typeof json) === "object" && !isArray(json);
};

var getLen = function (json) {
    return isArray(json) ? json.length : getNames(json).length;
};

var nextPath = function (path, next) {
    return path === "" ? next : path + "." + next;
};

var joinRes = function (res, json1, json2, path) {
    return res ? { pass: true } : { pass: false, path: path, json1: json1, json2: json2 };
};

// used as an unique object for exception
var $maxDepthErr = {};

var eq = function (json1, json2, depthCountdown) {
    var path = arguments.length <= 3 || arguments[3] === undefined ? "" : arguments[3];

    if (depthCountdown === 0) {
        return $maxDepthErr;
    }
    var isBothArr = isArray(json1) && isArray(json2);
    var isBothObj = isPureObj(json1) && isPureObj(json2);

    var json = getLen(json1) > getLen(json2) ? json1 : json2;
    var eqRes;
    if (isBothArr) {
        for (var i = 0; i < json.length; i++) {
            eqRes = eq(json1[i], json2[i], depthCountdown - 1, nextPath(path, i));
            if ($maxDepthErr === eqRes) return $maxDepthErr;
            if (!eqRes.pass) return eqRes;
        }
    } else if (isBothObj) {
        for (var name in json) {
            eqRes = eq(json1[name], json2[name], depthCountdown - 1, nextPath(path, name));
            if ($maxDepthErr === eqRes) return $maxDepthErr;
            if (!eqRes.pass) return eqRes;
        }
    } else if (json1 !== json2) {
        return joinRes(false, json1, json2, path);
    }

    return joinRes(true);
};

function spread (fn) {
    return function (args) {
        return fn.apply(null, args);
    };
}

function asyncWrap (fn) {
    fn = spread(fn);
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return Promise.all(args).then(fn);
    };
}

module.exports = {
    extend: function (obj, src) {
        for (var key in src) {
            if (src[key] !== undefined) obj[key] = src[key];
        }
        return obj;
    },

    isArray: isArray,

    eq: function (formatAssertErr) {
        return asyncWrap(function (actual, expected) {
            var depthCountdown = arguments.length <= 2 || arguments[2] === undefined ? 7 : arguments[2];

            var eqRes = eq(actual, expected, depthCountdown);
            if (eqRes === $maxDepthErr) {
                var errText = "Maximum recursion depth exceeded: " + depthCountdown;
                return report(formatAssertErr, errText, errText);
            }
            if (eqRes.pass) return Promise.resolve();

            return report(formatAssertErr, actual, expected);
        });
    }
};