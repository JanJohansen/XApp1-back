import * as WebSocket from "ws"
import { AriProtocolHandler } from "./AriProtocolHandler"
import { BB } from "./BB"

import {createLogger} from "./logService"
const log =  createLogger("WsBBServer")


export default class WsBBServer {
	constructor(bb: BB, config: { port: number }) {
		
		// Create websocket server and bind w. protocol handler
		const wss: WebSocket.Server = new WebSocket.Server({ port: config.port })
		log.usr("WsBBServer listening on port", wss.options.port)
		
		wss.on("connection", (ws, req) => {
			log.dev("WsBBClient connected from IP:", req.socket.remoteAddress + ":" + req.socket.remotePort)

			// -----------------------------------------------------------
			// Bind WS and ProtocolHandler
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
			// bind protocolhandler to BB
			// Objects -----------
			protocolHandler.on("oPub", (args) => {
				log.debug("WsBB.oPub:", args)
				bb.oPub(args.n, args.v)
			})  
			protocolHandler.on("oSub", (args) => {
				log.debug("WsBB.oSub:", args.n)
				bb.oSub(args.n, (v, n) => {
					protocolHandler.notify("oUpd", { v, n })
				})
			})
			protocolHandler.on("oExists", (args) => {
				const result = bb.oExists(args.n)
				log.debug("WsBB.oExists:", args.n, "=", result)
				return result
			})
			// Values ------------
			protocolHandler.on("vPub", (args) => {
				log.debug("WsBB.vPub:", args)
				bb.vPub(args.n, args.v)
			})
			protocolHandler.on("vSub", (args) => {
				log.debug("WsBB.vSub:", args.n)
				bb.vSub(args.n, (v, n) => {
					// log("WsBB.vSub-->val:", v, n)
					protocolHandler.notify("vUpd", { v, n })
				})
			})
			protocolHandler.on("vExists", (args) => {
				const result = bb.vExists(args.n)
				log.debug("WsBB.vExists:", args.n, "=", result)
				return result
			})
			// Events -----------
			protocolHandler.on("on", (args) => {
				log.debug("WsBB.on:", args.n)
				bb.onEvent(args.n, (v, n) => {
					protocolHandler.notify("evt", { v, n })
				})
			})
			// Todo: Calls -----------
		}) 
	} 
} 
