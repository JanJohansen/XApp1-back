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

import { patch, generateBase64Uuid } from "./common/util"
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
	bbObjects: { [objectId: string]: { type: string; value?: any; subs?: [(val: any, name: string) => void]; source?: any } } = {}
	bbValues: { [valueId: string]: { type: string; value?: any; subs?: [(val: any, name: string) => void]; source?: any } } = {}
	objectIndexes: { [indexPropertyName: string]: {} } = {}

	constructor() {}

	// ************************************************************************
	// Objects
	oPub(oId: string, value: object, options: { setIfSame: boolean } = { setIfSame: true }) {
		if(oId == ""){
			oId = generateBase64Uuid()
		}
		// Find bb item.
		let newOId: any = null
		if (!(oId in this.bbObjects)) {
			this.bbObjects[oId] = { type: "value" }
			newOId = {}
			newOId[oId] = {}
		}
		let item = this.bbObjects[oId]
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

		if (newOId != null) this.oPub("oIndex", newOId)
	}
	oPubOnChange(name: string, value: any) {
		this.oPub(name, value, {setIfSame: false})
	}
	oSub(name: string, cb: (val: any, name: string) => void) {
		console.log("BB.oSub:", name)
		if(typeof(name) != "string") {
			console.log("ERROR in 'sub' request. name is not a string!", name)
			return
		}
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
		if (!(name in this.bbObjects)) {
			this.bbObjects[name] = { type: "value", value: undefined }
			let eObj: any = {}
			eObj[name] = {}
			this.oPub("oIndex", eObj)
		}
		let item = this.bbObjects[name]
		if (!item.subs) item.subs = [cb] // If no callback yet, create first.
		else item.subs.push(cb) // Add callback

		// Initial cb
		if (item.value != undefined) cb(item.value, name)
	}

	oExists(name: string) {
		log("BB.exists", name)
		if (name in this.bbObjects) return true
		else return false
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
		if (!this.objectIndexes[idxProp]) {
			// Index doesn't exist yet.
			this.objectIndexes[idxProp] = {}

			// CREATE index by iterting over all known objects.

			console.log("Creating index:", idxProp)
			let bbOIds = Object.keys(this.bbObjects) // We might modify bbItems during iteration, so make copy!
			// for (let oid in bbItemKeys) {
			bbOIds.forEach((oid) => {
				console.log("Checking oid:", oid, "of", bbOIds)
				let upd: any = {}
				upd[oid] = {}
				let bbItem = this.bbObjects[oid]
				if (bbItem.value) {
					let idxVal: string | number | [] | undefined = bbItem.value[idxProp]
					if (Array.isArray(idxVal)) {
						let propValArray = idxVal as Array<any>
						propValArray.forEach((val) => {
							this.oPubOnChange("idx:" + idxProp + "=" + val, upd)
							// "Update index property root to show value index names.""
							let vUpd: any = {}
							vUpd[val] = {}
							this.oPubOnChange("idx:" + idxProp, vUpd)
						})
					} else {
						if (idxVal != undefined) {
							this.oPub("idx:" + idxProp + "=" + idxVal, upd)
							// "Update index property root to show value index names.""
							let vUpd: any = {}
							vUpd[idxVal] = {}
							this.oPubOnChange("idx:" + idxProp, vUpd)
						} else {
							// ALso asign "idx:<idxProp>=undefined"
							this.oPub("idx:" + idxProp + "=undefined", upd)
							// "Update index property root to show value index names.""
							let vUpd: any = {}
							vUpd["undefined"] = {}
							this.oPubOnChange("idx:" + idxProp, vUpd)
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
		for (let idxProp in this.objectIndexes) {
			if (val[idxProp]) {
				// VlueObject has indexed property
				let upd: any = {}
				upd[oid] = {}
				let idxPropVal = val[idxProp]
				if (idxPropVal != undefined) {
					if (Array.isArray(idxPropVal)) {
						let propValArray = idxPropVal as Array<any>
						propValArray.forEach((val) => {
							this.oPub("idx:" + idxProp + "=" + val, upd)
							// "Update index property root to show value index names.""
							let iUpd: any = {}
							iUpd[val] = {}
							this.oPubOnChange("idx:" + idxProp, iUpd)
							console.log("Indexed:", oid, "as", val)
						})
					} else {
						this.oPub("idx:" + idxPropVal, upd)
						// "Update index property root to show value index names.""
						let iUpd: any = {}
						iUpd[idxPropVal] = {}
						this.oPubOnChange("idx:" + idxProp, iUpd)
					}
				}
			}
		}
	}

	// ************************************************************************
	// Values
	vPub(valueId: string, value: any, options: { setIfSame: boolean } = { setIfSame: true }) {
		console.log("vPub", valueId, value)
		if (!(valueId in this.bbValues)) {
			this.bbValues[valueId] = { type: "value" }
			// update vIndex
			let upd: any = {}
			upd[valueId] = {}
			this.oPub("vIndex", upd)
		}
		let item = this.bbValues[valueId]

		// Store value
		// patch(value, item.value, { setIfSame: options.setIfSame })
		item.value = value

		// Notify subs
		if (item.subs) {
			item.subs.forEach((cb) => {
				cb(value, valueId)
			})
		}
	}
	// vPubOnChange(name: string, value: any) {
	// 	this.oPub(name, value, {setIfSame: false})
	// }
	vSub(valueId: string, cb: (val: any, name: string) => void) {
		console.log("BB.vSub:", valueId)
		if(typeof(valueId) != "string") {
			console.log("ERROR in 'sub' request. name is not a string!", valueId)
			return
		}

		// Create item.
		if (!(valueId in this.bbValues)) {
			this.bbValues[valueId] = { type: "value", value: undefined }
			let upd: any = {}
			upd[valueId] = {}
			this.oPub("vIndex", upd)
		}
		let item = this.bbValues[valueId]
		if (!item.subs) item.subs = [cb] // If no callback yet, create first.
		else item.subs.push(cb) // Add callback

		// Initial cb
		// if (item.value != undefined) 
		cb(item.value, valueId)
	}

	vExists(name: string) {
		log("BB.vExists", name)
		if (name in this.bbValues) return true
		else return false
	}

	// ************************************************************************
	// calls
	async call(name: string, args: any): Promise<any> {
		log("BB.call", name, args)

		if (!(name in this.bbObjects)) this.bbObjects[name] = { type: "event" }
		let item = this.bbObjects[name]

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
	async onCall(name: string, cb: (args: any, name: string) => Promise<any>) {
		log("BB.exec", name)
		if (!(name in this.bbObjects)) this.bbObjects[name] = { type: "call" }
		let item = this.bbObjects[name]
		if (!item.subs) item.subs = [cb]
		else item.subs.push(cb)
		// Update indexes
		this.updateIndexes(name, undefined)
	}


	// ************************************************************************
	// Events
	emit(name: string, value: any) {
		log("BB.emit", name, "=", value)
		if (!(name in this.bbObjects)) this.bbObjects[name] = { type: "event" }
		let item = this.bbObjects[name]

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
	onEvent(name: string, cb: (val: any, name: string) => void) {
		// log("BB.on", name)
		if (!(name in this.bbObjects)) this.bbObjects[name] = { type: "event" }
		let item = this.bbObjects[name]
		if (!item.subs) item.subs = [cb]
		else item.subs.push(cb)

		// Update indexes
		this.updateIndexes(name, undefined)

		if (storeValuesForNonValueItems) {
			// Initial cb
			if (item.value != undefined) cb(item.value, name)
		}
	}
}
