//
// NOTE TO SELF: Files are copied from back/common --> front/common (using cpx in dev script)
//

export interface IDbObject {
	//_oid?: string
	// [name: string]: any
} 

export interface IIdDbObject {
	//_oid: string
	// [name: string]: any
}

export interface IValueInfo {
	vType: string
	description?: string
	default?: any
}

// Specific value types
export interface IBooleanValueInfo extends IValueInfo {
	vType: "boolean"
	trueString: string
	falseString: string
}
export interface INumberValueInfo extends IValueInfo {
	vType: "number"
	min?: number
	max?: number
}
export interface IStringValueInfo extends IValueInfo {
	vType: "string"
}
export interface IEnumValueInfo extends IValueInfo {
	vType: "enum"
	options: string[]
}
export interface IObjectValueInfo extends IValueInfo {
	vType: "object"
}

export interface IValue {
	v?: any
	ts?: number
}

export interface IFlowNodeTypeInfo extends IIdDbObject {
	type: ["FlowNodeType", ...any]
	nodeType: string
	nodeGroup: string
	icon?: string
	description?: string
	ins?: { [id: string]: IBooleanValueInfo | INumberValueInfo | IStringValueInfo | IEnumValueInfo | IObjectValueInfo }
	outs?: { [id: string]: IBooleanValueInfo | INumberValueInfo | IStringValueInfo | IEnumValueInfo | IObjectValueInfo }
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

export interface IFlowDragConnection {
	// Used in Flow editor for dragging new connections. (While dragging!)
	startX: number
	startY: number
	dragpos: { x: number; y: number }
	inputNodeId?: string
	inputName?: string
	outputNodeId?: string
	outputName?: string
}

export interface IChildNodeInfo {
	id: string
	x: number
	y: number
}

export interface IFlowModel extends IFlowNode {
	type: ["FlowNode", "RootFlow", ...any]
	name: string
	icon?: string
	nodeTypeId: "Flow"
	nodes: { [nodeId: string]: IChildNodeInfo }
	connections: IFlowConnection[]
	selectedNodeId?: string
	active?: boolean
	lastCommitTS?: number
	lastCommitUserId?: string
}

export interface IEditorModel {
	selectedNodeId: string
	contextMenu: any
}

export interface IFlowEditorModel {
	editorModel: IEditorModel
	flowModel: IFlowModel
	flowNodeTypeInfos: { [typeName: string]: IFlowNodeTypeInfo }
	nodeModels: { [nodeId: string]: IFlowNode }
}

// Usage ----------------------------------------------------------------------

let rootFlowModel: IFlowModel = {
	type: ["FlowNode", "RootFlow"],
	nodeTypeId: "Flow",
	nodes: {
		N1: { id: "N1", x: 0, y: 0 },
		N2: { id: "N2", x: 200, y: 0 }
	},
	connections: { cId1: { outputNodeId: "N1", outputName: "out1", inputNodeId: "N2", inputName: "in1" } },
	_oid: "",
	selectedNodeId: "N1",
	active: true,
	lastCommitTS: 78623147263
}

let N1: IFlowNode = {
	type: ["FlowNode"],
	nodeTypeId: "TestNode1",
	outs: { out1: { _vid: "valueId1" } },
	_oid: "N1"
}

let N2: IFlowNode = {
	type: ["FlowNode"],
	nodeTypeId: "TestNode2",
	ins: { in1: { _vid: "valueId2" } },
	_oid: "N2"
}
