"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppGlobal_1 = require("./AppGlobal");
var log = AppGlobal_1.app.logger.createNamedLogger("Main");
console.log('\x1Bc'); // console.clear()
log.debug("MIX Server starting******************************************************");
const WsServer_1 = __importDefault(require("./WsServer"));
// import FlowCore from "./Modules/Flow/FlowCore"
// import { XiaomiGW } from "./Modules/XiaomiGW/main"
// ----------------------------------------------------------------------------
let WSS = new WsServer_1.default({ port: 3002 });
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
