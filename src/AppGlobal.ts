// import WsBBServer from "./WsBBServer"
// import Logger from "./logService"
// import ObjDB from "./ObjDB"
// import EventEmitter from "events"
// import BB from "./BB"

// export const bb = new BB()
// new WsBBServer(bb, { port: 3022 })

// export const logger = new Logger(bb)

// export const db = new ObjDB()

// class AppGlobal {
// 	logger: Logger
// 	db: ObjDB
// 	eventBus = new EventEmitter.EventEmitter()
// 	bb = new BB()
// 	// Variable declarations

// 	// Methods
// 	constructor() {
// 		let wsBB = new WsBBServer(this.bb, { port: 3022 })
// 		this.logger = new Logger(this.bb)
//     this.db = new ObjDB()

// 		console.log("Creating WsLogServer")

// 		// this.log = function (...args: any) {
// 		// 	// this.bb.pub("common.log", args)
// 		// }
// 		// this.log("1'st msg :)")
// 		// this.levelDb = levelup(leveldown("../db"))
// 		// this.modelDb = new ModelDB(subLevel(this.levelDb, "rt", { valueEncoding: "json" }))
// 	}

// 	// TS: Allow any members to be added.
// 	// [name: string]: any
// }
// console.log("Creating GlobalApp")
// export const app = new AppGlobal()
