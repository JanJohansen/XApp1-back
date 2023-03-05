import { IFlowNodeTypeInfo } from './../../../../../../common/flowTypes';
import { ModelInstance, IFlowNode } from "../../../../FlowCore"

export const NodeTypeInfo: IFlowNodeTypeInfo = {
	type: ["FlowNodeType"],
	nodeType: "Ticker",
	nodeGroup: "Timer",
	description: "This is a Ticker node.",
	ins: { interval: { description: "Interval in milliseconds between output increments." } },
	outs: { out: { description: "Tick output.", v: 0 } }
}

export class NodeImplementation extends ModelInstance {
	async setup() {
		this.log.developer("Ticker setting up - YAY! :)")
		let __timerInstance: any = null
		this.on("ins.interval.v", (v) => {
			if (__timerInstance) clearInterval(__timerInstance)
			__timerInstance = setInterval(() => {
				this.log.developer("Tick...")
				this.set("outs.out.v", this.model.outs!.out.v + 1)
			}, v)
		})
	}
}