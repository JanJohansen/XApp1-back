"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AriClientServer = void 0;
const AppGlobal_1 = require("./AppGlobal");
var log = AppGlobal_1.app.logger.createNamedLogger("AriClientServer");
const AriProtocolHandler_1 = require("./AriProtocolHandler");
let nextClientId = 1;
let clientCount = 0;
class AriClientServer {
    constructor() {
        let self = this;
        this.clientId = nextClientId++;
        clientCount++;
        AppGlobal_1.app.db.set("XAServer.clientCount", clientCount);
        this.protocolHandler = new AriProtocolHandler_1.AriProtocolHandler();
        this.protocolHandler.on("authenticate", (args) => __awaiter(this, void 0, void 0, function* () {
            log.debug("Authenticating:", args);
            if (!("token" in args))
                return { err: "Authentication failed: Invalid token." };
            if (args.token == 42)
                return { userName: "Mr.42." };
            else
                return { err: "Authentication failed." };
        }));
        this.protocolHandler.on("reqAuth", (args) => __awaiter(this, void 0, void 0, function* () {
            log.debug("Request for authentification token:", args);
            if ("user" in args && "pw" in args) {
                if (args.pw == 42) {
                    // TODO: Find next unique name for user
                    let userName = args.user + "(1)";
                    process.nextTick(() => self.emit("connected", self));
                    return { name: userName, token: 42 };
                }
                else
                    return { err: "Authentication failed." };
            }
        }));
        this.protocolHandler.on("ping", (args) => __awaiter(this, void 0, void 0, function* () {
            log.debug("Got ping:", args);
            return args;
        }));
        //---------------------------------------------------------------------
        this.protocolHandler.on("set", (args) => __awaiter(this, void 0, void 0, function* () {
            // log.developer("set", args)
            AppGlobal_1.app.db.set(args.p, args.v);
        }));
        this.protocolHandler.on("sub", (args) => __awaiter(this, void 0, void 0, function* () {
            log.developer("sub", args);
            return AppGlobal_1.app.db.sub(args, (v, p) => {
                this.protocolHandler.notify("upd", { v, p });
            });
        }));
        this.protocolHandler.on("unsub", (args) => __awaiter(this, void 0, void 0, function* () {
            log.developer("unsub", args);
            return AppGlobal_1.app.db.unsub(this.clientId, args.p);
        }));
    }
    close() {
        clientCount--;
        AppGlobal_1.app.db.set("XAServer.clientCount", clientCount);
    }
    //------------------
    // Support functions
    __jsonReplacer(key, value) {
        if (key.startsWith("__"))
            return undefined;
        else
            return value;
    }
}
exports.AriClientServer = AriClientServer;
