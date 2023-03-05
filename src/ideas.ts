interface ICollection {
	documentId: {}
	pub(key: string, object: { [prop: string]: any }): void
	sub(key: string, cb: (obj: { [prop: string]: any }, key: string) => void): void
}

interface bbRoot {
	[collectionName: string]: ICollection
}

interface IBB {
	getCollection(collectionName: string): ICollection
}

class BB {
	pub<T>(key: string, value: T): void {}
	sub<T>(key: string, cb: (value: T, key: string) => void): void {}
}
let bb = new BB()

class CFlow {
	rootFlowIndex = { "rootFlowIndex_1:": {}, "rootFlowIndex_2:": {} }
	installedNodeTypes = { NodeType_1: { nodeTypeInfo: {} } }
	rootFlowNodes = { rootFlowIndex_1: { rootFlowData_1: { nodes: { node_1: {}, node_2: {} } } } }
	nodes = { node_1: { outs: { out1: {} } }, node_2: { ins: { in1: {} } } }
	values = { "node_1.outs.out1": 42 }

	constructor() {
		bb.pub("flowCore.rootFlowIndex", { "rootFlowIndex_1:": {}, "rootFlowIndex_2:": {} })
		bb.pub("flowCore.installedNodeTypes", { NodeType_1: { nodeTypeInfo: {} } })
		bb.pub("flowCore.rootFlowNodes", { rootFlowIndex_1: { rootFlowData_1: { nodes: { node_1: {}, node_2: {} } } } })
		bb.pub("nodes.node_1", { outs: { out1: {} } })
		bb.pub("nodes.node_1.outs.out1", 42)
		bb.pub("nodes.node_2", { ins: { in1: {} } })

		// -----------------

		bb.pub({ type: "flowCore.rootFlowIndex", "rootFlowIndex_1:": {}, "rootFlowIndex_2:": {} })
		bb.pub({ type: "flowCore.installedNodeTypes", NodeType_1: { nodeTypeInfo: {} } })
		bb.pub({ type: "flowCore.rootFlowNodes", rootFlowIndex_1: { rootFlowData_1: { nodes: { node_1: {}, node_2: {} } } } })
		bb.pub({ type: "node", id: "node_1", outs: { out1: {} } })
		bb.pub({ type: "node", id: "node_2", ins: { in1: {} } })
		bb.pub({ _id: "nodes.node_1.outs.out1", v: 42 })

		//------------------

		let model = {
			rootFlowIndex: { "rootFlow_1:": { $ref: "" }, "rootFlow_2:": {} },
			rootFlow_1: { nodes: { node_1: {}, node_2: {} } },
			installedNodeTypes: { NodeType_1: { nodeTypeInfo: {} } },
			nodes: { node_1: { outs: { out1: {} } }, node_2: { ins: { in1: {} } } },
			values: { "node_1.outs.out1": 42 }
		}

		//---------------------

		let nodes = {}
		let rootFlows: any = {}
		bb.sub("flowCore.rootFlows", (upd: any) => {
			for (let rootFlowId in upd) {
				rootFlows[rootFlowId] = {}
				let rootFlow = rootFlows[rootFlowId]
				bb.sub(rootFlowId, (upd) => {
					patch(upd, rootFlow)
					for(let nodeId in rootFlow.Nodes) {
						bb.sub(nodeId, (upd) => {
							patch(upd, nodes[nodeId])
						})
					}
				})
			}
		})
	}
}
