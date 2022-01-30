import { app } from "../../AppGlobal"
var log = app.logger.createNamedLogger("FlowCore")
let db = app.db

import { IFlowNode, IValue } from "../../common/flowTypes"
// import { patch } from "../../common/util"
// import ObjDB from "../../ObjDB"

export default class FlowCore {
	flowNodes: { [id: string]: ModelInstance } = {}
	modelFactory: ModelInstanceFactory
	constructor() {
		log.debug("Starting Flow Core!")
		this.modelFactory = new ModelInstanceFactory()
		// TODO: Load + register ModelInstance classes

		this.ensureOneFlow()

		// Load FlowNodes + create local instances
		db.sub("type", "FlowNode", (update: any) => {
			for (let id in update) {
				let updObj: any = update[id]
				if (updObj == null) {
					// Object to be deleted
					this.flowNodes[id].close()
				} else {
					if (updObj._id) {
						let newNode = undefined
						if (!(updObj._id in this.flowNodes)) {
							// New object to be created
							if ("nodeType" in updObj) {
								newNode = this.modelFactory.createNode(updObj.nodeType)
								this.flowNodes[updObj._id] = newNode
								newNode.__onUpd = this.sendUpd // override __onUpd to use own method to send updates!
								newNode.setup()
								log.developer("Created flowNode:", newNode)
							} else {
								log.debug("ERROR: Trying to create unknown node type:", updObj.nodeType)
							}
						}
						// Object exists
						this.flowNodes[updObj._id].handleUpd(updObj)
						if (newNode) this.sendUpd(newNode.model)
					}
				}
			}
			// log.developer("FlowNodes:", JSON.stringify(this.flowNodes, null, 2))
			// log.developer("FlowNodes:", this.flowNodes)
		})
	}
	// Called when we want to update a model on the DB
	sendUpd(obj: any) {
		db.upsert(obj)
	}
	ensureOneFlow() {
		let flows = db.get("type", "Flow")
		// Ensure at least one flow!
		if (Object.keys(flows).length < 1) {
			let newFlow = db.upsert({
				type: "Flow",
				ins: {},
				outs: {},
				nodes: {},
				connections: {}
			})
			let flowObjects = db.get("type", "Flow")
		}
	}
}

class ModelInstanceFactory {
	types: { [typeName: string]: () => ModelInstance } = {}
	constructor() {}
	registerType(name: string) {}
	createNode(type: string): ModelInstance {
		log.developer("Creating ModelInstance:", type)
		if (type == "JSFunction") return new JSFunction()
		else if (type == "Ticker") return new Ticker()
		else if (type == "Console") return new Console()
		else return new ModelInstance()
	}
}

// SCRATCHPAD -----------------------------------------------------------------
// let model = {
// 	nodeType: "Ticker",
// 	ins: {
// 		interval: { v: 1000 }
// 	},
// 	outs: {
// 		tick: { v: 42 }
// 	}
// }
// let upd = {
// 	ins: {
// 		interval: { v: 500 }
// 	}
// }
//-----------------------------------------------------------------------------
class ModelInstance {
	model: any = {}
	__listeners: { [path: string]: (value: any, path: string) => void } = {}
	// constructor() {
	// 	// Sets up the default model
	// 	this.setup().then(() => {
	// 		// TODO: Then override model defaults
	// 		log.developer("Override now?")
	// 	})
	// }
	async setup() {}
	async close() {}
	__onUpd(obj: any): void {} // To be overwritten to send update notificatiojn to DB!
	handleUpd(obj: any, target: any = this.model, path: string = "") {
		// log.developer("ModelInstance handleUpd:", obj)
		for (let prop in obj) {
			if (typeof obj[prop] == "object") {
				if (!(prop in obj)) obj[prop] = {} // Create if not exist
				path = path + prop + "."
				// TODO: Delete if null?
				// TODO: Notify if deleted?
				this.handleUpd(obj[prop], target[prop], path) // Recursive update
			} else {
				target[prop] = obj[prop]
				let valPath = path + prop
				// log.developer("ModelInstance updated path:", valPath)
				// Notify listeners of update
				if (valPath in this.__listeners) this.__listeners[valPath](obj[prop], valPath)
			}
		}
	}
	on(path: string, cb: (value: any, path: string) => void): void {
		this.__listeners[path] = cb
	}
	set(path: string, value: any): void {
		let p = path.split(".")
		let obj = this.model
		let updObj: any = { _id: this.model._id }
		let upd = updObj
		for (let i = 0; i < p.length - 1; i++) {
			if (!(p[i] in obj)) obj[p[i]] = {} // Create path - or error?
			updObj[p[i]] = {}
			updObj = updObj[p[i]]
			obj = obj[p[i]]
		}
		obj[p[p.length - 1]] = value
		updObj[p[p.length - 1]] = value

		// Notify of update
		this.__onUpd(upd)
	}
	onAny(cb: (value: any, path: string) => void): void {}
	onAll(paths: string[], cb: (value: any, path: string) => void): void {}
}
//-----------------------------------------------------------------------------
class Console extends ModelInstance {
	static Model = {
		nodeType: "Console",
		description: "This is a Console node.",
		ins: { in: { description: "Input to be sent to console." } }
	}
	async setup() {
		this.model = Console.Model
		this.on("ins.in.v", (v) => {
			console.log(v)
		})
	}
}
//-----------------------------------------------------------------------------
class Ticker extends ModelInstance {
	static Model = {
		nodeType: "Ticker",
		description: "This is a Ticker node.",
		ins: { interval: { description: "Interval in milliseconds between output increments." } },
		outs: { out: { description: "Tick output.", v: 0 } }
	}
	__timerInstance: any = -1
	async setup() {
		log.developer("Ticker setting up - YAY! :)")
		this.model = Ticker.Model
		this.on("ins.interval.v", (v) => {
			if (this.__timerInstance) clearInterval(this.__timerInstance)
			this.__timerInstance = setInterval(() => {
				// log.developer("Tick...")
				this.set("outs.out.v", this.model.outs.out.v + 1)
			}, v)
		})
	}
}

//-----------------------------------------------------------------------------
class JSFunction extends ModelInstance {
	static Model = {
		nodeType: "JSFunction",
		description: "Programmable function node written in Java Script.",
		ins: {
			_script: { v: 'console.log("Hey from JSFunction node.")', description: "Java Script configuring the node." }
		}
	}
	async setup() {
		log.developer("JSFunction instantiating - YAY :)")
		this.model = JSFunction.Model
		this.on("ins.script.v", (v) => {
			// let f = Function(`'use strict'; return (${v})`)()
			let f: any = Function("'use strict'; return " + v)
			f.setup()
		})
	}
}

//-----------------------------------------------------------------------------
class Connection {
	// Listen to output: sub("NopNodeID_28376428374.outs.out.v")
	// NopNodeID_28376428374.$model
	// NopNodeID_28376428374.ins.in.v
	// NopNodeID_28376428374.outs.out.v
}
