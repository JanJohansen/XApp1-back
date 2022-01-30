
// DIFFERENT files for back/fron due to process.nextTick in NodeJS vs nextTick in browser!

/**
 * @description Generic protocol handler between ARI peers.
 * @function on(name, callback) = Register function <callback> to be called on command/telegram named <name> from peer.
 * @function call(name, args) = Call remote function <name> with arguments <args>
 * @function notify(name, args) = Send <name> message/telegram to peer with arguments <args>
 */
export class AriProtocolHandler {
    private _requestHandlers: { [functionName: string]: (args: any) => any } = {}
    private _pendingRequests: { [id: number]: { resolve: (returnValue: any) => void, reject: (rejectValue: any) => void } } = {}
    // private -->> pendingCalls: {name: string, args: any}[] = []
    private _reqId = 0
    public out_send = (message: string) => { }   // Override to send message to peer.
    constructor() {
    }
    receive(message: string): void {
        let self = this
        var json: any = undefined 
        try {
            json = JSON.parse(message)
        }
        catch (err) {
            console.log("Error in received websocket data.")
            console.log("Data:", message)
            console.log("Error:", err)
        }
        // console.log("wsRx:", message)
        json.forEach(async (json: any) => {
            if ("op" in json) {
                if (json.op in this._requestHandlers) {
                    if ("req" in json) {
                        // Handle request
                        var retVal = this._requestHandlers[json.op](json.args)
                        if (retVal instanceof Promise) {
                            try {
                                let ok = await retVal
                                // return JSON.stringify({ res: json.req, ok: ok })
                                this.send({ res: json.req, ok: ok })
                            } catch (err) {
                                // Don't return exeptions - throw, to ensure we detect and fix!!!
                                console.log("Promise error:", err)
                                // return JSON.stringify({ res: json.req, err: "Exception on server: " + err })
                                this.send({ res: json.req, err: "Exception on server: " + err })
                                //process.exit(1)
                                // TODO: Restart
                                // throw(err)
                                // ws.send(JSON.stringify({ res: msg.req, err: err }))
                            }
                        } else {
                            // Treat function as synchronus call and return return value!
                            // return JSON.stringify({ res: json.req, ok: retVal })
                            this.send({ res: json.req, ok: retVal })
                        }
                    } else {
                        // Handle event/notification - Ignore any return values!
                        let self = this
                        process.nextTick(()=>{  // Handle in next tick to maintain sequence between notifications and calls (using promise resolution/rejection).!
                            self._requestHandlers[json.op](json.args)
                        })
                    }
                } else {
                    console.log("Error: Missing handler for protocol call:", json.op)
                }
            } else {
                if ("res" in json) {
                    // Handle response
                    let { resolve, reject } = this._pendingRequests[json.res]
                    delete this._pendingRequests[json.res]
                    if ("ok" in json) resolve(json.ok)
                    else if ("err" in json) reject(json.err)
                }
            }
        });
    }
    call(name: string, args: any = {}): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // TODO: Implement timeout rejection
            this._pendingRequests[this._reqId] = { resolve, reject }
            // this.out_send(JSON.stringify({ op: name, req: this._reqId, args: args }, this.__jsonReplacer))
            this.send({ op: name, req: this._reqId, args: args })
            this._reqId++
        })
    }
    notify(name: string, args: any): void {
        // console.log("PH Notify->", name)
        // this.out_send(JSON.stringify({ op: name, args: args }, this.__jsonReplacer))
        this.send({ op: name, args: args })
    }
    on(name: string, callback: (args: any) => any): void {
        this._requestHandlers[name] = callback
    }

    batching = false
    batch: any[] = []
    send(message: any) {
        if (!this.batching) {
            this.batching = true
            this.batch.push(message)
            setTimeout(() => {
                // console.log("->", this.batch)
                this.out_send(JSON.stringify(this.batch, this.__jsonReplacer))
                this.batch = []
                this.batching = false
            }, 1);
        } else {
            console.log("Batching:", message)
            this.batch.push(message)
        }
    }

    //------------------
    // Support functions
    private __jsonReplacer(key: string, value: any) {
        if (key.startsWith("__")) return undefined
        else return value
    }
}