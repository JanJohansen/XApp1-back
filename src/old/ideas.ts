let bb: any = {}

// Client loading list of devices + get all leaf values

// Get list of known types
let types: object = {}
bb.oSub("types", (newTypes)=>{patch(types, newTypes) })

let typeToLoad = types.keys[0]// Select type to load

// Load index of objects of this type.
let typeIndex = {}
bb.oSub("idx:type=" + typeToLoad, (newTypes)=>{patch(typeIndex, newTypes)})

let objects[typeToLoad] = {}
for(const oid in typeIndex){
	bb.oSub(oid, (upd: object)=>{
		patch(objects[typeToLoad][oid], upd)
		// Subscribe to all variables of type
		
	})
}
bb.oSub("idx:type=" + typeToLoad, (newTypes)=>{patch(typeIndex, newTypes)})
