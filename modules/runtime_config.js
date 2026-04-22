const defaults = {
    matrixHost: "matrix.local",
    runCandles: false,
    frameDelay: 100,
    invertY: false
};

const state = { ...defaults };

function set(next = {}) {
    if (typeof next.matrixHost === "string" && next.matrixHost.trim().length > 0) {
        state.matrixHost = next.matrixHost.trim();
    }

    if (typeof next.runCandles === "boolean") {
        state.runCandles = next.runCandles;
    }

    if (typeof next.invertY === "boolean") {
        state.invertY = next.invertY;
    }

    if (typeof next.frameDelay !== "undefined") {
        const n = Number(next.frameDelay);
        if (Number.isFinite(n)) {
            state.frameDelay = Math.max(10, Math.min(5000, Math.trunc(n)));
        }
    }
}

function get() {
    return { ...state };
}

module.exports = {
    set,
    get,
    defaults: { ...defaults }
};
