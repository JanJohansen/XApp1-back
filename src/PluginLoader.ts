import glob from "glob"
import path from "path"
// import { HarmonyGW } from "./HarmonyGW"


interface IVal<T> {
    v: T
    ts?: number
}
interface IVNumLim extends IVal<number> {
    minVal: number
    maxVal: number
    resolution?: number
}

interface Idb {
    plugins: IPluginLoader
}
interface IPluginLoader {
    library: {
        sourceUrl: IVal<string>
        found: { [name: string]: IPluginInfo }
    }
    available: { [pluginName: string]: IPluginInfo }
    instances: { [instanceName: string]: IPluginConfig }
}
interface IPluginInfo {
    name: string // Name of the plugin!
    author?: string // Name of the author of the plugin!
    description?: string // Short description! (#md in first line to render as mark down!)
    iconUrl?: string // Url to icon to show for the plugin.
    webUrl?: string // Url to web-page to get more info about the plugin... (Could be it's GIThub page!)
    create(name: string, config: any): void
}
interface IPluginConfig {
    name: string
    [name: string]: any
}
interface IXiaomiPluginConfig extends IPluginConfig {
    GWIP: IVal<string>    // IP(+port) of gateway
    GWPW: IVal<string>    // Password to gateway
}

interface IPlugin {
    pluginInfo: IPluginInfo
}

let db: Idb = {
    plugins: {
        library: { sourceUrl: { v: "TBD.address.com" }, found: {} },
        available: { "XiaomiGW": { name: "XiaomiGW", author: "Jan Johansen" } },
        instances: { "XiaomiGW_1": { name: "XiaomiGW_1", GWIP: "192.168.1.123", GWPW: "123456" } },
    }
}

class SyncObject {
    async get(path: string): SyncObject {
        return this
    }
    createIfNotExists(obj: any) {

    }
}

export class PluginLoader {
    plugins: IPluginLoader & SyncObject = { library: { sourceUrl: { v: "" }, found: {} }, available: {}, instances: {} }
    // installed: { [name: string]: new (name: string, config: any) => IPlugin } = {}
    constructor(db: any = {}) {
        this.setup(db)
    }
    async setup(db: any) {
        // this.plugins = await db.get("plugins") // Sync recursively from db to local mirror/copy!
        // this.plugins.createIfNotExists({ library: { sourceUrl: { v: "" }, found: {} }, available: {}, instances: {} })
        this.loadPlugins()
    }
    async scanForPlugins(folderGlob: string) {
        console.log(`Scanning for Plugins @ ${folderGlob}`)
        let self = this

        glob.sync(folderGlob).forEach(function (file: string) {
            // console.log(`Checking: ${file}`)
            let module = require(path.resolve(file));
            for (let x in module) {
                if (module[x].PluginInfo && module[x].PluginInfo.name) {
                    self.registerType(module[x].PluginInfo.name, module[x].PluginInfo)
                } else {
                    console.log(`Skipping: ${x} - (static) PluginInfo not found in class.`)
                }
            }
        });
    }

    registerType(name: string, pluginInfo: IPluginInfo) {
        console.log("Found plugin:", pluginInfo)
        if (name in this.plugins.available) throw (`Error: Duplicate plugin names being registered! - (${name})`)
        this.plugins.available[name] = pluginInfo
    }

    async loadPlugins() {
        let instances = this.plugins.instances
        for (let instanceName in instances) {
            console.log("Starting plugin:", instanceName)
            let config = instances[instanceName]
            let PI = new config.create(instanceName, config)
        }
    }

    addNode(typeName: string, name: string, config: any = {}): AriNodeBase {
        if (!(AriGraphNode.types[typeName])) throw (`Error: Trying to add unknown AriNode type - ${typeName}`)
        name = this.createUniqueName(config.name || name || typeName)
        let node = new AriGraphNode.types[typeName](this, typeName, name, config)
        this.children[node.name] = node
        return node
    }
    createUniqueName(name: string) {
        if (!(name in this.children)) return name
        let count = 0
        let newName = name
        while (newName in this.children) {
            newName = name + count
        }
        return newName
    }
}