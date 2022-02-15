import { createLogger } from "./logService"
let log = createLogger("AriClientServer")

import { BB } from "./BB"
import { AriClientServer } from "./AriClientServer"

export class ClientHandler {
	clients: { [clientId: number]: AriClientServer } = {}
	constructor(bb: BB) {
		bb.on("ProtocolHandler.outs.connected.v", (msg: { clientId: number }) => {
			console.log("CH: CCon", msg)
			if (!(msg.clientId in this.clients)) this.clients[msg.clientId] = new AriClientServer()
			else return

			let cs = this.clients[msg.clientId]
			//....

			bb.emit("ClientHandler.outs.connected.v", { clientId: msg.clientId })
		})
		bb.on("ProtocolHandler.outs.call.c", (msg: { clientId: number, name: string; args: any }) => {
			console.log("CH.call", msg)

			bb.call("ClientHandler.outs."+ msg.name+".c", {clientId: msg.clientId, args: msg.args })
		})
		bb.on("ProtocolHandler.outs.notify.v", (msg: { name: string; args: any }) => {
			console.log("CH: notify msg", msg)
		})
		bb.on("ProtocolHandler.outs.disconnected.v", (msg) => {
			console.log("PH: CDiscon", msg)
			delete this.clients[msg.clientId]
			bb.emit("ClientHandler.outs.disconnected.v", { clientId: msg.clientId })
		})
	}
}
