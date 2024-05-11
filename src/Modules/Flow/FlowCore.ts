import { IFlowNodeTypeInfo } from "./../../common/flowTypes"
// import { app } from "../../AppGlobal"
// var log = app.logger.createNamedLogger("FlowCore")
// let db = app.db

import { createLogger } from "../../logService"
let log = createLogger("MQTT")

import { BB } from "../../BB"
import { IFlowModel, IFlowNode, IValue } from "../../common/flowTypes"
import { patch } from "../../common/util"
import path from "path"
import { glob } from "glob"
// import ObjDB from "../../ObjDB"

export { IFlowNode } from "../../common/flowTypes" // Used in loadable node types

export default class FlowCore {
	flowList = {}
	flowNodeTypes: {
		[nodeTypeId: string]: { typeInfo: IFlowNodeTypeInfo; class: { new (bb: BB, nodeId: string): any } }
	} = {}
	flowNodes: { [id: string]: ModelInstance } = {}
	bb: BB
	constructor(bb: BB) {
		this.bb = bb
		log.debug("Starting Flow Core!")

		this.loadNodeTypes(__dirname + "/NodeLibrary/*/nodes/*/index.js")
		this.loadFlowList()
		this.syncNodes()
	}

	syncNodes() {
		this.bb.oSub("idx:type=FlowNode", (upd) => {
			for (let nodeId in upd) {
				// TODO: Handle node deletion
				// else
				console.log("New FlowNode", upd)
				this.bb.oSub(nodeId, (upd, nodeId) => {
					console.log("Instantiating FlowNode;", upd)
					if (this.flowNodes[nodeId]) {
						// Node exists
						if (upd == null) {
							// TODO: Node removed from db!
							return
						}
						// TODO: just patch data on instances????
						//patch(upd, this.flowNodes[nodeId])
						console.log("UPDATE NODE IMPLEMENTATIO!N", upd, this.flowNodes[nodeId])
						return
					} else {
						// Create instance.
						let nodeTypeId = upd.nodeTypeId
						console.log("Creating instance of", nodeTypeId)
						let nodeTypeInfo = this.flowNodeTypes[nodeTypeId]
						if (nodeTypeInfo) this.flowNodes[nodeId] = new nodeTypeInfo.class(this.bb, nodeId)
						else console.log("No type defined for node", nodeTypeId)
					}
				})
			}
		})
	}

	// Load available flow node types.
	async loadNodeTypes(folderGlob: string) {
		// TODO: Implement monitoring of folder.
		console.log(`Loading node types @ ${folderGlob}`)
		let self = this

		let indexFiles = glob.sync(folderGlob)
		indexFiles.forEach(function (file: string) {
			console.log(`Checking: ${file}`)
			let module = require(path.resolve(file))
			console.log("Module:", module)
			let flowNodeInfo: IFlowNodeTypeInfo = module.NodeTypeInfo
			if (!flowNodeInfo) return
			let type = flowNodeInfo.type
			if (Array.isArray(type)) {
				if (!type.includes("FlowNodeType")) {
					console.log(`Skipping: ${file} - type array does not specify FlowNodeType as type.`)
					return
				}
			} else if (type != "FlowNode") {
				console.log(`Skipping: ${file} - type does not specify FlowNode as type.`)
				return
			}
			let classType = module["NodeImplementation"]
			if (!classType) {
				console.log(`Skipping: ${file} - No NodeImplementation class found in module exports.`)
				return
			}
			let nodeTypeId = flowNodeInfo.nodeTypeId
			self.flowNodeTypes[nodeTypeId] = { typeInfo: flowNodeInfo, class: classType }
			console.log("Loaded FlowNode:", nodeTypeId)
			self.bb.oPub(nodeTypeId, flowNodeInfo)
		})
	}

	async loadFlowList() {
		const defaultFlow: IFlowModel = {
			// _oid: "defaultFlow",
			name: "Default flow",
			displayName: "Default flow",
			icon: "account_tree",
			type: ["FlowNode", "RootFlow"],
			nodeTypeId: "Flow",
			ins: {},
			outs: {},
			nodes: {
				nodeWithID1: { id: "nodeWithID1", nodeTypeId: "dk.johansenweb.console", x: 250, y: 100 },
				nodeWithID2: { id: "nodeWithID2", nodeTypeId: "dk.johansenweb.ticker", x: 50, y: 50 }
			},
			connections: [
				{
					inputNodeId: "nodeWithID1",
					inputName: "in",
					outputNodeId: "nodeWithID2",
					outputName: "out"
				}
			],
		}
		if (!this.bb.oExists("FlowList")) {
			console.log("FlowList does not exist! - Creating it + default flow.")
			this.bb.oPub("FlowList", { defaultFlow: {} })
		}
		if (!this.bb.oExists("defaultFlow")) {
			this.bb.oPub("defaultFlow", defaultFlow)
			// FIXME: Remove this stubbing...
			let node: IFlowNode = {
				_oid: "nodeWithID1",
				type: ["FlowNode"],
				displayName: "myConsole",
				nodeTypeId: "dk.johansenweb.console",
				ins: { in1: {} },
				outs: { out1: {} }
			}
			this.bb.oPub("nodeWithID1", node)
			node._oid = "nodeWithID2"
			node.nodeTypeId = "dk.johansenweb.ticker"
			node.displayName = "myTicker"
			this.bb.oPub("nodeWithID2", node)
		}
	}
}

//-----------------------------------------------------------------------------
export abstract class ModelInstance {
	// model: IFlowNode = {
	// 	type: ["FlowNode"],
	// 	nodeType: "?",
	// 	_oid: ""
	// }
	// __listeners: { [path: string]: (value: any, path: string) => void } = {}
	nodeId: string
	bb: BB
	constructor(bb: BB, nodeId: string) {
		this.bb = bb
		this.nodeId = nodeId
		this.initializeNode()
	}
	async initializeNode() {
		// set default inputs if not existing
		this.bb.oSub(this.nodeId, (nodeUpd: IFlowNode) => {
			if (nodeUpd.nodeTypeId) {
				this.bb.oSub(nodeUpd.nodeTypeId, (nodeTypeUpd: IFlowNodeTypeInfo) => {
					if (nodeTypeUpd.ins) {
						for (let input in nodeTypeUpd.ins) {
							if (!this.bb.vExists(this.nodeId + ".ins." + input)) {
								// Input doesn't exist as variable. Create it.
								let inputType = nodeTypeUpd.ins[input]
								if ("default" in inputType)
									this.bb.vPub(this.nodeId + ".ins." + input, inputType.default)
								else console.log("***NO default value")
							} else console.log("***Value exists")
						}
					}
				})
			}
		})

		// Run node specific setup
		/*await*/ this.setup() // Set up specialized node as per implementation.


	}
	abstract async setup(): Promise<void> // Implemented by node Type definition!
	async close() {
		// TODO: Store state?
	}
	on(path: string, cb: (value: any, path: string) => void): void {
		// FIXME: Returned path not same as subscribed path as nodeId is added!
		console.log("ModelInstnce SUBBIING", this.nodeId + ":" + path)

		// -----------------------------------------------------------------------------------------------
		// FIXME: No object with id path + ins.x.v created???

		this.bb.vSub(this.nodeId + "." + path, cb)
	}
	set(path: string, value: any): void {
		this.bb.vPub(this.nodeId + "." + path, value)
	}
	onAny(cb: (value: any, path: string) => void): void {}
	onAll(paths: string[], cb: (value: any, path: string) => void): void {}
	log = {
		developer: console.log
	}
}
