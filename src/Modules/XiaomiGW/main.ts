import { app } from "../../old/AppGlobal"
// var log = app.logger.createNamedLogger("XiaomiGW")
let db = app.db

const Aqara = require("lumi-aqara")

let log = (x: any) => db.upsert({ _id: "XiomiGW_1", outs: { _log: x } })

let I: any = {}
export class XiaomiGW {
	constructor() {
		this.setup()
	}
	setup() {
		// USING LUMI AQARA ***************************************************
		log("Connecting to gateway.")
		const aqara = new Aqara()
		aqara.on("gateway", (gateway: any) => {
			console.log("Gateway discovered")
			log("Gateway discovered.")
			gateway.on("ready", () => { 
				log("Gateway is ready")
				gateway.setPassword("vuxjtrix09m1eii2")

				gateway.setColor({ r: 0, g: 255, b: 0 })
				gateway.setIntensity(10)
				// gateway.setSound(11, 50) // 11 : Knock at the door | 50 : volume (0-100)
				db.upsert({
					_id: "XiaomiGW",
					outs: {
						online: { v: true }
					}
				})
			})

			gateway.on("offline", () => {
				console.log("Gateway is offline")
				gateway = null
				db.upsert({
					_id: "XiaomiGW",
					outs: {
						online: { v: false }
					}
				})
			})

			gateway.on("subdevice", (device: any) => {
				console.log("New device")
				console.log(`  Battery: ${device.getBatteryPercentage()}%`)
				console.log(`  Type: ${device.getType()}`)
				console.log(`  SID: ${device.getSid()}`)
				let sid = device.getSid()
				let type = device.getType()
				let battery = device.getBatteryPercentage()

				db.upsert({
					_id: "XiaomiGW:" + sid,
					deviceType: type,
					outs: {
						battery: { v: battery }
					}
				})

				// console.log("Testing type", device.getType())

				switch (device.getType()) {
					case "magnet":
						console.log(`  Magnet (${device.isOpen() ? "open" : "close"})`)
						device.on("open", () => {
							console.log(`${device.getSid()} is now open`)
							db.upsert({
								_id: "XiaomiGW:" + device.getSid(),
								outs: {
									open: { v: true }
								}
							})
						})
						device.on("close", () => {
							console.log(`${device.getSid()} is now close`)
							db.upsert({
								_id: "XiaomiGW:" + device.getSid(),
								outs: {
									open: { v: false }
								}
							})
						})
						device.on("offline", () => {
							console.log(`${device.getSid()} is offline`)
							db.upsert({
								_id: "XiaomiGW:" + device.getSid(),
								outs: {
									connected: { v: false }
								}
							})
						})
						device.on("online", () => {
							console.log(`${device.getSid()} is online`)
							db.upsert({
								_id: "XiaomiGW:" + device.getSid(),
								outs: {
									connected: { v: true }
								}
							})
						})
						break
					case "wall_switch":
						console.log(`  Wall Switch`)
						device.on("click", () => {
							console.log(`${device.getSid()} is clicked on channel ${device.getChannel()}`)
						})
						device.on("doubleClick", () => {
							console.log(`${device.getSid()} is double clicked on channel ${device.getChannel()}`)
						})
						device.on("longClick", () => {
							console.log(`${device.getSid()} is long pressed on channel ${device.getChannel()}`)
						})
						break
					case "switch":
						console.log(`  Switch`)
						device.on("click", () => {
							console.log(`${device.getSid()} is clicked`)
							db.upsert({
								_id: "XiaomiGW:" + device.getSid(),
								outs: {
									click: { v: true }
								}
							})
						})
						device.on("doubleClick", () => {
							console.log(`${device.getSid()} is double clicked`)
							db.upsert({
								_id: "XiaomiGW:" + device.getSid(),
								outs: {
									doubleClick: { v: true }
								}
							})
						})
						device.on("longClickPress", () => {
							console.log(`${device.getSid()} is long pressed`)
							db.upsert({
								_id: "XiaomiGW:" + device.getSid(),
								outs: {
									longPress: { v: true }
								}
							})
						})
						device.on("longClickRelease", () => {
							console.log(`${device.getSid()} is long released`)
							db.upsert({
								_id: "XiaomiGW:" + device.getSid(),
								outs: {
									longPress: { v: false }
								}
							})
						})
						break
					case "motion":
						console.log(`  Motion (${device.hasMotion() ? "motion" : "no motion"})`)
						device.on("motion", () => {
							console.log(`${device.getSid()} has motion${device.getLux() !== null ? " (lux:" + device.getLux() + ")" : ""}`)
							db.upsert({ _id: "XiaomiGW:" + device.getSid(), outs: { motion: { v: true } }, Lux: { v: device.getLux() } })
						})
						device.on("noMotion", () => {
							console.log(
								`${device.getSid()} has no motion (inactive:${device.getSecondsSinceMotion()}${device.getLux() !== null ? " lux:" + device.getLux() : ""})`
							)
							db.upsert({ _id: "XiaomiGW:" + device.getSid(), outs: { motion: { v: false } }, Lux: { v: device.getLux() } })
						})
						break
					case "sensor":
						console.log(
							`  Sensor (temperature:${device.getTemperature()}C rh:${device.getHumidity()}%${
								device.getPressure() != null ? " pressure:" + device.getPressure() + "kPa" : ""
							})`
						)
						device.on("update", () => {
							console.log(
								`${device.getSid()} temperature: ${device.getTemperature()}C rh:${device.getHumidity()}%${
									device.getPressure() != null ? " pressure:" + device.getPressure() + "kPa" : ""
								}`
							)
							let temp = device.getTemperature()
							let hum = device.getHumidity()
							let press = device.getPressure()
							if (press) db.upsert({ _id: "XiaomiGW:" + device.getSid(), outs: { temperature: { v: temp } }, humidity: { v: hum }, pressure: { v: press } })
							else db.upsert({ _id: "XiaomiGW:" + device.getSid(), outs: { temperature: { v: temp } }, humidity: { v: hum } })
						})
						break
					case "leak":
						console.log(`  Leak sensor`)
						device.on("update", () => {
							console.log(`${device.getSid()}${device.isLeaking() ? "" : " not"} leaking`)
						})
						break
					case "cube":
						console.log(`  Cube`)
						device.on("update", () => {
							console.log(`${device.getSid()} ${device.getStatus()}${device.getRotateDegrees() !== null ? " " + device.getRotateDegrees() : ""}`)
						})
						break
					case "smoke":
						console.log(`  Smoke`)
						device.on("update", () => {
							console.log(`${device.getSid()} (${device.hasAlarm() ? "SMOKE DETECTED" : "no smoke detected"} density: ${device.getDensity()})`)
						})
						break
					case "vibration":
						console.log(`  Vibration`)
						device.on("update", () => {
							console.log(`${device.getSid()} (coordination: ${device.getCoordination()} bed_activity: ${device.getBedActivity()})`)
						})
						device.on("vibrate", () => {
							console.log(`${device.getSid()} has vibration`)
						})
						device.on("freeFall", () => {
							console.log(`${device.getSid()} has freeFall`)
						})
						device.on("tilt", () => {
							console.log(`${device.getSid()} (tilt: ${device.getFinalTiltAngel()}°)`)
						})
						break
				}
			})

			gateway.on("lightState", (state: any) => {
				console.log(`Light updated: ${JSON.stringify(state)}`)
				db.upsert({
					_id: "XiaomiGW",
					outs: {
						color: { v: state.color.r + "," + state.color.g + "," + state.color.b },
						brightness: { v: state.intensity }
					}
				})
			})
		})
	}
}
