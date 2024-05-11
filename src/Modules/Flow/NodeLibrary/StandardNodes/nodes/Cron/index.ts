import { IFlowNodeTypeInfo } from './../../../../../../common/flowTypes';
import { ModelInstance, IFlowNode } from "../../../../FlowCore"

export const NodeTypeInfo: IFlowNodeTypeInfo = {
    type: ["FlowNodeType"],
    nodeTypeId: "dk.johansenweb.timer",
	nodeTypeName: "Timer",
	nodeGroup: "Time",
    description: "This is a Timer node firing events at specific times and/or intervals.",
    ins: { 
		recurrence: { 
			vType: "enum", 
			description: "How often should the event occur?", 
			options: ["year", "month", "week", "day", "hour", "minute", "second"],
			default: "daily"
		},  
		at: { 
			vType: "string",
			description: "Date/Time of event? (recurrence overrides 'coarser time entities'.)",
			default: "0000.00.00-00:00:00.000"
		},  
	}
}

/*
run every N [year, month, week, day, hour, minute, second] on [month, week, day, hour, minute, second] = X 

let recurrence = "weekly"
let at = "dow @ time"

let recurrence = "daily"
let at = "dow @ time"


Match: [year, month, week, day, hour, minute, second]

"2023.09.01.00.00.00.000"
"2023.*.01.00.00.00.000" = Every month, day 1 @ 00:00:00.000
"2023.*.01.00.00.00.000"

"*.*.01.00.00.00.000"

*/

// const everySecond = {year: "*", month: "*", week: "*", day: "*", hour: "*", minute: "*", second: "*"}

let recurrence = "daily"
let at = new Date("")

let now = new Date()
let nextYear = now.getFullYear()
let nextMonth = now.getMonth()
// let nextWeek = now.get
let nextHour = now.getHours()
let nextMinute = now.getMinutes()
let nextSecond = now.getSeconds()
let nextMilli = now.getMilliseconds()

if(recurrence == "daily") {

}

export class NodeImplementation extends ModelInstance {
	async setup() {
        this.log.developer("Console node setting up - YAY! :)")
		this.on("ins.in", (v) => {
			console.log(v)
		})
	}
}