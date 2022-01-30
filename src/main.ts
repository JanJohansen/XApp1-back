import { app } from "./AppGlobal"
var log = app.logger.createNamedLogger("Main")
import fs from "fs"

console.log('\x1Bc'); // console.clear()
log.debug("MIX Server starting******************************************************")

import WsServer from "./WsServer"
// import FlowCore from "./Modules/Flow/FlowCore"
// import { XiaomiGW } from "./Modules/XiaomiGW/main"

// ----------------------------------------------------------------------------
let WSS = new WsServer({ port: 3002 })

// ----------------------------------------------------------------------------
// let flow = new FlowCore() 

// ----------------------------------------------------------------------------
// let xiaomiGW = new XiaomiGW()

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



