import { IFlowNodeTypeInfo } from './../../../../../../common/flowTypes';
import { ModelInstance, IFlowNode } from "../../../../FlowCore"

export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeType: "JSFunction",
	nodeGroup: "Scripting",
	description: "Programmable function node written in Java Script.",
	ins: {
		_script: { v: 'console.log("Hey from JSFunction node.")', description: "Java Script configuring the node." }
	}
}

class NodeImplementation extends ModelInstance {
	async setup() {
		this.log.developer("JSFunction instantiating - YAY :)")
		this.on("ins.script.v", (v) => {
			// let f = Function(`'use strict'; return (${v})`)()
			let f: any = Function("'use strict'; return " + v)
			f.setup()
		})
	}
}
