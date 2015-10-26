export default {
    logPass: (msg, span) => {
        console.log(msg, span);
    },

    logFinal: (total, tested, passed, failed) => {
        console.log(total, tested, passed, failed);
    }
};
