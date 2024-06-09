// console.log("\x1Bc") // console.clear()

// setTimeout(() => {
//     // import { NodeImplementation as aa } from "./Modules/Flow/NodeLibrary/DevTestNode/nodes/button/index"
//     let module = require("./Modules/Flow/NodeLibrary/DevTestNode/nodes/button/index")
//     console.log("module:", module)
//     console.log("module default name:", module.default.name)
//     console.log("require.cache:", require.cache)
//     console.log("require.cache.specific:", require.cache["D:\\Programming\\XApp1\\back\\dist\\Modules\\Flow\\NodeLibrary\\DevTestNode\\nodes\\button\\index.js"])
//     delete require.cache["D:\\Programming\\XApp1\\back\\dist\\Modules\\Flow\\NodeLibrary\\DevTestNode\\nodes\\button\\index.js"]
//     console.log("require.cache - post:", require.cache)
//     console.log("require.cache.specific:", require.cache["D:\\Programming\\XApp1\\back\\dist\\Modules\\Flow\\NodeLibrary\\DevTestNode\\nodes\\button\\index.js"])
//     let moduleV2 = require("./Modules/Flow/NodeLibrary/DevTestNode/nodes/button/index")
//     console.log("require.cache.specific:", require.cache["D:\\Programming\\XApp1\\back\\dist\\Modules\\Flow\\NodeLibrary\\DevTestNode\\nodes\\button\\index.js"])
// }, 1000);

import {createLogger} from "./logService"
var log =  createLogger("Main")

import { BB, getGlobalBB } from "./BB"
import WsBBServer from "./WsBBServer"
import FlowCore from "./Modules/Flow/FlowCore"

log.debug("MIX Server starting******************************************************")

// ----------------------------------------------------------------------------
// Load main BlackBoard
//let bb = new BB()
let bb = getGlobalBB()
new WsBBServer(bb, { port: 3022 })

const flow = new FlowCore(bb)

// ----------------------------------------------------------------------------
// import TS3 from "./TS3"
// let ts = new TS3()
// let xiaomiGW = new XiaomiGW()
// import MQTT from "./Modules/MQTT/mqtt_main"
// let mqtt = new MQTT(serverBB)

// ----------------------------------------------------------------------------
setInterval(() => {
	//     bb.oPub("system.time", {type: ["info"], date: Date.now()})
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
