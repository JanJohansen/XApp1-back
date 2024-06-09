import { IFlowNodeTypeInfo } from "./../../common/flowTypes"
// import { app } from "../../AppGlobal"
// var log = app.logger.createNamedLogger("FlowCore")
// let db = app.db

import { createLogger } from "../../logService"
let log = createLogger("FlowCore")

import { BB } from "../../BB"
import { IFlowModel, IFlowNode, IValue } from "../../common/flowTypes"
import { patch } from "../../common/util"
import path from "path"
import { glob } from "glob"
// import ObjDB from "../../ObjDB"

export { IFlowNode } from "../../common/flowTypes" // Used in loadable node types

// const flowCoreModel = {
// 	type: "plugin",
// 	calls: {
// 		deployFlow: { description: "Call this function with {name: string, flow: IFlowNode}" }
// 	}
// }

export default class FlowCore {
	flowNodeTypes: {
		[nodeTypeId: string]: { typeInfo: IFlowNodeTypeInfo; class: { new (bb: BB, nodeId: string): any } }
	} = {}
	flowNodes: { [id: string]: ModelInstance } = {}
	connections: { [source: string]: string[] } = {}
	bb: BB
	constructor(bb: BB) {
		this.bb = bb
		log.debug("Starting Flow Core!")

		this.loadNodeTypes(__dirname + "/NodeLibrary/*/nodes/*/index.js")
		this.syncNodes()
		this.ensureDefaults()

		// bb.oPub("flowCore", flowCoreModel)
		// bb.onCall("deployFlow", (args) => {
		// 	console.log("deployFlow:", args)
		// 	return true
		// })
	}

	// Load available flow node types.
	async loadNodeTypes(folderGlob: string) {
		// TODO: Implement monitoring of folder.
		log.debug(`Loading node types @ ${folderGlob}`)
		let self = this

		let indexFiles = glob.sync(folderGlob)
		indexFiles.forEach(function (file: string) {
			log.debug(`Checking: ${file}`) 
			let module = require(path.resolve(file))
console.log("Module:", module) 
			let flowNodeInfo: IFlowNodeTypeInfo = module.NodeTypeInfo
			if (!flowNodeInfo) return
			let type = flowNodeInfo.type
			if (Array.isArray(type)) {
				if (!type.includes("FlowNodeType")) {
					log.debug(`Skipping: ${file} - type array does not specify FlowNodeType as type.`)
					return
				}
			} else if (type != "FlowNode") {
				log.debug(`Skipping: ${file} - type does not specify FlowNode as type.`)
				return
			}
			let classType = module["NodeImplementation"]
			if (!classType) {
				log.debug(`Skipping: ${file} - No NodeImplementation class found in module exports.`)
				return
			} 
			// console.log("class:", JSON.stringify(classType, null, 2))
			console.log("class:", classType)

			let nodeTypeId = flowNodeInfo.nodeTypeId
			self.flowNodeTypes[nodeTypeId] = { typeInfo: flowNodeInfo, class: classType }
			log.debug("Loaded FlowNode:", nodeTypeId)
			self.bb.oPub(nodeTypeId, flowNodeInfo)
		})
	}
 
	// Synchronize (e.g. instatiate and delete objects defined in RootFlow models on the BB.)
	syncNodes() {
		this.bb.oSub("idx:type=RootFlow", (upd) => {
			// FlowNode
			for (let rootFlowId in upd) {
				log.debug("RootFlow-list update:", upd)
				const nodeUpd = upd[rootFlowId]
				if (nodeUpd == null) {
					// TODO: Handle RootFlow deletion
					// Delete nodes + unsub...
				} else {
					// New RootFlow
					// Subscribe to RootFlow definition object.
					this.bb.oSub(rootFlowId, (upd: IFlowModel, nodeId) => {
						log.debug("RootFlow update to", nodeId, "=", upd)
						// Sync sub-nodes defined in RootFlow.
						for (const subNodeId in upd.nodes) {
							const nodeModel = upd.nodes[subNodeId]
							const existingNode = this.flowNodes[subNodeId]
							if (existingNode) {
								// Node instance exists -----------------------

								if (nodeModel == null) {
									// TODO: Delete node instance
								} else {
									// Update of this instance.
									// Patch config data inputs
									const nodeConfig = nodeModel.config
									log.debug("Patching instance of", nodeModel)
									if (nodeConfig && nodeConfig.ins) {
										for (const inName in nodeConfig.ins) {
											this.bb.vPub(subNodeId + ".ins." + inName, nodeConfig.ins[inName])
											log.debug(
												"Applying node config:",
												subNodeId + ".ins." + inName,
												"=",
												nodeConfig.ins[inName]
											)
										}
									}
								} 
							} else {
								// Node instance does not exist ------------------------

								// Create new SubFlowNode instance.
								let nodeTypeId = nodeModel!.nodeTypeId
								let nodeTypeInfo = this.flowNodeTypes[nodeTypeId]
								if (nodeTypeInfo) {
									log.debug("Creating instance of", nodeTypeId)
									this.flowNodes[subNodeId] = new nodeTypeInfo.class(this.bb, subNodeId, nodeModel)

									// Set config..
									const newNodeConfig = nodeModel.config
									if (newNodeConfig && newNodeConfig.ins) {
										for (const inName in newNodeConfig.ins) {
											this.bb.vPub(subNodeId + ".ins." + inName, newNodeConfig.ins[inName])
										}
									}

									// Call setup function on instance to initialize node.
									this.flowNodes[subNodeId].setup()
								} else {
									log.debug(
										"No type defined for node. Possibly missing to install node type.",
										nodeTypeId
									)
								}
							}
						}

						// Create connections.
						for (const connectionIdx in upd.connections) {
							const connection = upd.connections[connectionIdx]
							const source = connection.outputNodeId + ".outs." + connection.outputName
							const dest = connection.inputNodeId + ".ins." + connection.inputName

							console.log("Connection:", source, dest)
							if (!this.connections[source]) this.connections[source] = []
							const existingConn = this.connections[source]
							if (existingConn.indexOf(dest) < 0) {
								// Connection doesn't exist - create it!
								this.bb.vSub(source, (val) => {
									this.bb.vPub(dest, val)
									log.debug("*** Transfering:", source, dest)
								})
							} // else NOP
						}
					})
				}
			}
		})
	}

	async ensureDefaults() {
		const defaultFlow: IFlowModel = {
			persist: true, // Persist this over restarts of the BB/DB/App
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
			]
		}
		if (!this.bb.oExists("defaultFlow")) {
			this.bb.oPub("defaultFlow", defaultFlow)
			// FIXME: Remove this stubbing...
			let node: IFlowNode = {
				id: "nodeWithID1",
				type: ["FlowNode"],
				displayName: "myConsole",
				nodeTypeId: "dk.johansenweb.console",
				ins: { in1: {} },
				outs: { out1: {} }
			}
			this.bb.oPub("nodeWithID1", node)
			node.id = "nodeWithID2"
			node.nodeTypeId = "dk.johansenweb.ticker"
			node.displayName = "myTicker"
			this.bb.oPub("nodeWithID2", node)
		}
	}
}

//-----------------------------------------------------------------------------
export abstract class ModelInstance {
	nodeId: string
	bb: BB
	nodeModel: IFlowNode
	constructor(bb: BB, nodeId: string, nodeModel: IFlowNode) {
		this.bb = bb
		this.nodeId = nodeId
		this.nodeModel = nodeModel
		setImmediate(this.initializeBaseNode.bind(this))
	}
	private async initializeBaseNode() {
		// Define "static" part of the object model to replresent instnce.
		// Messages and UI variable to be sent via vPub...
		this.bb.oPub(this.nodeId, {
			type: "FlowNode",
			flowNodeTypeId: this.typeInfo?.nodeTypeId,
			deployed: true 
		}) 
		// // set default inputs if not existing
		// this.bb.oSub(this.nodeId, (nodeUpd: IFlowNode) => {
		// 	if (nodeUpd.nodeTypeId) {
		// 		this.bb.oSub(nodeUpd.nodeTypeId, (nodeTypeUpd: IFlowNodeTypeInfo) => {
		// 			if (nodeTypeUpd.ins) {
		// 				for (let input in nodeTypeUpd.ins) {
		// 					if (!this.bb.vExists(this.nodeId + ".ins." + input)) {
		// 						// Input doesn't exist as variable. Create it.
		// 						let inputType = nodeTypeUpd.ins[input]
		// 						if ("default" in inputType)
		// 							this.bb.vPub(this.nodeId + ".ins." + input, inputType.default)
		// 						else console.log("***NO default value")
		// 					} else console.log("***Value exists")
		// 				}
		// 			}
		// 		})
		// 	} 
		// })

		// Run node specific setup
		// await this.setup() // Set up specialized node as per implementation.
	}
	abstract setup(): Promise<void> // Implemented by node Type definition! - Lifecycle handler called in FlowCore.
	async close() {
		// TODO: Store state?
		// TODO: Unsubscribe all?
		// more cleanup?
	}
	set(path: string, value: any): void {
		this.bb.vPub(this.nodeId + "." + path, value)
		this.bb.vPub(this.nodeId + ".__UIEvent", path)
		log.debug("SET:" + this.nodeId + "." + path, "=", value)
	}
	on(path: string, cb: (value: any, path: string) => void): void {
		// FIXME: Returned path not same as subscribed path as nodeId is added!
		console.log("ModelInstnce SUBBIING", this.nodeId + ":" + path)

		// -----------------------------------------------------------------------------------------------
		// FIXME: No object with id path + ins.x.v created???

		this.bb.vSub(this.nodeId + "." + path, (...args) => {
			// Call callback
			cb(...args)
			// Indicate IO event to UI model.
			this.bb.vPub(this.nodeId + ".__UIEvent", path)
		})
	}
	onAny(cb: (value: any, path: string) => void): void {}
	onAll(paths: string[], cb: (value: any, path: string) => void): void {}

	setType(typeModel: any){
		this.bb.oPub(this.nodeId, typeModel) 
	}

	log = {
		developer: console.log
	}
}
