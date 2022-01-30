"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppGlobal_1 = require("./AppGlobal");
console.log("App:", AppGlobal_1.app);
const fs_1 = __importDefault(require("fs"));
class ObjDB {
    constructor() {
        this.clients = {};
        this.objects = {};
        this.values = {};
        this.subs = {};
        this.dbFile = "./ObjDB.json";
        // Helpers ****************************************************************
        this.lastTs = 0;
        this.cnt = 0;
        this.loadDbFileSync();
        // this.dump()
        // TODO: Crash handler
        // Save DB each 10 mins
        setInterval(() => {
            this.saveDbFileSync();
        }, 10 * 60 * 1000);
    }
    saveDbFileSync() {
        if (fs_1.default.existsSync(this.dbFile))
            fs_1.default.renameSync(this.dbFile, this.dbFile + ".backup");
        // FIXME: Only save objects marked persist/nopersist
        fs_1.default.writeFileSync(this.dbFile, JSON.stringify(this.objects));
        console.log("----------------------------------------");
        console.log(this.dbFile + "-file written.");
    }
    loadDbFileSync() {
        let self = this;
        let json = fs_1.default.readFileSync(self.dbFile, { encoding: "utf8" });
        try {
            this.objects = JSON.parse(json);
            console.log("Loading ObjDB from " + this.dbFile + "succeeded.");
        }
        catch (e) {
            console.log("ERROR: Loading ObjDB from " + this.dbFile + "failed!");
        }
    }
    clientConnected(client) {
        this.clients[client.clientId] = client;
    }
    clientDisconnected(client) {
        delete this.clients[client.clientId];
    }
    set(path, value) {
        console.log("ObjDB.set:", path, value);
        // Insert into object model
        let pathArray = path.split(".");
        if (pathArray.length < 1) {
            console.log("Error: Missing path in call to objDB.set command.");
            return;
        }
        else if (pathArray.length > 2) {
            // Insert value
            this.values[path] = value;
        }
        let prop = pathArray.shift();
        // Patch object w. update
        // Create if not exists
        if (!(prop in this.objects))
            this.objects[prop] = {};
        let obj = this.objects[prop];
        while (obj && pathArray.length > 1) {
            prop = pathArray.shift();
            if (!(prop in obj)) {
                obj[prop] = {};
            } // else nop
            obj = obj[prop];
        }
        prop = pathArray.shift();
        obj[prop] = value;
        // Notify path subscribers
        if (path in this.subs) {
            console.log("NotifySub:", path, value);
            let cbs = this.subs[path];
            if (cbs)
                cbs.forEach((sub) => sub(value, path));
        }
    }
    sub(path, cb) {
        // Subscribe internally
        console.log("sub", path);
        if (!(path in this.subs))
            this.subs[path] = [];
        this.subs[path].push(cb);
        // Send initial state
        if (path in this.objects)
            cb(path, this.objects[path]);
        else if (path in this.values)
            cb(path, this.values[path]);
        else {
            // TODO: Subscribe @ client if not already done.
        }
    }
    unsub(path, cb) {
        console.log("sub", path);
        let cbs = this.subs[path];
        if (!cbs)
            return;
        let cbIdx = cbs.indexOf(cb);
        if (cbIdx > 0)
            return;
        cbs.splice(cbIdx, 1);
    }
    createID() {
        let ts = Date.now();
        if (ts == this.lastTs)
            return ts.toString() + "_" + this.cnt++;
        else {
            this.cnt = 0;
            this.lastTs = ts;
        }
        return ts.toString();
    }
    dump() {
        console.log(JSON.stringify(this.indexes, null, 2));
    }
}
exports.default = ObjDB;
