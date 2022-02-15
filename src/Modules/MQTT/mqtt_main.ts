import { createLogger } from "../../logService"
let log = createLogger("MQTT")

import mqtt from "mqtt"
import { BB } from "../../BB"

export default class MQTT {
	constructor(bb: BB) {
		log.user("MQTT module started!")
		bb.pub("MQTT", { desciption: "MQTT gateway.", out: { _log: { description: "Log output from object." } } })
		const client = mqtt.connect("mqtt://192.168.1.100")

		client.on("connect", function () {
			client.subscribe("shellies/shellyem3-C45BBE6AB0E3/emeter/1/power", function (err) {
				if (!err) {
					// client.publish("presence", "Hello mqtt")
				}
			})
		})

		client.on("message", function (topic, message) {
			// message is Buffer
			// console.log("MQTTMessage", message.toString())
			let value = message.toString()
			// log.developer(topic, "=", value)
			// client.end()
		})
	}
}
