import { IFlowNodeTypeInfo } from "../../../../../../common/flowTypes"
import { ModelInstance, IFlowNode } from "../../../../FlowCore"
 
export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeTypeId: "dk.johansenweb.devExampleNode",
	nodeTypeName: "DevExampleNode",
	nodeGroup: "DEV",
	author: "Jan Johansen",
	version: "0.0.0",
	description: "This is an example note for development.",
	ins: {
		WantIn: { description: "Input.", vType: "boolean", trueString: "YES!", falseString: "meh", default: true },
		AnswerToAll: { description: "Input.", vType: "number", default: 42, min: 10, max: 50, unit: "mA", step: 1.5 },
		URL: { description: "Input.", vType: "string", default: "https://google.com" },
		Feeling: { description: "Input.", vType: "enum", default: "Yay!", options: ["Yay!", "meh.", "Amazing!"] },
		ConfigObject: { description: "Input.", vType: "object", default: {} }
	},
	outs: {
		out1: { description: "Output.", vType: "object" },
		out2: { description: "Output.", vType: "boolean", trueString:"Oy!", falseString:"Ney" }
	}
}

export class NodeImplementation extends ModelInstance {
	async setup() {
		console.log("**** YAY **** - Craeted DevExampleNode!")
		this.on("ins.WantIn", (v) => {
			this.set("outs.out1", v)
		})
	}
} 
 