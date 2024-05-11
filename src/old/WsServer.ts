import { createLogger } from "../logService"
let log = createLogger("WsServer")

import * as WebSocket from "ws"

import { BB } from "../BB"

export default class WsServer {
	clients: { [clientId: number]: WebSocket } = {}
	nextId = 0
	constructor(bb: BB, config: { port: number }) {
		const wss: WebSocket.Server = new WebSocket.Server({ port: config.port })
		console.log("WebSocket server listening on port", wss.options.port)

		bb.onEvent("WsServer.ins.send.v", (evt: {clientId: number, msg: string})=>{
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
			console.log("Client connected from IP:", req.socket.remoteAddress + ":" + req.socket.remotePort)

			ws.on("message", (data: any) => {
				bb.emit("WsServer.outs.message.v", {clientId: clientId, msg: data})
			})
			ws.on("close", () => {
				bb.emit("WsServer.outs.disconnected.v", {clientId: clientId})
				delete this.clients[clientId]
			})
			ws.on("error", (ws: WebSocket, err: Error) => {
				bb.emit("WsServer.outs.disconnected.v", {clientId: clientId})
				delete this.clients[clientId]
			})

			bb.emit("WsServer.outs.connected.v", {clientId: clientId})
		})
	}
}
