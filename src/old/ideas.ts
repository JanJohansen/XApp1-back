// let bb: any = {}

// // Client loading list of devices + get all leaf values

// // Get list of known types
// let types: object = {}
// bb.oSub("types", (newTypes)=>{patch(types, newTypes) })

// let typeToLoad = types.keys[0]// Select type to load

// // Load index of objects of this type.
// let typeIndex = {}
// bb.oSub("idx:type=" + typeToLoad, (newTypes)=>{patch(typeIndex, newTypes)})

// let objects[typeToLoad] = {}
// for(const oid in typeIndex){
// 	bb.oSub(oid, (upd: object)=>{
// 		patch(objects[typeToLoad][oid], upd)
// 		// Subscribe to all variables of type

// 	})
// }
// bb.oSub("idx:type=" + typeToLoad, (newTypes)=>{patch(typeIndex, newTypes)})

interface IPlugin {}

class AriPlugin {
	pluginType: string = "PluginTemplate"
	constructor(pluginType: string) {
		this.pluginType = pluginType
	}
	localObjs: { [oid: string]: object } = {}
	createLocalObj(oid: string) {
		this.localObjs[oid] = new localObject(this, oid)
	}
}
class localObject {
	_parentPlugin: AriPlugin
	id?: string
	constructor(pluginParent: AriPlugin, oid?: string) {
		this._parentPlugin = pluginParent
	}
}

// ----------------------------------------------------------------------------
// Usecase: Plugin
// const ariPluging = new AriPlugin("TestPlugin")
// let config = ariPluging.getConfig("configObj")
// let obj = ariPluging.createLocalObj("TestObjID1")

const m = {
	oSub: (vid: string, cb: (value: any) => void) => {},
	oPub: (oid: string, value: any) => {},

	vSub: (vid: string, cb: (value?: any) => void) => {},
	vPub: (oid: string, value: any) => {}
}

// On server
m.oPub("systemN.notify.0", {
	notifyAll: { msg: "", description: "Notify everywhere with message." }
})
m.vSub("system.notify.notifyAll.msg", (args) => {})
// UI or controller
m.vPub("system.notify.notifyAll.msg", { msg: "Hey all!" })

// ----------------------------------------------------------------------------
// Alarm

// On Server
m.oPub("application.alarms", {
	oType: ["application"],
	ins: {
		set: {
			vType: "{headline: string, description: string, }",
			description: "Put alarm into alarm list."
		}
	},
	outs: {
		alarmsInfo: { description: "Array of current alarmId's and their description objects." },
		activeAlarmIds: { description: "Array of active alarmId's." },
		unAcknowledgedAlarmIds: { description: "Array of unacknowledged alarmId's." }
	}
})
m.vSub("_system.alarms.ins.set", (args: { alarmId?: string; headline: string; details: string }) => {
	// Move to active alarms++
})
m.vSub("_system.alarms.ins.clear", (args: { alarmId: string }) => {
	// Clear alarm status.
})
m.vSub("_system.alarms.ins.acknowledge", (args: { alarmId: string; userId: string }) => {
	// Acknowledge alarm.
	// Remove from alarm list.
})

// UI or controller
m.vPub("_system.alarms.ins.set", {
	headline: "Update available!",
	details: "New plugin update is available in the store."
})
m.vSub("_system.alarms.outs.activeAlarmIds", (args: any) => {})
m.vSub("_system.alarms.outs.unacknowledgedAlarmIds", (args: any) => {})
m.vPub("_system.alarms.ins.clearAlarm", { alarmId: "42" })

// Usecase: Controller

// Usecase: UI?



// ----------------------------------------------------------------------------
// Flowcontroller

// On Server
m.oPub("FlowController.0", {
	oType: ["applicaton"],
	ins: {
		set: {
			vType: "{headline: string, description: string, }",
			description: "Put alarm into alarm list."
		}
	},
	outs: {
		alarmsInfo: { description: "Array of current alarmId's and their description objects." },
		activeAlarmIds: { description: "Array of active alarmId's." },
		unAcknowledgedAlarmIds: { description: "Array of unacknowledged alarmId's." }
	},
	calls: {
		deployFlow: {
			args: "{}",
			returns: "{success: boolean, error?: string}"
		}
	},
	config: {
		retries: 3
	}
})
m.vSub("_system.alarms.ins.set", (args: { alarmId?: string; headline: string; details: string }) => {
	// Move to active alarms++
})
m.vSub("_system.alarms.ins.clear", (args: { alarmId: string }) => {
	// Clear alarm status.
})
m.vSub("_system.alarms.ins.acknowledge", (args: { alarmId: string; userId: string }) => {
	// Acknowledge alarm.
	// Remove from alarm list.
})
