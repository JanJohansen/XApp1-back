import { IFlowNodeTypeInfo, ModelInstance } from "../../../flowTypes"
 
export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeTypeId: "dk.johansenweb.httpGet",
	nodeTypeName: "httpGet",
	nodeGroup: "HTTP",
	nodeUiTypeId: "default",
	author: "Jan Johansen",
	version: "0.0.0",
	description: "This is an example note for development.",
	ins: {
		URL: { description: "URL to get via HTTP.", vType: "string", default: "https://google.com" },
		headers: { description: "Input.", vType: "object", default: {} },
		trigger: { description: "trigger HTTP GET command.", vType: "boolean", default: true },
	},
	outs: {
		result: { description: "Output.", vType: "string" },
		error: { description: "Error output.", vType: "string" },
	}
}

export class NodeImplementation extends ModelInstance {
	url: string = ""
	async setup() {
		console.log("**** YAY **** - Craeted httpGet node!")
		 
		this.on("ins.url", async (v) => {
			this.url = v
		})
 
		this.on("ins.trigger", async (v) => this.fetch())
	}
	async fetch(){ 
		let result = ""
		try{
			result = await (await fetch(this.url)).text()
			this.set("outs.out1", result)
		} catch (err) {
			this.set("outs.error", err)
		}
	}
} 
 