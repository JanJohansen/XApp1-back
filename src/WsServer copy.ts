import { createLogger } from "./logService"
let log = createLogger("WsServer")

import * as WebSocket from "ws"
import { globalBB } from "./BB"
import { AriClientServer } from "./AriClientServer"
let bb = globalBB()

export default class WsServerOLD {
	clients: { [clientId: number]: WebSocket } = {}
	nextId = 0
	constructor(config: { port: number }) {
		const wss: WebSocket.Server = new WebSocket.Server({ port: config.port })
		log.debug("WebSocket server listening on port", wss.options.port)

		bb.on("WsServer.in.send.v", (evt: {clientId: number, msg: string})=>{
			if(evt.clientId in this.clients) {
				let ws = this.clients[evt.clientId]
				if (ws.readyState == ws.OPEN) ws.send(msg)
				else console.log("WsServer: Error when trying to send message to disconnected client.")
			} else console.log("WsServer: Error when trying to send message to unknown client.")
		})

		var self: any = this
		wss.on("connection", (ws: WebSocket, req: any) => {
			let clientId = self.nextId++
			this.clients[clientId] = ws
			log.debug("Client connected from IP:", req.socket.remoteAddress + ":" + req.socket.remotePort)

			// let clientServer = new AriClientServer(db)
			// clientServer.protocolHandler.out_send = (msg: string) => {
			// 	// log.debug("->TX:", msg)
			// 	if (ws.readyState == ws.OPEN) ws.send(msg)
			// }
			ws.on("message", (data: string) => {
				// clientServer.protocolHandler.receive(data)
				bb.emit("WsServer.out.msg.v", {clientId: clientId, msg: data})
			})
			ws.on("close", () => {
				// clientServer.close()
				bb.emit("WsServer.out.disconnected.v", {clientId: clientId})
				delete this.clients[clientId]
			})
			ws.on("error", (ws: WebSocket, err: Error) => {
				// clientServer.close()
				bb.emit("WsServer.out.disconnected.v", {clientId: clientId})
				delete this.clients[clientId]
			})

			bb.emit("WsServer.out.connected.v", {clientId: clientId})
		})
	}
}
