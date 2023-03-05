console.log("\x1Bc") // console.clear()

import {createLogger} from "./logService"
var log =  createLogger("Main")

log.debug("MIX Server starting******************************************************")

import { BB } from "./BB"
import WsBBServer from "./WsBBServer"
import WsServer from "./WsServer"
import { ProtocolHandler } from "./ProtocolHandler"
import { ClientHandler } from "./ClientHandler"
import MQTT from "./Modules/MQTT/mqtt_main"
import FlowCore from "./Modules/Flow/FlowCore"
 
let serverBB = new BB()
new WsBBServer(serverBB, { port: 3022 })

// new ClientHandler(serverBB)
// new ProtocolHandler(serverBB)

// let tempBB = new BB()
// new WsServer(tempBB, { port: 3002 })


// import ObjDB from "./ObjDB"
// export const db = new ObjDB()
 
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
const flow = new FlowCore(serverBB)

// ----------------------------------------------------------------------------
// let xiaomiGW = new XiaomiGW()
 

// let mqtt = new MQTT(serverBB)
  
// ----------------------------------------------------------------------------
setInterval(()=>{
    serverBB.pub("system.time", {date: Date.now()})
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
 