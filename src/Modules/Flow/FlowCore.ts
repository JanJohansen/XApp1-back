// import { app } from "../../AppGlobal"
// var log = app.logger.createNamedLogger("FlowCore")
// let db = app.db

import { createLogger } from "../../logService"
let log = createLogger("MQTT")

import { BB } from "../../BB"
import { IFlowModel, IFlowNode, IValue } from "../../common/flowTypes"
import { patch } from "../../common/util"
import path from "path"
import { glob } from 'glob'
// import ObjDB from "../../ObjDB"

export {IFlowNode} from "../../common/flowTypes"	// Used in loadable node types

export default class FlowCore {
	flowList = {}
	flowNodeTypes: {[nodeType: string]: {typeInfo: IFlowNode, class: { new(): any }}} = {}
	flowNodes: { [id: string]: ModelInstance } = {}
	bb: BB
	constructor(bb: BB) {
		this.bb = bb
		log.debug("Starting Flow Core!")

		this.loadNodeTypes(__dirname + "/NodeLibrary/*/nodes/*/index.js")
		this.loadFlowList()
		this.syncNodes()
	}

	syncNodes(){
		this.bb.sub("idx:type=FlowNode",(upd)=>{
			for(let nodeId in upd){
				console.log("New FlowNode", upd)
				this.bb.sub(nodeId, (upd, nodeId)=>{
					console.log("Instantiating FlowNode;", upd)
					if(this.flowNodes[nodeId]) {
						// Node exists
						if(upd == null) {
							// TODO: Node removed from db!
							return
						}
						// TODO: just patch data on instances????
						//patch(upd, this.flowNodes[nodeId])
						console.log("UPDATE NODE IMPLEMENTATIO!N", upd, this.flowNodes[nodeId])
						return 
					} else {
						// Create instance.
						let nodeType = upd.nodeType
						console.log("Creating instance of", nodeType)
						let nodeTypeInfo = this.flowNodeTypes[nodeType]
						if(nodeTypeInfo) this.flowNodes[nodeId] = new nodeTypeInfo.class(this.bb, nodeId)
						else console.log("No type defined for node", nodeType)
					}
				})
			}
		})
	}

	// Load available flow node types.
	async loadNodeTypes(folderGlob: string){
		// TODO: Implement monitoring of folder.
		console.log(`Loading node types @ ${folderGlob}`)
		let self = this

		let indexFiles = glob.sync(folderGlob)
		indexFiles.forEach(function (file: string) {
			console.log(`Checking: ${file}`)
			let module = require(path.resolve(file));
			console.log("Module:", module)
			let flowNodeInfo: IFlowNode = module.NodeTypeInfo
			if(!flowNodeInfo) return 
			let type = flowNodeInfo.type
			if (Array.isArray(type) {
				if(!type.includes("FlowNodeType")) {
					console.log(`Skipping: ${file} - type array does not specify FlowNodeType as type.`)
					return
				}
			} else if(type  != "FlowNode") {
				console.log(`Skipping: ${file} - type does not specify FlowNode as type.`)
				return 
			}
			let classType = module["NodeImplementation"]
			if(!classType) {
				console.log(`Skipping: ${file} - No NodeImplementation class found in module exports.`)
				return 
			}
			self.flowNodeTypes[flowNodeInfo.nodeTypeId] = {typeInfo: flowNodeInfo, class: classType}
			console.log("Loaded FlowNode:", flowNodeInfo.nodeTypeId)
			self.bb.pub("", flowNodeInfo)
		})
	}

	async loadFlowList() {
		const defaultFlow: IFlowModel = {
			// _oid: "defaultFlow",
			name: "Default flow",
			icon: "account_tree",
			type: ["FlowNode", "RootFlow"],
			nodeTypeId: "Flow",
			ins: {},
			outs: {},
			nodes: {
				"nodeWithID1": { id: "nodeWithID1", x: 50, y: 10 },
				"nodeWithID2": { id: "nodeWithID2", x: 350, y: 10 }
			},
			connections: [
				{
					outputNodeId: "nodeWithID1",
					outputName: "out1",
					inputNodeId: "nodeWithID2",
					inputName: "in1"
				}
			]
		}
		if (!this.bb.exists("FlowList")) {
			console.log("FlowList does not exist! - Creating it + default flow.")
			this.bb.pub("FlowList", { defaultFlow: {} })
		}
		if(!(this.bb.exists("defaultFlow"))) {
			this.bb.pub("defaultFlow", defaultFlow)
			// FIXME: Remove this stubbing...
			let node:IFlowNode = {
				_oid: "nodeWithID1",
				type: "FlowNode",
				nodeTypeId: "TestFlowNodeType",
				ins:{in1:{}},
				outs:{out1:{}}
			}
			this.bb.pub("nodeWithID1", node)
			node._oid = "nodeWithID2"
			this.bb.pub("nodeWithID2", node)
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
	async initializeNode(){
		/*await*/ this.setup()	// Set up specialized node as per implementation.
	}
	abstract async setup(): Promise<void>	// Implemented by node Type definition!
	async close() {
		// TODO: Store state?
	} 

	on(path: string, cb: (value: any, path: string) => void): void {
		// FIXME: Returned path not same as subscribed path as nodeId is added!
		this.bb.sub(this.nodeId + ":" + path, cb)
	}
	set(path: string, value: any): void {
		this.bb.pub(this.nodeId + ":" + path, value)
	}
	onAny(cb: (value: any, path: string) => void): void {}
	onAll(paths: string[], cb: (value: any, path: string) => void): void {}
	log = {
		developer: console.log
	}
}
