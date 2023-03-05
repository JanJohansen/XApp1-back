/*

itemPath    type    subs            sourceOwner     data
------------------------------------------------------------
X           value   cb[]            clientId        {value:object|number|boolean|string}
Y           event   cb[]            clientId
Z           call    cb[]            clientId
X           stream  readableStream  clientId
X           input   cb[]            clientId
X           output  cb[]            clientId

For BBServer subs could be bbClientId[] to indicate which client has subscribed.

*/

//---------------------------------
// Ideas:
/*
let idxs = {
	"type": {},	// List of types indexes
}
*/
//---------------------------------

import { patch } from "./common/util"
// import  crypto from "crypto"
const crypto = require("crypto")

let log = console.log //()=>{} //console.log

let storeValuesForNonValueItems = true

let globalInstance: BB
export const getGlobalBB = () => {
	if (!globalInstance) globalInstance = new BB()
	return globalInstance
}
export class BB {
	bbItems: { [name: string]: { type: string; value?: any; subs?: [(val: any, name: string) => void]; source?: any } } = {}
	idxs: { [indexPropertyName: string]: {} } = {}

	constructor() {}

	// Values
	pub(oId: string, value: any, options: { setIfSame: boolean } = { setIfSame: true }) {
		if(oId == ""){
			oId = this.generateBase64Uuid()
		}
		// Find bb item.
		let newOId: any = null
		if (!(oId in this.bbItems)) {
			this.bbItems[oId] = { type: "value" }
			newOId = {}
			newOId[oId] = {}
		}
		let item = this.bbItems[oId]
		if (!item.value) item.value = {}

		// Store value
		patch(value, item.value, { setIfSame: options.setIfSame })

		// Notify subs
		if (item.subs) {
			item.subs.forEach((cb) => {
				cb(value, oId)
			})
		}

		// Update indexes
		this.updateIndexes(oId, value)

		if (newOId != null) this.pub("oIndex", newOId)
	}
	pubOnChange(name: string, value: any) {
		this.pub(name, value, {setIfSame: false})
	}
	sub(name: string, cb: (val: any, name: string) => void) {
		// Is it an Index Request
		if (name.startsWith("idx:")) {
			let idxProperty = name.slice(4)
			if (!idxProperty) {
				console.log("ERROR in request for index without name!")
				return
			}
			console.log("INDEX RQUEST:", idxProperty)
			this.createIndexIfNotExists(idxProperty)
		}

		// Create item.
		if (!(name in this.bbItems)) this.bbItems[name] = { type: "value", value: undefined }
		let item = this.bbItems[name]
		if (!item.subs) item.subs = [cb] // If no callback yet, create first.
		else item.subs.push(cb) // Add callback

		// Initial cb
		if (item.value != undefined) cb(item.value, name)

		// Update indexes
		// this.updateIndexes(name, undefined)
	}

	// Build new index by itterating over all objects in BB.
	private createIndexIfNotExists(idxProp: string) {
		// Check if index exists
		let eqPos = idxProp.indexOf("=")
		if (eqPos > 0) {
			// Its a prop=value index.
			// Just check if we have generated the prop index part as the value part will be created automatically!
			idxProp = idxProp.slice(0, eqPos)
			console.log("Creating index:", idxProp)
		}
		if (!this.idxs[idxProp]) {
			// Index doesn't exist yet.
			this.idxs[idxProp] = {}

			// CREATE index by iterting over all known objects.
			console.log("Creating index:", idxProp)
			let bbItemKeys = Object.keys(this.bbItems) // We might modify bbItems during iteration, so make copy!
			// for (let oid in bbItemKeys) {
			bbItemKeys.forEach((oid) => {
				console.log("Checking oid:", oid, "of", bbItemKeys)
				let upd: any = {}
				upd[oid] = {}
				let bbItem = this.bbItems[oid]
				if (bbItem.value) {
					let idxVal: string | number | [] = bbItem.value[idxProp]
					if (Array.isArray(idxVal)) {
						let propValArray = idxVal as Array<any>
						propValArray.forEach((val) => {
							this.pubOnChange("idx:" + idxProp + "=" + val, upd)
							// "Update index property root to show value index names.""
							let vUpd: any = {}
							vUpd[val] = {}
							this.pubOnChange("idx:" + idxProp, vUpd)
						})
					} else {
						if (idxVal != undefined) {
							this.pub("idx:" + idxProp + "=" + idxVal, upd)
							// "Update index property root to show value index names.""
							let vUpd: any = {}
							vUpd[idxVal] = {}
							this.pubOnChange("idx:" + idxProp, vUpd)
						}
					}
				} // else value still undefined. (Could happen if bb item only subscribed to before publish!)
			})
		} else {
			// existing index - no action.
		}
	}

	// Update indexes for one object update
	private updateIndexes(oid: string, val: any) {
		// Cycle through indexes to see if updates are needed.
		if (typeof val != "object") return
		for (let idxProp in this.idxs) {
			if (val[idxProp]) {
				// VlueObject has indexed property
				let upd: any = {}
				upd[oid] = {}
				let idxPropVal = val[idxProp]
				if (idxPropVal != undefined) {
					if (Array.isArray(idxPropVal)) {
						let propValArray = idxPropVal as Array<any>
						propValArray.forEach((val) => {
							this.pub("idx:" + idxProp + "=" + val, upd)
							// "Update index property root to show value index names.""
							let iUpd: any = {}
							iUpd[val] = {}
							this.pubOnChange("idx:" + idxProp, iUpd)
							console.log("Indexed:", oid, "as", val)
						})
					} else {
						this.pub("idx:" + idxPropVal, upd)
						// "Update index property root to show value index names.""
						let iUpd: any = {}
						iUpd[idxPropVal] = {}
						this.pubOnChange("idx:" + idxProp, iUpd)
					}
				}
			}
		}
	}

	// Build index - OLD approach!
	// If obj contains idx.room = "kitchen" ==> idx:room:kitchen = {objectName: {}}
	// If obj contains idx.room = ["kitchen", "bath"]
	//					==> idx:room:kitchen = {objectName: {}} AND
	//					==> idx:room:bath = {objectName: {}}
	// !! FIXME: Need pubOnChange keyword!
	// !! FIXME: Relies on patching instead ow overwriting!

	// calls
	async call(name: string, args: any): Promise<any> {
		log("BB.call", name, args)

		if (!(name in this.bbItems)) this.bbItems[name] = { type: "event" }
		let item = this.bbItems[name]

		if (storeValuesForNonValueItems) item.value = args

		// Execute calls and acumulate replies if more than one call registered
		if (item.subs) {
			let results: any[] = []
			item.subs.forEach((cb) => {
				results.push(cb(args, name))
			})
			if (item.subs.length > 1) return results
			else return results[0]
		}
		// Update indexes
		this.updateIndexes(name, undefined)
	}
	async exec(name: string, cb: (args: any, name: string) => Promise<any>) {
		log("BB.exec", name)
		if (!(name in this.bbItems)) this.bbItems[name] = { type: "call" }
		let item = this.bbItems[name]
		if (!item.subs) item.subs = [cb]
		else item.subs.push(cb)
		// Update indexes
		this.updateIndexes(name, undefined)
	}

	exists(name: string) {
		log("BB.exists", name)
		if (name in this.bbItems) return true
		else return false
	}

	// Await (or get directly) a value from the BB.
	// E.g. bb.get("services.dbService")
	async get(name: string): Promise<any> {}

	// events
	emit(name: string, value: any) {
		log("BB.emit", name, "=", value)
		if (!(name in this.bbItems)) this.bbItems[name] = { type: "event" }
		let item = this.bbItems[name]

		if (storeValuesForNonValueItems) item.value = value

		// Update indexes
		this.updateIndexes(name, value)

		// Notify subs
		if (item.subs) {
			item.subs.forEach((cb) => {
				cb(value, name)
			})
		}
	}
	on(name: string, cb: (val: any, name: string) => void) {
		// log("BB.on", name)
		if (!(name in this.bbItems)) this.bbItems[name] = { type: "event" }
		let item = this.bbItems[name]
		if (!item.subs) item.subs = [cb]
		else item.subs.push(cb)

		// Update indexes
		this.updateIndexes(name, undefined)

		if (storeValuesForNonValueItems) {
			// Initial cb
			if (item.value != undefined) cb(item.value, name)
		}
	}

	generateBase64Uuid(): string {
		const uuid = "~" + crypto.randomUUID()
		return uuid
		// const buffer = Buffer.from(uuid, 'utf8')
		// return buffer.toString('base64')
	}
}
