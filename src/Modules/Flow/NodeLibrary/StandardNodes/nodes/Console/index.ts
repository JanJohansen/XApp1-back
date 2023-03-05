import { IFlowNodeTypeInfo } from './../../../../../../common/flowTypes';
import { ModelInstance, IFlowNode } from "../../../../FlowCore"

export const NodeTypeInfo: IFlowNodeTypeInfo = {
    type: ["FlowNodeType"],
    nodeType: "Console",
    nodeGroup: "IO", 
    description: "This is a Console node.",
    ins: { in: { description: "Input to be sent to console." } }
}

export class NodeImplementation extends ModelInstance {
	async setup() {
        this.log.developer("Console node setting up - YAY! :)")
		this.on("ins.in.v", (v) => {
			console.log(v)
		})
	}
}