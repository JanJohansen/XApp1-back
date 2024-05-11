console.log("\x1Bc") // console.clear()

import {createLogger} from "./logService"
var log =  createLogger("Main")

log.debug("MIX Server starting******************************************************")

import { BB, getGlobalBB } from "./BB"
import WsBBServer from "./WsBBServer"
import FlowCore from "./Modules/Flow/FlowCore"

//let bb = new BB()
let bb = getGlobalBB()
new WsBBServer(bb, { port: 3022 })

// ----------------------------------------------------------------------------
// Load main BlackBoard
const flow = new FlowCore(bb)

// ----------------------------------------------------------------------------
// import TS3 from "./TS3"
// let ts = new TS3()
// let xiaomiGW = new XiaomiGW()
// import MQTT from "./Modules/MQTT/mqtt_main"
// let mqtt = new MQTT(serverBB)
  
// ----------------------------------------------------------------------------
setInterval(()=>{
    bb.oPub("system.time", {type: ["info"], date: Date.now()})
}, 1000 * 10)

// ----------------------------------------------------------------------------
// Exit handlers
// process.on("uncaughtExceptionMonitor", (err: any) => {
// 	let crashFile = "./Exception@" + Date.now()
// 	fs.writeFileSync(crashFile, err.stack)
// 	console.log(crashFile + "Crash file written!")
// 	app.db.saveDbFileSync()
// 	// throw(err)
// 	//  process.exit(1)
// })
// process.on("exit", (code) => {
// 	console.log("Exit signal detected... Shutting down.")
// 	app.db.saveDbFileSync()
// }) 
// process.on("SIGINT", function () {
// 	console.log("User typed Ctrl+C... Shutting down.")
// 	app.db.saveDbFileSync()
// 	process.exit(1)
// })
// process.on("SIGUSR2", function () {
// 	console.log("Exit signal (from nodemon?)... Shutting down.")
// 	app.db.saveDbFileSync()
// 	process.exit(1)
// }) 
 