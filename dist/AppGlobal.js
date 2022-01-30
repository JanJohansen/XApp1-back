"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const logService_1 = __importDefault(require("./logService"));
const ObjDB_1 = __importDefault(require("./ObjDB"));
const events_1 = __importDefault(require("events"));
// var levelup = require('levelup')
// var leveldown = require('leveldown')
// var subLevel = require('subleveldown')
// import { ModelDB } from "./ModelDb"
class AppGlobal {
    // Variable declarations
    // Methods
    constructor() {
        this.eventBus = new events_1.default.EventEmitter();
        this.logger = new logService_1.default;
        this.db = new ObjDB_1.default();
        // this.levelDb = levelup(leveldown("../db"))
        // this.modelDb = new ModelDB(subLevel(this.levelDb, "rt", { valueEncoding: "json" }))
    }
    static getInstance() {
        if (!AppGlobal.instance)
            AppGlobal.instance = new AppGlobal();
        return AppGlobal.instance;
    }
}
exports.app = AppGlobal.getInstance();
