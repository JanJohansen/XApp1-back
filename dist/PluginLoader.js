"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoader = void 0;
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
let db = {
    plugins: {
        library: { sourceUrl: { v: "TBD.address.com" }, found: {} },
        available: { "XiaomiGW": { name: "XiaomiGW", author: "Jan Johansen" } },
        instances: { "XiaomiGW_1": { name: "XiaomiGW_1", GWIP: "192.168.1.123", GWPW: "123456" } },
    }
};
class SyncObject {
    get(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this;
        });
    }
    createIfNotExists(obj) {
    }
}
class PluginLoader {
    // installed: { [name: string]: new (name: string, config: any) => IPlugin } = {}
    constructor(db = {}) {
        this.plugins = { library: { sourceUrl: { v: "" }, found: {} }, available: {}, instances: {} };
        this.setup(db);
    }
    setup(db) {
        return __awaiter(this, void 0, void 0, function* () {
            // this.plugins = await db.get("plugins") // Sync recursively from db to local mirror/copy!
            // this.plugins.createIfNotExists({ library: { sourceUrl: { v: "" }, found: {} }, available: {}, instances: {} })
            this.loadPlugins();
        });
    }
    scanForPlugins(folderGlob) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Scanning for Plugins @ ${folderGlob}`);
            let self = this;
            glob_1.default.sync(folderGlob).forEach(function (file) {
                // console.log(`Checking: ${file}`)
                let module = require(path_1.default.resolve(file));
                for (let x in module) {
                    if (module[x].PluginInfo && module[x].PluginInfo.name) {
                        self.registerType(module[x].PluginInfo.name, module[x].PluginInfo);
                    }
                    else {
                        console.log(`Skipping: ${x} - (static) PluginInfo not found in class.`);
                    }
                }
            });
        });
    }
    registerType(name, pluginInfo) {
        console.log("Found plugin:", pluginInfo);
        if (name in this.plugins.available)
            throw (`Error: Duplicate plugin names being registered! - (${name})`);
        this.plugins.available[name] = pluginInfo;
    }
    loadPlugins() {
        return __awaiter(this, void 0, void 0, function* () {
            let instances = this.plugins.instances;
            for (let instanceName in instances) {
                console.log("Starting plugin:", instanceName);
                let config = instances[instanceName];
                let PI = new config.create(instanceName, config);
            }
        });
    }
    addNode(typeName, name, config = {}) {
        if (!(AriGraphNode.types[typeName]))
            throw (`Error: Trying to add unknown AriNode type - ${typeName}`);
        name = this.createUniqueName(config.name || name || typeName);
        let node = new AriGraphNode.types[typeName](this, typeName, name, config);
        this.children[node.name] = node;
        return node;
    }
    createUniqueName(name) {
        if (!(name in this.children))
            return name;
        let count = 0;
        let newName = name;
        while (newName in this.children) {
            newName = name + count;
        }
        return newName;
    }
}
exports.PluginLoader = PluginLoader;
