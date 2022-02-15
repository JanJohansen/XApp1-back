//
// NOTE TO SELF: Files are copied from back/common --> front/common (using cpx in dev script)
//

export interface IDbObject {
	_id?: string
	[name: string]: any
}

export interface IIdDbObject {
	_id: string
	[name: string]: any
}

export interface IValue extends IIdDbObject {
	v: any
	type: string
	ts?: number
}

export interface IFlowNode extends IIdDbObject {
	type: "FlowNode"
	nodeType: string
	ins: { [id: string]: IValue }
	outs: { [id: string]: IValue }
}

export interface IConnection {}

export interface IFlow extends IFlowNode {
	nodeType: "Flow"
	nodes: { [id: string]: IFlowNode }
	connections: { [id: string]: IConnection }
	selectedNodeId: string
} 
