import { IFlowNodeTypeInfo, ModelInstance } from "../../../flowTypes"
 
export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeTypeId: "dk.johansenweb.jsonvalue",
	nodeTypeName: "JSON-Value",
	nodeGroup: "IO",
	nodeUiTypeId: "jsonvalue",
	author: "Jan Johansen",
	version: "0.0.0",
	description: "This is an example note for development.",
	ins: {
		in: {description: "Data sent to this input is passed directly to the output.", vType: "object", default: {}}
	},
	outs: {
		out: { description: "Sendign data from input - or when data is entered on UI.", vType: "any" },
	}
}

export class NodeImplementation extends ModelInstance {
	async setup() {
		console.log("**** YAY **** - Craeted jsonvalue node!")
		this.on("ins.in", async (v) => {
			this.set("outs.out", v)
		})
	}
} 
 