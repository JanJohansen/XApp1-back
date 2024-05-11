import { IFlowNodeTypeInfo } from './../../../../../../common/flowTypes';
import { ModelInstance, IFlowNode } from "../../../../FlowCore"

export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeTypeId: "dk.johansenweb.ticker",
	nodeTypeName: "Ticker",
	nodeGroup: "Time",
	description: "This is a Ticker node.",
	ins: { interval: { vType: "number", description: "Interval in milliseconds between output increments.", default: 1000, unit:"mSec" } },
	outs: { out: { vType: "number", description: "Tick output." } }
}

export class NodeImplementation extends ModelInstance {
	async setup() {
		this.log.developer("Ticker setting up - YAY! :)")
		let __timerInstance: any = null
		let count = 0
		this.on("ins.interval", (v) => {
			if (__timerInstance) clearInterval(__timerInstance)
			__timerInstance = setInterval(() => {
				this.log.developer("Tick...")
				this.set("outs.out", count++)
			}, v)
		})
	}
}
