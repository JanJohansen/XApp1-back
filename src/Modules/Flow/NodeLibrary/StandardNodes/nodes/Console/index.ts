import { IFlowNodeTypeInfo, ModelInstance } from "../../../flowTypes"

export const NodeTypeInfo: IFlowNodeTypeInfo = {
    type: ["FlowNodeType"],
    nodeTypeId: "dk.johansenweb.console",
	nodeTypeName: "Console",
	nodeGroup: "IO",
    description: "This is a Console node.",
    ins: { in: { vType: "any", description: "Input to be sent to console." } }
}

export class NodeImplementation extends ModelInstance {
	async setup() {
        this.log.developer("Console node setting up - YAY! :)")
		this.on("ins.in", (v) => {
			console.log(v)
		})
	}
	
	// TODO: takeDown
	async takeDown(){

	}
}