
export default (it, path) => ({
    it: (msg, fn) => it(`${msg} -> ${path}`, fn),
    eq: it.eq
});
