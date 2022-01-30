import { app } from "./AppGlobal"
var log = app.logger.createNamedLogger("WSServer")

import * as WebSocket from 'ws';
import { AriClientServer } from "./AriClientServer"

export default class WsServer {
    connectionCount = 0
    messageCount = 0
    constructor(config: {port: number}) {
        const wss: WebSocket.Server = new WebSocket.Server({ port: config.port })
        log.debug("WebSocket server listening on port", wss.options.port)
        var self: any = this
        wss.on("connection", (ws: WebSocket, req: any) => {
            log.debug("Client connected from IP:", req.socket.remoteAddress + ":" + req.socket.remotePort)
            
            let clientServer = new AriClientServer()
            clientServer.protocolHandler.out_send = (msg: string) => {
                // log.debug("->TX:", msg)
                if (ws.readyState == ws.OPEN) ws.send(msg)
            }

            ws.on("message", (data: string) => {
                clientServer.protocolHandler.receive(data)
                    // .then((ok: any) => {
                    //     if (ok) ws.send(ok)
                    // })
                    // .catch((err)=>{
                    //     ws.send(err)
                    // })
                this.messageCount++
            })
            ws.on("close", () => { 
                clientServer.close() 
                this.connectionCount--
            })
            ws.on("error", (ws: WebSocket, err: Error) => { 
                this.connectionCount--
            })

        })
    }
}

