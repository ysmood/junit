module.exports = {
    logPass: function (msg, span) {
        console.log(msg, span);
    },

    logFinal: function (total, tested, passed, failed) {
        console.log(total, tested, passed, failed);
    }
};
