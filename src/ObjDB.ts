import { createLogger } from "./logService"
let log = createLogger("ObjDB")
import { patch } from "./common/util"
import fs from "fs"
import { AriClientServer } from "./AriClientServer"

// let newLog = (...args:any)=>app.log(args)

export default class ObjDB {
	clients: { [path: string]: AriClientServer } = {}
	objects: { [path: string]: any } = {}
	values: { [path: string]: any } = {}
	subs: { [path: string]: [serverID: string] | undefined | [] } = {}

	dbFile = "./ObjDB.json"
	constructor() {
		this.loadDbFileSync()
		// this.dump()

		// TODO: Crash handler

		// Save DB each 10 mins
		setInterval(() => {
			this.saveDbFileSync()
		}, 10 * 60 * 1000)
	}
	saveDbFileSync() {
		if (fs.existsSync(this.dbFile)) fs.renameSync(this.dbFile, this.dbFile + ".backup")
		// FIXME: Only save objects marked persist/nopersist
		fs.writeFileSync(this.dbFile, JSON.stringify(this.objects))
		console.log("----------------------------------------")
		console.log(this.dbFile + "-file written.")
	}
	loadDbFileSync() {
		let self = this
		let json: string = fs.readFileSync(self.dbFile, { encoding: "utf8" })
		try {
			this.objects = JSON.parse(json)
			console.log("Loading ObjDB from " + this.dbFile + "succeeded.")
		} catch (e) {
			console.log("ERROR: Loading ObjDB from " + this.dbFile + "failed!")
		}
	}

	clientConnected(client: AriClientServer) {
		console.log("ObjDB.clientConnected:", client.clientId)
		this.clients[client.clientId] = client
		// Subscribe ObjectIndex-object
		client.rSub("idx:id")
	}

	clientDisconnected(client: AriClientServer) {
		console.log("ObjDB.clientDisconnected:", client.clientId)
		delete this.clients[client.clientId]
	}

	set(path: string, value: any) {
		console.log("ObjDB.set:", path, value)
		// newLog("ObjDB.set:", path, value)

		// Insert into object model
		let pathArray = path.split(".")
		if (pathArray.length < 1) {
			console.log("Error: Missing path in call to objDB.set command.")
			return
		}
		if (pathArray.length > 1) {
			// Insert "value"
			console.log("Obj.set --> values", path, value)
			this.values[path] = value
		}
		// Patch object w. update
		let prop = pathArray.shift()
		if (!(prop! in this.objects)) this.objects[prop!] = {} // Create if not exists
		let obj = this.objects[prop!]
		while (obj && pathArray.length > 1) {
			prop = pathArray.shift()
			if (!(prop! in obj)) {
				obj[prop!] = {}
			} // else nop
			if (typeof obj[prop!] != "object") obj[prop!] = {} // Overwrite previous non-object value of property!
			obj = obj[prop!]
		}
		prop = pathArray.shift()
		obj[prop!] = value

		// Notify path subscribers
		if (path in this.subs) {
			console.log("NotifySub:", path, value)
			let cbs = this.subs[path]
			if (cbs) cbs.forEach((cb) => cb(value, path))
		}
	}

	sub(path: string, cb: (value: any, name: string) => void) {
		// Subscribe internally
		console.log("ObjDB.sub", path, this.values)
		if (!(path in this.subs)) this.subs[path] = []
		this.subs[path]!.push(cb)
		// Send initial state
		if (path in this.objects) cb(this.objects[path], path)
		else if (path in this.values) cb(this.values[path], path)
		else {
			// TODO: Subscribe @ client if not already done.
		}
	}

	unsub(path: string, cb: (value: any, name: string) => void) {
		console.log("sub", path)
		let cbs = this.subs[path]
		if (!cbs) return
		let cbIdx = cbs.indexOf(cb)
		if (cbIdx > 0) return
		cbs.splice(cbIdx, 1)
	}

	// Helpers ****************************************************************
	lastTs = 0
	cnt = 0
	createID(): string {
		let ts = Date.now()
		if (ts == this.lastTs) return ts.toString() + "_" + this.cnt++
		else {
			this.cnt = 0
			this.lastTs = ts
		}
		return ts.toString()
	}

	dump() {
		console.log(JSON.stringify(this.indexes, null, 2))
	}
}
