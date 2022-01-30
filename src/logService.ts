interface ILogEvent {
    msg: any
    lvl: "usr" | "dev" | "dbg" | "tmp"
    src?: NamedLogger
    ts?: number
}

export default class Logger {
    // name: string
    constructor() {
    }
    createNamedLogger(name: string) {
        let logger = new NamedLogger(name, this)
        return logger
    }
    _log(evt: ILogEvent) {
        // Default console.listener.
        console.log(`\x1b[90m${new Date(evt.ts!).toISOString()}\t${evt.lvl}\t${evt.src!.name}\n\x1b[39m`, ...evt.msg)
    }
}
class NamedLogger {
    name: string
    parentLogger: Logger
    constructor(name: string, parent: Logger) {
        this.name = name
        this.parentLogger = parent
    }
    user(...msg: any){
        this._log({ lvl: "usr", msg: msg })
    }
    developer(...msg: any){
        this._log({ lvl: "dev", msg: msg })
    }
    debug(...msg: any){
        this._log({ lvl: "dbg", msg: msg })
    }
    tmp(...msg: any){
        this._log({ lvl: "tmp", msg: msg })
    }
    private _log(evt: ILogEvent) {
        evt.ts = Date.now()
        evt.src = this
        this.parentLogger._log(evt)
    }
}

// export const logger = new Logger()