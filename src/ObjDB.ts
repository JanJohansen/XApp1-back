import { app } from "./AppGlobal"
console.log("App:", app)
// var log = app.logger.createNamedLogger("ObjDB")
import { patch } from "./common/util"
import fs from "fs"
import { AriClientServer } from "./AriClientServer"

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

	clientConnected(client: AriClientServer){
		this.clients[client.clientId] = client
	}

	clientDisconnected(client: AriClientServer){
		delete this.clients[client.clientId]
	}

	set(path: string, value: any) {
		console.log("ObjDB.set:", path, value)

		// Insert into object model
		let pathArray = path.split(".")
		if (pathArray.length < 1) {
			console.log("Error: Missing path in call to objDB.set command.")
			return
		} else if (pathArray.length > 2) {
			// Insert value
			this.values[path] = value
		}
		let prop = pathArray.shift()
		// Patch object w. update
		// Create if not exists
		if (!(prop! in this.objects)) this.objects[prop!] = {}
		let obj = this.objects[prop!]
		while (obj && pathArray.length > 1) {
			prop = pathArray.shift()
			if (!(prop! in obj)) {
				obj[prop!] = {}
			} // else nop
			obj = obj[prop!]
		}
		prop = pathArray.shift()
		obj[prop!] = value

		// Notify path subscribers
		if (path in this.subs) {
			console.log("NotifySub:", path, value)
			let cbs = this.subs[path]
			if (cbs) cbs.forEach((sub) => sub(value, path))
		}
	}

	sub(path: string, cb: (value: any, name: string) => void) {
		// Subscribe internally
		console.log("sub", path)
		if (!(path in this.subs)) this.subs[path] = []
		this.subs[path]!.push(cb)
		// Send initial state
		if (path in this.objects) cb(path, this.objects[path])
		else if (path in this.values) cb(path, this.values[path])
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
