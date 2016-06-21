/**
 * Assert if two object is deeply equal.
 * If the two are not equal, reject with a diff patch object.
 * @param  {Any} a
 * @param  {Any} b
 * @return {Promise}
 */
module.exports = function (a, b) {

};

/**
 * Walk through the obj and prevent cycle.
 * @param  {[type]} obj  [description]
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
function iter (a, b, path) {
    if (a === undefined) {
        return strictEq(a, b);
    } else if (a === null) {
        return strictEq(a, b);
    } else {
        switch (a.constructor) {
        case String:
            break;

        case Number:
            break;

        case Array:
            break;

        case Boolean:
            break;

        default:
            break;

        }
    }
}

function diff (a, b) {
    if (a.constructor === Object) {
        a = keys(a).sort();
        b = keys(b).sort();
    }

    var sub = lcs(a, b);

    var i = 0, j = 0, k = 0;
    var iLen = a.length;
    var jLen = b.length;
    var kLen = sub.length;
    var res = [];

    // a b c
    // a c b
    while (i < iLen || j < jLen || k < kLen) {
        if (sub[k] === a[i] && sub[k] === b[j]) {
            res.push(sub[k]);
            i++;
            j++;
            k++;

        // add
        } else if (sub[k] === a[i] && sub[k] !== b[j]) {
            res.push('+' + b[j]);
            j++;

        // remove
        } else if (sub[k] !== a[i] && sub[k] === b[j]) {
            res.push('-' + a[i]);
            i++;
        }
    }

    return res;
}

function lcs (a, b) {
    var table = lscTable(a, b);
    var res = [];

    var i = 0, j = 0;
    var iLen = table.length;
    var jLen = table.length === 0 ? 0 : table[0].length;
    var right, bottom;

    while (i < iLen && j < jLen) {
        if (a[i] === b[j]) {
            res.push(a[i]);
            i++;
            j++;
        } else {
            right =  j + 1 === jLen ? -1 : table[i][j + 1];
            bottom = i + 1 === iLen ? -1 : table[i + 1][j];

            if (right < bottom) {
                i++;
            } else {
                j++;
            }
        }
    }

    return res;
}

function keys (obj) {
    var list = [];
    var k;

    for (k in obj) {
        list.push(k);
    }

    return list;
}

function lscTable (a, b) {
    var table = [];
    var row;
    var max;
    var iLen = a.length;
    var jLen = b.length;

    for (var i = 0; i < iLen; i++) {
        row = [];
        for (var j = 0; j < jLen; j++) {
            max =  Math.max(
                j === 0 ? 0 : row[j - 1],
                i === 0 ? 0 : table[i - 1][j]
            );

            row[j] = a[i] === b[j] ? max + 1 : max;
        }

        table.push(row);
    }

    return table;
}

function strictEq (a, b) {
    return a === b;
}

module.exports = diff;
