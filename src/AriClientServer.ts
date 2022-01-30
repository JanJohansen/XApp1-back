import { app } from "./AppGlobal"
var log = app.logger.createNamedLogger("AriClientServer")

import { AriProtocolHandler } from "./AriProtocolHandler"
let nextClientId = 1
let clientCount = 0

export class AriClientServer  {
	protocolHandler: AriProtocolHandler
    clientId: number
	constructor() {
		let self = this
		this.clientId = nextClientId++
		clientCount++
		app.db.set("XAServer.clientCount", clientCount)
		this.protocolHandler = new AriProtocolHandler()
		this.protocolHandler.on("authenticate", async (args: any) => {
			log.debug("Authenticating:", args)
			if (!("token" in args)) return { err: "Authentication failed: Invalid token." }
			if (args.token == 42) return { userName: "Mr.42." }
			else return { err: "Authentication failed." }
		})
		this.protocolHandler.on("reqAuth", async (args: any) => {
			log.debug("Request for authentification token:", args)
			if ("user" in args && "pw" in args) {
				if (args.pw == 42) {
					// TODO: Find next unique name for user
					let userName = args.user + "(1)"
					process.nextTick(() => self.emit("connected", self))
					return { name: userName, token: 42 }
				} else return { err: "Authentication failed." }
			}
		})
		this.protocolHandler.on("ping", async (args: any) => {
			log.debug("Got ping:", args)
			return args
		})

		//---------------------------------------------------------------------
		this.protocolHandler.on("set", async (args: any) => {
			// log.developer("set", args)
			app.db.set(args.p, args.v)
		})
		this.protocolHandler.on("sub", async (args: any) => {
			log.developer("sub", args)
			return app.db.sub(args, (v, p) => {
				this.protocolHandler.notify("upd", { v, p })
			})
		})
		this.protocolHandler.on("unsub", async (args: any) => {
			log.developer("unsub", args)
			return app.db.unsub(this.clientId, args.p)
		})
	}

	close() {
		clientCount--
		app.db.set("XAServer.clientCount", clientCount)
	}

	//------------------
	// Support functions
	private __jsonReplacer(key: string, value: any) {
		if (key.startsWith("__")) return undefined
		else return value
	}
}
