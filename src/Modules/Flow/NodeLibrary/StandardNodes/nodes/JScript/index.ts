import { IFlowNodeTypeInfo, ModelInstance } from "../../../flowTypes"

export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeTypeId: "dk.johansenweb.js_script",
	nodeTypeName: "JSFunction",
	nodeGroup: "Scripting",
	description: "Programmable function node written in Java Script.",
	ins: {
		code: {
			vType: "string",
			default: 'console.log("Hey from JSFunction node.")',
			description: "Java Script configuring the node."
		}
	}
}

export class NodeImplementation extends ModelInstance {
	async setup() {
		this.log.developer("JSFunction instantiating - YAY :)")
		const self = this
		let f: Function = () => {}

		this.on("ins.code", (code) => {
			console.log("Script updated.", self.nodeId)
			// Define setup function
			try { 
				f = new Function("setType", "setup", "on", "set", "log", "cleanup", code)
			} catch (e) {
				console.log("Error in function definition!", e)
			}

			// Run setup function (E.g. instantiate functionality!)

			const setup = (cb: ()=>Promise<void>)=>{
				this.setup = cb				
			}

			try {
				f(self.setType.bind(self), setup.bind(self), self.on.bind(self), self.set.bind(self), console.log, self.cleanup.bind(self))
			} catch (e) {
				console.log("Error in function during execution!", e)
			}
		}
	} 
}


type TNode = {
	/** type name of the node. (Use dk.johansenweb.name thing to name the type to avoid naming conflicts.) */
	typeId: string
	/** Description of the node. */
	description?: string
	ins: {
		define: (inputName: string, options: { description?: string }) => void
		on: (inputName: string, callback: (value: any) => void)
	}
	outs: {
		define: (inputName: string, options: { description?: string }) => void
		set: (inputName: string, value: any) => void
	}
	log: (...args: any) => void
}
const node: TNode = {
	ins: {
		define: (inputName: string, options: { description?: string }) => { },
		on: (inputName: string, callback: (value: any) => void) => { }
	},
	outs: {
		define: (inputName: string, options: { description?: string }) => { },
		set: (inputName: string, value: any) => { }
	},
	log: (...args: any) => { },
}

/**
 * Lifecycle hook, called to define node before it is created. 
 * Use this function to subscribe to node events, and define actions based on these events.
 * @param setupFunction - function called to intialize node functionality.
 */
function setup(cb: () => void) { }
/**
 * Lifecycle hook, called when the node is taken down. 
 * Use this function to close connections, cancel timers, etc.
 * (No need to unsubscribe to node events.)
 * @param setupFunction - function called to take down node.
 */
function cleanup(cb: () => void) { }

// ----------------------------------------------------------------------------
node.description = "Test function node. (Debounce input example.)"
node.ins.define("in1", { description: "Input number 1" })
node.outs.define("out1", { description: "Output number 1" })

// Add files?
// vue front end nodes + dashboard UI's???

// Include and stuffs here???
import a from "./index"
class Helper { constructor() { } }
function doStuffs() { }

setup(async () => {
	let t: NodeJS.Timeout | null = null
	node.ins.on("in1", (val) => {
		node.log("VAL in:", val)
		if (t) clearTimeout(t)
		t = setTimeout(() => {
			node.outs.set("out1", val)
			node.log("VAL out:", val)
		}, 1000)
	})
	cleanup(() => {
		if (t) clearTimeout(t)
	})
})
// ----------------------------------------------------------------------------

function setType(typeDef: {
	name: string,
	description?: string,
	ins?: { [name: string]: { description?: string } },
	outs?: { [name: string]: { description?: string } }
}) { }

//-----
setType({
	name: "Debounce",
	nodeGroup: "IO",
	nodeTypeId: "dk.johansenweb.debouncer",
	description: "Test function node. (Debounce input example.)",
	ins: { in1: { description: "Input number 1" } },
	outs: { out1: { description: "Output number 1" } }
})

setup(async () => {
	let t: NodeJS.Timeout | null = null
	on("ins.in1", (val) => {
		log("VAL in:", val)
		if (t) clearTimeout(t)
		t = setTimeout(() => {
			set("outs.out1", val)
			log("VAL out:", val)
		}, 1000)
	})
	cleanup(() => {
		if (t) clearTimeout(t)
	})
})

/*****************************************************************************
Node defintiion parts:
	Type description
	Setup script incl all lifecycle hooks
	Node UI VUE component
	Dashboard UI VUE component
*/
// Examples:
	//Type description
	// 	{
	// 		name: "Debounce",
	// 		nodeGroup: "IO",
	// 		nodeTypeId: "dk.johansenweb.debouncer",
	// 		description: "Test function node. (Debounce input example.)",
	// 		ins: { in1: { description: "Input number 1" } },
	// 		outs: { out1: { description: "Output number 1" } }
	// 	}
	// // Setup script incl all lifecycle hooks
	// 	let t: NodeJS.Timeout | null = null
	// 	on("ins.in1", (val) => {
	// 		log("VAL in:", val)
	// 		if (t) clearTimeout(t)
	// 		t = setTimeout(() => {
	// 			set("outs.out1", val)
	// 			log("VAL out:", val)
	// 		}, 1000)
	// 	})
	// 	cleanup(() => {
	// 		if (t) clearTimeout(t)
	// 	})

	// // Node UI VUE component
	// <template></template><script></script><style></style>
	// // Dashboard UI VUE component
	// <template></template><script></script><style></style>
