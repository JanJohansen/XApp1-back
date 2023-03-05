import { IFlowNodeTypeInfo } from "../../../../../../common/flowTypes"
import { ModelInstance, IFlowNode } from "../../../../FlowCore"

export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeType: "DevExampleNode",
	nodeGroup: "DEV",
	description: "This is an example note for development.",
	ins: { 
		WantIn: { description: "Input.", vType: "boolean", trueString: "YES!", falseString: "meh" }, 
		AnswerToAll: { description: "Input.", vType: "number"}, 
		URL: { description: "Input.", vType: "string"}, 
		Feeling: { description: "Input.", vType: "enum", options: ["Yay!", "meh.", "Amazing!"]},
		ConfigObject: { description: "Input.", vType: "object"} 
	},
	outs: { 
		out1: { description: "Output.", vType: "object"  },
		out2: { description: "Output.", vType: "boolean"  } 
	}
}

export class NodeImplementation extends ModelInstance {
	async setup() {
		this.on("ins.in.v", (v) => {
			this.set("outs.out.v", v)
		})
	}
} 
