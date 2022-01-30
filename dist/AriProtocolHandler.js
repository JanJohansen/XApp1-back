"use strict";
// DIFFERENT files for back/fron due to process.nextTick in NodeJS vs nextTick in browser!
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
exports.AriProtocolHandler = void 0;
/**
 * @description Generic protocol handler between ARI peers.
 * @function on(name, callback) = Register function <callback> to be called on command/telegram named <name> from peer.
 * @function call(name, args) = Call remote function <name> with arguments <args>
 * @function notify(name, args) = Send <name> message/telegram to peer with arguments <args>
 */
class AriProtocolHandler {
    constructor() {
        this._requestHandlers = {};
        this._pendingRequests = {};
        // private -->> pendingCalls: {name: string, args: any}[] = []
        this._reqId = 0;
        this.out_send = (message) => { }; // Override to send message to peer.
        this.batching = false;
        this.batch = [];
    }
    receive(message) {
        let self = this;
        var json = undefined;
        try {
            json = JSON.parse(message);
        }
        catch (err) {
            console.log("Error in received websocket data.");
            console.log("Data:", message);
            console.log("Error:", err);
        }
        // console.log("wsRx:", message)
        json.forEach((json) => __awaiter(this, void 0, void 0, function* () {
            if ("op" in json) {
                if (json.op in this._requestHandlers) {
                    if ("req" in json) {
                        // Handle request
                        var retVal = this._requestHandlers[json.op](json.args);
                        if (retVal instanceof Promise) {
                            try {
                                let ok = yield retVal;
                                // return JSON.stringify({ res: json.req, ok: ok })
                                this.send({ res: json.req, ok: ok });
                            }
                            catch (err) {
                                // Don't return exeptions - throw, to ensure we detect and fix!!!
                                console.log("Promise error:", err);
                                // return JSON.stringify({ res: json.req, err: "Exception on server: " + err })
                                this.send({ res: json.req, err: "Exception on server: " + err });
                                //process.exit(1)
                                // TODO: Restart
                                // throw(err)
                                // ws.send(JSON.stringify({ res: msg.req, err: err }))
                            }
                        }
                        else {
                            // Treat function as synchronus call and return return value!
                            // return JSON.stringify({ res: json.req, ok: retVal })
                            this.send({ res: json.req, ok: retVal });
                        }
                    }
                    else {
                        // Handle event/notification - Ignore any return values!
                        let self = this;
                        process.nextTick(() => {
                            self._requestHandlers[json.op](json.args);
                        });
                    }
                }
                else {
                    console.log("Error: Missing handler for protocol call:", json.op);
                }
            }
            else {
                if ("res" in json) {
                    // Handle response
                    let { resolve, reject } = this._pendingRequests[json.res];
                    delete this._pendingRequests[json.res];
                    if ("ok" in json)
                        resolve(json.ok);
                    else if ("err" in json)
                        reject(json.err);
                }
            }
        }));
    }
    call(name, args = {}) {
        return new Promise((resolve, reject) => {
            // TODO: Implement timeout rejection
            this._pendingRequests[this._reqId] = { resolve, reject };
            // this.out_send(JSON.stringify({ op: name, req: this._reqId, args: args }, this.__jsonReplacer))
            this.send({ op: name, req: this._reqId, args: args });
            this._reqId++;
        });
    }
    notify(name, args) {
        // console.log("PH Notify->", name)
        // this.out_send(JSON.stringify({ op: name, args: args }, this.__jsonReplacer))
        this.send({ op: name, args: args });
    }
    on(name, callback) {
        this._requestHandlers[name] = callback;
    }
    send(message) {
        if (!this.batching) {
            this.batching = true;
            this.batch.push(message);
            setTimeout(() => {
                // console.log("->", this.batch)
                this.out_send(JSON.stringify(this.batch, this.__jsonReplacer));
                this.batch = [];
                this.batching = false;
            }, 1);
        }
        else {
            console.log("Batching:", message);
            this.batch.push(message);
        }
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
exports.AriProtocolHandler = AriProtocolHandler;
