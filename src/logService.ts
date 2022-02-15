import { getGlobalBB } from "./BB"
let bb = getGlobalBB()

interface ILogEvent {
	msg: any
	lvl: "usr" | "dev" | "dbg" | "tmp"
	src?: string
	ts?: number
}

class Logger {
	constructor() {}
	loggers: string[] = []
	createNamedLogger(name: string) {
		let logger = new NamedLogger(name, this)
		this.loggers.push(name)
		bb.pub("common.log.loggers", this.loggers)
		return logger
	}
	_log(evt: ILogEvent) {
		// Default console.listener.
		console.log(`\x1b[90m${new Date(evt.ts!).toISOString()}\t${evt.lvl}\t${evt.src}\n\x1b[39m`, ...evt.msg)
		bb.pub("common.log.logEvent", evt)
	}
}
class NamedLogger {
	name: string 
	parentLogger: Logger
	constructor(name: string, parent: Logger) {
		this.name = name
		this.parentLogger = parent
	}
	user(...msg: any) {
		this._log({ lvl: "usr", msg: msg })
	}
	developer(...msg: any) {
		this._log({ lvl: "dev", msg: msg })
	}
	debug(...msg: any) {
		this._log({ lvl: "dbg", msg: msg })
	}
	tmp(...msg: any) {
		this._log({ lvl: "tmp", msg: msg })
	}
	private _log(evt: ILogEvent) {
		evt.ts = Date.now()
		evt.src = this.name
		this.parentLogger._log(evt)
	}
}

const globalLogger = new Logger()
export const createLogger = globalLogger.createNamedLogger.bind(globalLogger)
