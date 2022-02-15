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

* Acronym?
Distributed
Application 
Framework

Whiteboard
Deployment
Architecture
Blackboard

System
Model
Object
Extended
Extension

Protocol
Name:
DiAF

DBAEF

DOMAF

*/

let log = console.log //()=>{} //console.log

let storeValuesForNonValueItems = true

let globalInstance: BB
export const getGlobalBB = () => {
	if (!globalInstance) globalInstance = new BB()
	return globalInstance
}
export class BB {
	items: { [name: string]: { type: string; value?: any; subs?: [(val: any, name: string) => void]; source?: any } } = {}
	oIndex: { [name: string]: {} } = {}
	vIndex: { [name: string]: {} } = {}

	constructor() {}

	// Values
	pub(name: string, value: any) {
		if (!(name in this.items)) this.items[name] = { type: "value" }
		let item = this.items[name]

		// Store value
		// FIXME: patch instead!
		item.value = value

		// Notify subs
		if (item.subs) {
			item.subs.forEach((cb) => {
				cb(value, name)
			})
		}
 
		// Update indexes
		this.updateIndex(name)
	}
	sub(name: string, cb: (val: any, name: string) => void) {
		if (!(name in this.items)) this.items[name] = { type: "value", value: undefined }
		let item = this.items[name]
		if (!item.subs) item.subs = [cb]
		else item.subs.push(cb)
		// Initial cb
		if (item.value != undefined) cb(item.value, name)

		// Update indexes
		this.updateIndex(name)
	}
	// Await (or get directly) a value from the BB.
	// E.g. bb.get("services.dbService")
	async get(name: string): Promise<any> {}

	// events
	emit(name: string, value: any) {
		log("BB.emit", name, "=", value)
		if (!(name in this.items)) this.items[name] = { type: "event" }
		let item = this.items[name]

		if (storeValuesForNonValueItems) item.value = value

		// Update indexes
		this.updateIndex(name)

		// Notify subs
		if (item.subs) {
			item.subs.forEach((cb) => {
				cb(value, name)
			})
		}
	}
	on(name: string, cb: (val: any, name: string) => void) {
		log("BB.on", name)
		if (!(name in this.items)) this.items[name] = { type: "event" }
		let item = this.items[name]
		if (!item.subs) item.subs = [cb]
		else item.subs.push(cb)

		// Update indexes
		this.updateIndex(name)

		if (storeValuesForNonValueItems) {
			// Initial cb
			if (item.value != undefined) cb(item.value, name)
		}
	}

	updateIndex(name: string) {
		// Update indexes
		if (name.indexOf(".") <= 1) {
			// Object index
			if (!(name in this.oIndex)) {
				this.oIndex[name] = {}
				this.pub("oIndex", this.oIndex)
			}
		} else {
			// Value index
			if (!(name in this.vIndex)) {
				console.log("vIndex: NEW NAME", name)
				this.vIndex[name] = {}
				this.pub("vIndex", this.vIndex)
			}
		}
	}

	// calls
	async call(name: string, args: any): Promise<any> {
		log("BB.call", name, args)

		if (!(name in this.items)) this.items[name] = { type: "event" }
		let item = this.items[name]

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
		this.updateIndex(name)
	}
	async exec(name: string, cb: (args: any, name: string) => Promise<any>) {
		log("BB.exec", name)
		if (!(name in this.items)) this.items[name] = { type: "call" }
		let item = this.items[name]
		if (!item.subs) item.subs = [cb]
		else item.subs.push(cb)
		// Update indexes
		this.updateIndex(name)
	}

	exists(name: string) {
		log("BB.exists", name)
		if (name in this.items) return true
		else return false
	}

	// stream
	// write(name: string): WritableStream {
	// 	return new WritableStream()
	// }
	// read(name: string): ReadableStream {
	// 	return new ReadableStream()
	// }

	// IO ?? - Maybe allow for access restriction?
	// SetIn(name: string, value: any) {}
	// onIn(name: string, cb: (val: any, name: string) => void) {}
	// SetOut(name: string, value: any) {}
	// onOut(name: string, cb: (val: any, name: string) => void) {}
}
