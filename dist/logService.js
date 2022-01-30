"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    // name: string
    constructor() {
    }
    createNamedLogger(name) {
        let logger = new NamedLogger(name, this);
        return logger;
    }
    _log(evt) {
        // Default console.listener.
        console.log(`\x1b[90m${new Date(evt.ts).toISOString()}\t${evt.lvl}\t${evt.src.name}\n\x1b[39m`, ...evt.msg);
    }
}
exports.default = Logger;
class NamedLogger {
    constructor(name, parent) {
        this.name = name;
        this.parentLogger = parent;
    }
    user(...msg) {
        this._log({ lvl: "usr", msg: msg });
    }
    developer(...msg) {
        this._log({ lvl: "dev", msg: msg });
    }
    debug(...msg) {
        this._log({ lvl: "dbg", msg: msg });
    }
    tmp(...msg) {
        this._log({ lvl: "tmp", msg: msg });
    }
    _log(evt) {
        evt.ts = Date.now();
        evt.src = this;
        this.parentLogger._log(evt);
    }
}
// export const logger = new Logger()
