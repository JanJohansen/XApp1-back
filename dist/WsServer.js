"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppGlobal_1 = require("./AppGlobal");
var log = AppGlobal_1.app.logger.createNamedLogger("WSServer");
const WebSocket = __importStar(require("ws"));
const AriClientServer_1 = require("./AriClientServer");
class WsServer {
    constructor(config) {
        this.connectionCount = 0;
        this.messageCount = 0;
        const wss = new WebSocket.Server({ port: config.port });
        log.debug("WebSocket server listening on port", wss.options.port);
        var self = this;
        wss.on("connection", (ws, req) => {
            log.debug("Client connected from IP:", req.socket.remoteAddress + ":" + req.socket.remotePort);
            let clientServer = new AriClientServer_1.AriClientServer();
            clientServer.protocolHandler.out_send = (msg) => {
                // log.debug("->TX:", msg)
                if (ws.readyState == ws.OPEN)
                    ws.send(msg);
            };
            ws.on("message", (data) => {
                clientServer.protocolHandler.receive(data);
                // .then((ok: any) => {
                //     if (ok) ws.send(ok)
                // })
                // .catch((err)=>{
                //     ws.send(err)
                // })
                this.messageCount++;
            });
            ws.on("close", () => {
                clientServer.close();
                this.connectionCount--;
            });
            ws.on("error", (ws, err) => {
                this.connectionCount--;
            });
        });
    }
}
exports.default = WsServer;
