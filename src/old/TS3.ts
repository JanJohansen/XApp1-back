// FROM: https://github.com/Multivit4min/TS3-NodeJS-Library
// See also: https://multivit4min.github.io/TS3-NodeJS-Library/index.html

import { TeamSpeak, QueryProtocol, TeamSpeakServer, ClientType, TeamSpeakClient } from "ts3-nodejs-library"

export default class ts3 {
	constructor() {
		//create a new connection
		TeamSpeak.connect({
			host: "ts3.johansenweb.dk",
			// protocol: QueryProtocol.RAW, //optional
			// queryport: 10011, //optional
			serverport: 9987,
			username: "serveradmin" // IMPORTANT!!!
			// password: "hLuZu697",
			// nickname: "Jan"
		})
			.then(async (teamspeak) => {
				console.log("TS3 connected!")
				// teamspeak.
				// teamspeak.useBySid("BUy0HkMlNJP1q8tJw\/gNFvdQK+A")
				// const serverlist = teamspeak.serverList()
				// console.log("ServerList:", serverlist)
				// const clients = await teamspeak.clientList({ clientType: 0 })
				// clients.forEach((client) => {
				//     // console.log("Sending 'Hello!' Message to", client.nickname)
				//     // client.message("Hello!")
				//     console.log("Client:", client)
				// })

				const channels = await teamspeak.channelList()
				//console.log("Channels:", channels)
                for(let cid in channels) {
                    let channel = channels[cid]
					console.log("Channel:", cid, channel.name, "(", channel.totalClients, "clients)")
					const channelClients = await channel.getClients({ clientType: 0 }) // Exclude serverQuery client type
					channelClients.forEach((client) => {
						console.log("Client:", client.nickname, "(", client.away ? "Away" : "Present", ")")
					})
				}
			})
			.catch((e) => {
				console.log("*** TS3 error!")
				console.error(e)
			})
	}
}
/*
Jan 
hLuZu697
login Jan hLuZu697

*/
