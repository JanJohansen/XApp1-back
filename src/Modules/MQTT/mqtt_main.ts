import { createLogger } from "../../logService"
let log = createLogger("MQTT")

import mqtt from "mqtt"
import { BB } from "../../BB"

// List of objects w. list of io's
let mqttObjs = {
	MainPowerMeter: {
		outs: {
			Phase1Power: { topic: "shellies/shellyem3-C45BBE6AB0E3/emeter/0/power" },
			Phase1Current: { topic: "shellies/shellyem3-C45BBE6AB0E3/emeter/0/current" },
			Phase2Power: { topic: "shellies/shellyem3-C45BBE6AB0E3/emeter/1/power" },
			Phase2Current: { topic: "shellies/shellyem3-C45BBE6AB0E3/emeter/1/current" },
			Phase3Power: { topic: "shellies/shellyem3-C45BBE6AB0E3/emeter/2/power" },
			Phase3Current: { topic: "shellies/shellyem3-C45BBE6AB0E3/emeter/2/current" }
		}
	}
}

export default class MQTT {
	mqttClient: mqtt.MqttClient
	bb: BB
	constructor(bb: BB) {
		let self = this
		this.bb = bb
		log.usr("MQTT module started!")
		bb.oPub("MQTT", {
			desciption: "MQTT gateway.",
			ins: {
				mqttServerIP: { description: "IP of server hosting the MQTT broker." },
				mqttServerPort: { description: "Port of MQTT broker." }
				// TODO: Implement mqtt server simulation - avoiding dedicated broker!
			},
			outs: {
				_connected: { description: "True if connected to broker.." },
				_topics: { description: "All MQTT topics + values retreived from broker." },
				_log: { description: "Log output from object." }
			}
		})
		bb.oPub("MQTT.outs._connected", false)

		this.mqttClient = mqtt.connect("mqtt://192.168.1.100")

		this.mqttClient.on("connect", function () {
			bb.oPub("MQTT.outs._connected", true)
			bb.oPub("MQTT.outs._log", "OK - Connected to MQTT broker.")
			self.mqttClient.subscribe("#", function (err) {
				if (err) {
					bb.oPub("MQTT.outs._log", "Error when subscribing to MQTT topics (#).")
				} // else nothing
			})
		})

		this.mqttClient.on("message", function (topic, message) {
			// message is Buffer
			// console.log("MQTTMessage", message.toString())
			let value = message.toString()
			log.dev(topic, "=", value)
			bb.oPub("MQTT." + topic, value)
			// client.end()

			if (topic.startsWith("zigbee2mqtt")) self.handleZ2MMsg(topic, value)
		})
	}
	registerNodes(obj) {
		this.mqttClient.subscribe("shellies/shellyem3-C45BBE6AB0E3/emeter/1/power", function (err) {
			if (!err) {
				// client.publish("presence", "Hello mqtt")
			}
		})
	}
	handleZ2MMsg(topic: string, value: string) {
		let path = topic.split("/")
		path.shift()
		if (path[0] == "bridge") {
			if (path[1] == "devices") {
				// Register devices...
				let devices = JSON.parse(value)
				console.log("Updating MQQT devices...", devices)
				for (let idx in devices) {
					let device = devices[idx]
					if (device.type == "EndDevice" || device.type == "Router") {
						let deviceModel: any = {
							idx: { name: device.friendly_name,},
							model: device.model_id,
							vendor: device.vendor,
							name: device.friendly_name,
							ieee_address: device.ieee_address
						}
						let def = device.definition
						if (def) {
							deviceModel.model = def.model
							deviceModel.vendor = def.vendor
							deviceModel.description = def.description
							if (def.options) {
								// Inputs
							}
							if (def.exposes) {
								// Outputs
								deviceModel.outs = {}
								for (let outId in def.exposes) {
									let exp = def.exposes[outId]
									let output: any = {}
									output.type = exp.type
									if (exp.description) output.description = exp.description
									if (exp.unit) output.unit = exp.unit
									output.type = exp.type
									if (exp.name) deviceModel.outs[exp.name] = output
								}
							}
						}

						console.log("New Device:", deviceModel)
						this.bb.oPub("Z2M_" + deviceModel.ieee_address, deviceModel)
					}
				}
			}
		}
	}
}
