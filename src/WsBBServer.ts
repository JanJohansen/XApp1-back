import * as WebSocket from "ws"
import { AriProtocolHandler } from "./AriProtocolHandler"
import { BB } from "./BB"

let log = console.log//(...args)=>{} //console.log

export default class WsBBServer {
	constructor(bb: BB, config: { port: number }) {
		// Create websocket server and bind w. protocol handler
		const wss: WebSocket.Server = new WebSocket.Server({ port: config.port })
		log("WsBBServer listening on port", wss.options.port)
		wss.on("connection", (ws: WebSocket, req: any) => {
			console.log("WsBBClient connected from IP:", req.socket.remoteAddress + ":" + req.socket.remotePort)

			let protocolHandler = new AriProtocolHandler()
			protocolHandler.out_send = (msg: string) => {
				// log("WsBB.TX:", msg)
				if (ws.readyState == ws.OPEN) ws.send(msg)
			}
			ws.on("message", (data: string) => {
				// log("WsBB.RX:", data)
				protocolHandler.receive(data)
			})
			ws.on("close", () => {})
			ws.on("error", (ws: WebSocket, err: Error) => {})
			
			// -----------------------------------------------------------
			// bind protocolhandæer to BB
			protocolHandler.on("pub", (args) => {
				log("WsBB.pub:", args)
				bb.pub(args.n, args.v)
			})
			protocolHandler.on("sub", (args) => {
				log("WsBB.sub:", args.n)
				bb.sub(args.n, (v, n) => {
					protocolHandler.notify("val", { v, n })
				})
			})
			protocolHandler.on("on", (args) => {
				log("WsBB.on:", args.n)
				bb.on(args.n, (v, n) => {
					protocolHandler.notify("evt", { v, n })
				})
			})
			protocolHandler.on("exists", (args) => {
				log("WsBB.exists:", args.n)
				return bb.exists(args.n)
			})
		}) 
	} 
} 
