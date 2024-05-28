import { IFlowNodeTypeInfo } from "../../../../../../common/flowTypes"
import { ModelInstance, IFlowNode } from "../../../../FlowCore"
 
export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeTypeId: "dk.johansenweb.range",
	nodeTypeName: "Range",
	nodeGroup: "IO",
	nodeUiTypeId: "range",
	author: "Jan Johansen",
	version: "0.0.0",
	description: "This is an example note for development.",
	ins: {
		in: {description: "Data sent to this input is passed directly to the output.", vType: "number"}
	},
	outs: {
		out: { description: "Output sending a timestamp when button is pressed.", vType: "number" },
	}
}

export class NodeImplementation extends ModelInstance {
	async setup() {
		console.log("**** YAY **** - Craeted Range node!")
		
		this.on("ins.in", async (v) => {
			this.set("outs.out1", v)
		})
	}
} 
 