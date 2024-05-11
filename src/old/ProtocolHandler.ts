import { createLogger } from "./logService"
let log = createLogger("AriClientServer")

import { Protocol } from "./Protocol"
import { BB } from "./BB"

export class ProtocolHandler {
	pHandlers: { [clientId: number]: Protocol } = {}
	constructor(bb: BB) {
		bb.onEvent("WsServer.outs.connected.v", (msg: { clientId: number }) => {
			console.log("PH: CCon", msg)
			let clientId = msg.clientId
			if (!(msg.clientId in this.pHandlers)) this.pHandlers[msg.clientId] = new Protocol()
			else return

			let ph = this.pHandlers[msg.clientId]
			ph.out_send = (msg: string) => {
				bb.emit("ProtocolHandler.outs.message.v", msg)
			}
            ph.out_call = (msg: { name: string; args: any; }): any => {
                bb.call("ProtocolHandler.outs.call.c", {clientId: clientId, name: msg.name, args: msg.args})
            }
            ph.out_notify = (msg: { name: string; args: any; }): any => {
                bb.emit("ProtocolHandler.outs.notify.v", msg.args)
            }

			bb.emit("ProtocolHandler.outs.connected.v", { clientId: msg.clientId })
		}) 
		bb.onEvent("WsServer.outs.message.v", (msg) => {
			console.log("PH: msg", msg)
			let ph = this.pHandlers[msg.clientId]
			if (!ph) return
			ph.receive(msg.msg)
		})
		bb.onEvent("WsServer.outs.disconnected.v", (msg) => {
			console.log("PH: CDiscon", msg)
			delete this.pHandlers[msg.clientId]
			bb.emit("ProtocolHandler.outs.disconnected.v", { clientId: msg.clientId })
		})
		// bb.emit("WsServer.in.send.v", {clientId: number, msg: string})
	}
} 
