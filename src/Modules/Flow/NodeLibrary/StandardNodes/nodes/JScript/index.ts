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
		let f: Function = () => { 
			console.log("Error in function definition!")
		}

		this.on("ins.code", (code) => {
			console.log("Script updated.", self.nodeId)
			try {
				f = new Function("on", "set", "setType", code).bind(self)
			} catch (e) {
				console.log("Error in function definition!", e)
			}
			execute()
		})

		// this.on("ins.in1", (v) => {
		// 	execute()
		// })

		function execute() {
			// let f = Function(`'use strict'; return (${v})`)()
			const on = (ioName: string, cb: (value: any)){
				console.log("on", ioName)
				cb(42)
			} 
			const set = (ioName: string, value: any){
				console.log("set", ioName, value)
			}
 
			try {
				f(self.on.bind(self), self.set.bind(self), self. setType.bind(self))
			} catch (e) {
				console.log("Error in function during execution!", e)
			} 
		}
	}
} 
