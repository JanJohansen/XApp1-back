import Logger from "./logService"
import ObjDB from "./ObjDB"
import EventEmitter from "events"

// var levelup = require('levelup')
// var leveldown = require('leveldown')
// var subLevel = require('subleveldown')

// import { ModelDB } from "./ModelDb"

class AppGlobal {
  logger: Logger
  db: ObjDB
  eventBus = new EventEmitter.EventEmitter()
  // Variable declarations

  // Methods
  private constructor() {
    this.logger = new Logger
    this.db = new ObjDB()
    // this.levelDb = levelup(leveldown("../db"))
    // this.modelDb = new ModelDB(subLevel(this.levelDb, "rt", { valueEncoding: "json" }))
  }

  // Singleton instance handling
  private static instance: AppGlobal
  static getInstance() {
    if (!AppGlobal.instance) AppGlobal.instance = new AppGlobal()
    return AppGlobal.instance
  }

  // TS: Allow any members to be added.
  // [name: string]: any
}
 
export const app = AppGlobal.getInstance()