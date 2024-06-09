//
// NOTE TO SELF: Files are copied from back/common --> front/common (using cpx in dev script)
//

// ----------------------------------------------------------------------------
// Object types
export interface IValueInfo<T> {
	vType: string
	description?: string
	default?: T
}

// Specific value types
export interface IBooleanValueInfo extends IValueInfo<boolean> {
	vType: "boolean"
	trueString?: string
	falseString?: string
}
export interface INumberValueInfo extends IValueInfo<number> {
	vType: "number"
	min?: number
	max?: number
	unit?: string
	step?: number
}
export interface IStringValueInfo extends IValueInfo<string> {
	vType: "string"
}
export interface IEnumValueInfo extends IValueInfo<string> {
	vType: "enum"
	options: string[]
}
export interface IObjectValueInfo extends IValueInfo<object> {
	vType: "object"
}
export interface IAnyValueInfo extends IValueInfo<object> {
	vType: "any"
}

export interface IValue {
	v?: any
	ts?: number
}

// ----------------------------------------------------------------------------
// Object types
export interface IIdDbObject {
	// id: string
	// [name: string]: any
}

export interface IFlowNodeTypeInfo extends IIdDbObject {
	type: ["FlowNodeType", ...any]
	nodeTypeId: string
	nodeTypeName: string
	nodeGroup: string
	nodeUiTypeId?: string
	author?: string
	version?: string
	icon?: string
	description?: string
	ins?: {
		[inputName: string]:
			IBooleanValueInfo
			| INumberValueInfo
			| IStringValueInfo
			| IEnumValueInfo
			| IObjectValueInfo
			| IAnyValueInfo
	}
	outs?: {
		[outputName: string]:
			IBooleanValueInfo
			| INumberValueInfo
			| IStringValueInfo
			| IEnumValueInfo
			| IObjectValueInfo
			| IAnyValueInfo
	}
}

export interface IFlowNode extends IIdDbObject {
	type: ["FlowNode", ...any]
	nodeTypeId: string
	ins?: { [id: string]: IValue }
	outs?: { [id: string]: IValue }
}

export interface IFlowConnection {
	inputNodeId: string
	inputName: string
	outputNodeId: string
	outputName: string
}

export interface IChildNodeInfo {
	id: string
	x: number
	y: number
	nodeTypeId: string
	config: { ins: { [inputName: string]: any }; displayName?: string }
}
// FIXME: Either use type or interface!
export type TChildNodeInfo = {
	id: string
	x: number 
	y: number
	nodeTypeId: string
	test(): void 
}
type TNewChildNodeInfo = Omit<IChildNodeInfo, "id">

export interface IFlowModel extends IFlowNode {
	type: ["FlowNode", "RootFlow", ...any]
	name: string
	icon?: string
	nodeTypeId: "Flow"
	nodes: { [nodeId: string]: IChildNodeInfo | null}
	connections: IFlowConnection[]
	scale: number
	origin: { x: number; y: number }
	active?: boolean
	lastCommitTS?: number
	lastCommitUserId?: string
}

// type TTestFlowNodeType {
// 	nodeId: string
// 	displayName: string
// 	ins: {
// 		[name:string]: {
// 			type: "number" | "string" | "enum"
// 			description?: string
// 			value: number | string | boolean | object

// 		}
// 	}
// 	nodes: {[nodeId:string]: IFlowNode}
// }

// type I = TTestFlowNodeType["ins"]

// export interface IEditorModel {
// 	scale: number
// 	origin: { x: number; y: number }
// 	selectedNodeId: string
// 	contextMenu: any
// 	newConnection: {
// 		outputNodeId: string
// 		outputName: string
// 		inputNodeId: string
// 		inputName: string
// 		startX: number
// 		startY: number
// 		mouseX: number
// 		mouseY: number
// 	} | null
// }

// export interface IFlowEditorModel {
// 	editorModel: IEditorModel
// 	flowModel: IFlowModel
// 	flowNodeTypeInfos: { [typeName: string]: IFlowNodeTypeInfo }
// 	nodeModels: { [nodeId: string]: IFlowNode }
// 	// findNode: ()=>{}
// }

// Usage ----------------------------------------------------------------------

// let rootFlowModel: IFlowModel = {
// 	type: ["FlowNode", "RootFlow"],
// 	nodeTypeId: "Flow",
// 	nodes: {
// 		N1: { id: "N1", x: 0, y: 0 },
// 		N2: { id: "N2", x: 200, y: 0 }
// 	},
// 	connections: { cId1: { outputNodeId: "N1", outputName: "out1", inputNodeId: "N2", inputName: "in1" } },
// 	_oid: "",
// 	selectedNodeId: "N1",
// 	active: true,
// 	lastCommitTS: 78623147263
// }

// let N1: IFlowNode = {
// 	type: ["FlowNode"],
// 	nodeTypeId: "TestNode1",
// 	outs: { out1: { _vid: "valueId1" } },
// 	_oid: "N1"
// }

// let N2: IFlowNode = {
// 	type: ["FlowNode"],
// 	nodeTypeId: "TestNode2",
// 	ins: { in1: { _vid: "valueId2" } },
// 	_oid: "N2"
// }
