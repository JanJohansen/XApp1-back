import { patch, generateUid } from "./common/util"
// import  crypto from "crypto"
const crypto = require("crypto")
var fs = require("fs")

let log = console.log //()=>{} //console.log

let storeValuesForNonValueItems = true

let globalInstance: BB
export const getGlobalBB = () => {
	if (!globalInstance) globalInstance = new BB()
	return globalInstance
}

export class BB {
	bbObjects: {
		[objectId: string]: { value?: any; subs?: [(val: any, name: string) => void]; source?: any }
	} = {}
	objectIndexes: { [indexPropertyName: string]: { [objectId: string]: {} } } = {}
	bbValues: {
		[valueId: string]: { value?: any; subs?: [(val: any, name: string) => void]; source?: any }
	} = {}
	calls: { [callId: string]: { handler?: (args: any, name: string) => any } } = {}
	events: { [eventId: string]: { subs?: [(val: any, name: string) => void]; source?: any } } = {}	

	constructor() {
		console.log("BB Initializing...")
		// Load stored BB...
		const bbFilePath = process.env.bbFilePath || "./"
		if (fs.existsSync(bbFilePath + "bbObjects.json")) {
			console.log("Loding BB state...")
			let state: any = JSON.parse(fs.readFileSync(bbFilePath + "bbObjects.json", "utf8"))
			for (const oid in state) {
				this.oPub(oid, state[oid])
			}
		}

		// Save BB on exit.
		// NOTE: Running "npm run dev:run will "eat" SIGINT signals and the process be killed directly - without saving BB to file!!!
		//		 run nodemon with "--signal SIGINT ..." instead
		const exitSignals = ["exit", "SIGINT", "SIGUSR1", "SIGUSR2", "SIGTERM", "SIGHUP", "SIGQUIT"]
		exitSignals.forEach((eventType) => { 
			process.on(eventType, () => {
				console.log("******************** Stop event received:", eventType)
				if (eventType != "exit") process.exit()
				else {
					console.log("Persisting persist-marked states...")
					let state: any = {}
					for (const oid in this.bbObjects) {
						// Only persist objects with persist=true set!
						if (this.bbObjects[oid]?.value?.persist == true) state[oid] = this.bbObjects[oid].value
					}
					fs.writeFileSync(bbFilePath + "bbObjects.json", JSON.stringify(state, null, 4))
					// process.kill(process.pid, eventType);
				}
			})
		})
	}

	// ************************************************************************
	// Objects
	oPub(oId: string, value: object, options: { setIfSame: boolean } = { setIfSame: true }) {
		if (oId == "") {
			oId = generateUid()
		}
		// Find bb item.
		let newOId: any = null
		if (!(oId in this.bbObjects)) {
			this.bbObjects[oId] = {}
			newOId = {}
			newOId[oId] = {}
		}
		let item = this.bbObjects[oId]
		if (!item.value) item.value = {}

		// Store value
		const patched = patch(value, item.value, { setIfSame: options.setIfSame })
		if (patched || options.setIfSame) {
			// Notify subs
			if (item.subs) {
				item.subs.forEach((cb) => {
					cb(value, oId)
				})
			}
		} //else {console.log("onPubChange: Skipping update as no diff!", value, item.value, patched)}

		// Update indexes
		this.updateIndexes(oId, value)

		if (newOId != null) this.oPub("oIndex", newOId)
	}
	oPubOnChange(name: string, value: any) {
		//console.log("onPubChange", name, " =", value)
		this.oPub(name, value, { setIfSame: false })
	}
	oSub(name: string, cb: (val: any, name: string) => void) {
		console.log("BB.oSub:", name)
		// Is it an Index Request
		if (name.startsWith("idx:")) {
			let idxProperty = name.slice(4)
			if (!idxProperty) {
				console.log("ERROR in request for index without name!")
				return null
			}
			console.log("INDEX RQUEST:", idxProperty)
			this.createIndexIfNotExists(idxProperty)
		}
 
		// Create item.
		if (!(name in this.bbObjects)) {
			this.bbObjects[name] = { value: undefined }
			let eObj: any = {}
			eObj[name] = {}
			this.oPub("oIndex", eObj)
		}
		let item = this.bbObjects[name]
		if (!item.subs) item.subs = [cb] // If no callback yet, create first.
		else item.subs.push(cb) // Add callback

		// Initial cb
		if (item.value != undefined) cb(item.value, name)

		return { name, cb }
	}
	oUnsub(unsubToken: { name: string; cb: (val: any, name: string) => void }) {
		const bbObject = this.bbObjects[unsubToken.name]
		const subs = bbObject.subs!
		if (subs) {
			const index = subs.indexOf(unsubToken.cb)
			if (index) subs.splice(index, 1) // Remoce this sibscription.
		}
	}

	oExists(name: string) {
		log("BB.exists", name)
		if (name in this.bbObjects) return true
		else return false
	}

	getObjectProxy(oid: string) {
		class objProxy {
			// onUpdate(cb:
		}
		return new objProxy()
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
				//console.log("Checking oid:", oid, "of", bbOIds)
				let upd: any = {}
				upd[oid] = {}
				let bbItem = this.bbObjects[oid]
				if (bbItem.value) {
					let idxVal: string | number | [] | undefined = bbItem.value[idxProp]
					if (idxVal == undefined) {
						// ALso asign "idx:<idxProp>=undefined"
						this.oPubOnChange("idx:" + idxProp + "=undefined", upd)
						// "Update index property root to show value index names.""
						let vUpd: any = {}
						vUpd["undefined"] = {}
						this.oPubOnChange("idx:" + idxProp, vUpd)
					} else {
						if (Array.isArray(idxVal)) {
							let propValArray = idxVal as Array<any>
							propValArray.forEach((val) => {
								console.log("[]idx", val)
								this.oPubOnChange("idx:" + idxProp + "=" + val, upd)
								// "Update index property root to show value index names.""
								let vUpd: any = {}
								vUpd[val] = {}
								this.oPubOnChange("idx:" + idxProp, vUpd)
							})
						} else {
							this.oPubOnChange("idx:" + idxProp + "=" + idxVal, upd)
							// "Update index property root to show value index names.""
							let vUpd: any = {}
							vUpd[idxVal] = {}
							this.oPubOnChange("idx:" + idxProp, vUpd)
						}
					}
				} // else value still undefined. (Could happen if bb item only subscribed to before publish!)
			})
		} else {
			// existing index - no action.
		}
		// console.log("**************** Index created:", idxProp, this.bbObjects)
	}

	// Update indexes for one object update
	private updateIndexes(oid: string, val: any) {
		// Cycle through indexes to see if updates are needed.
		if (typeof val != "object") return
		for (let idxProp in this.objectIndexes) {
			if (val[idxProp]) {
				// ValueObject has indexed property
				let upd: any = {}
				upd[oid] = {}
				let idxPropVal = val[idxProp]
				if (idxPropVal != undefined) {
					if (Array.isArray(idxPropVal)) {
						let propValArray = idxPropVal as Array<any>
						propValArray.forEach((val) => {
							this.oPubOnChange("idx:" + idxProp + "=" + val, upd)
							// "Update index property root to show value index names.""
							let iUpd: any = {}
							iUpd[val] = {}
							this.oPubOnChange("idx:" + idxProp, iUpd)
							console.log("Indexed:", oid, "as", val)
						})
					} else {
						this.oPubOnChange("idx:" + idxProp + "=" + idxPropVal, upd)
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
		// console.log("vPub", valueId, value)
		if (!(valueId in this.bbValues)) {
			this.bbValues[valueId] = {}
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
		if (typeof valueId != "string") {
			console.log("ERROR in 'sub' request. name is not a string!", valueId)
			return
		}

		// Create item.
		if (!(valueId in this.bbValues)) {
			this.bbValues[valueId] = { value: undefined }
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
		if (!(name in this.bbObjects)) this.bbObjects[name] = {}
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
		if (!(name in this.bbObjects)) this.bbObjects[name] = {}
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
		if (!(name in this.bbObjects)) this.bbObjects[name] = {}
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
