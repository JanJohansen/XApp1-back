import { IFlowNodeTypeInfo, ModelInstance } from "../../../flowTypes"

export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeTypeId: "dk.johansenweb.button",
	nodeTypeName: "Button",
	nodeGroup: "IO",
	nodeUiTypeId: "button",
	author: "Jan Johansen",
	version: "0.0.0",
	description: "This is an example note for development.",
	outs: {
		out: { description: "Output sending a timestamp when button in flow UI is pressed.", vType: "any" },
	}
}

export class NodeImplementation extends ModelInstance {
	async setup() {
		console.log("**** YAY **** - Craeted Button node!")
		// Thereis no action on the back end in a button node.😀		
		// this.on("ins.in", async (v) => {
		// 	this.set("outs.out1", v)
		// })
	}
} 

export default class testClass{}
