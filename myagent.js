#!/usr/bin/env node

//Info & Settings
const version = "3.1";
var settings = {
	looplimit: -1,//-1: no limit
	port: 19130,
	log: true,
	loopinterval: 500,
	debug: false
};
var test = false;
var fn = Date.now()
var a = ""
function log(msg, type = "i") {
	var c = "";
	switch (type) {
		case "i":
			c = "\x1b[00m[INFO] ";
			break;
		case "w":
			c = "\x1b[33m[WARN] ";
			break;
		case "e":
			c = "\x1b[31m[ERROR] ";
			break;
		case "f":
			c = "\x1b[41m[FATAL] ";
			break;
	}
	console.log(c + new Date().toISOString() + " - " + msg + "\x1b[0m")
	a = a + (c.substr(5)+new Date().toISOString() + " - " + msg) + "\n"
}
console.log("MyAgent v%s", version);
console.log("Author: LNSSPsd");
console.log("https://github.com/mcpewebsocket-dev/MyAgent");
console.log("https://npmjs.com/myagent");

process.on("uncaughtException", function (error) {
	console.log("[ERROR] uncaughtException: %s." , error.message);
	process.exit(3);
});


try {
	if (process.argv.splice(2) == "test") {
		console.log("TEST MODE: true");
		test = true;
	}
	if (process.argv.splice(2) == "port") {
		settings.port = process.argv.splice(3);
		console.log("PORT: %d", settings.port);
	}
} catch (n) { }

const os = require("os");

if (os.platform() == "win32") {//It only works in windows.
	try {
		var network = os.networkInterfaces();
		console.log("HOST: %s", network[Object.keys(network)[0]][1].address);
	} catch (e) {
		log("HOST: Unknown", "e");
	}
}

try {
	var fs = require("fs");
	try {
		var settingsstr;
		settingsstr = fs.readFileSync(process.env.HOME + "/.myagentcfg").toString();
		settings = JSON.parse(settingsstr);
	} catch (errx) { }
	console.log("PORT: %d", settings.port);

	var readline = require("readline");
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	var WSk = require("ws");
	var wss = new WSk.Server({
		port: settings.port
	});
} catch (err) {
	console.error("[ERROR] Error when loading require packages: %s.", err.message);
	process.exit(1);
}

console.log("");
console.log("\x1b[33m/connect " + network[Object.keys(network)[0]][1].address + ":" + settings.port + "\x1b[0m")
if (test == true) { process.exit(0); }
var allws = [];
var idp = 1;

rl.on("line", function (line) {
	log("> " + line)
	if (line.substr(0, 3) == "/js") {
		try {
			eval(line.slice(4))
		} catch (er) {
			log(er, "e")
		}
	} else {
		if (line == "+log") {
			settings.log = true;
			log("[SET] log=true");
			return;
		}
		if (line == "-log") {
			settings.log = false;
			log("[SET] log=false");
			return;
		}
		if (line == "+debug") {
			settings.debug = true;
			log("[SET] debug=true");
			return;
		}
		if (line == "-debug") {
			settings.debug = false;
			log("[SET] debug=false");
			return;
		}
		if (line.substring(0, 8) == "-kickid ") {
			try { findid(parseInt(line.split(" ")[1])).ws.terminate(); } catch (err) { console.log("[KickId] Failed."); return; }
			log("[KickId] Success.");
			return;
		}

		allws.forEach(function (e, i) {
			try {
				e.ws.send(JSON.stringify({
					"body": {
						"origin": {
							"type": "player"
						},
						"commandLine": line,
						"version": 1
					},
					"header": {
						"requestId": "00000000-0001-0000-000000000000",
						"messagePurpose": "commandRequest",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
			} catch (ne) {
				allws.splice(i, 1);
				console.log("Unable to send packets")
			}
		});
	}
});

function shutdown() {
	allws.forEach(function (e, i) {
		try { e.ws.terminate(); } catch (eee) { }
	});
	fs.writeFileSync(fn + ".log", a)
	console.log("\nTerminated all clients.");
	console.log("Bye.");
	if (false) { console.log("Goodbye,Expand Dong."); }
	process.exit(0);
}

function findid(id) {
	var bws = {
		id: -1,
		ws: -1
	};
	allws.forEach(function (e, i) {
		if (e.id == id) {
			bws = e;
		}
	});
	if (bws.id == -1) {
		throw new Error("Id not found.");
	}
	return bws;
}

rl.on("SIGINT", function () { shutdown(); });

wss.on('connection',
	function connection(ws) {
		var wsi = {
			id: idp,
			ws: ws
		};
		idp++;
		allws.push(wsi);
		function gamecmd(cmd) {
			ws.send(JSON.stringify({
				"body": {
					"origin": {
						"type": "player"
					},
					"commandLine": cmd,
					"version": 1
				},
				"header": {
					"requestId": "0ffae098-00ff-ffff-abbbbbdf3f44",
					"messagePurpose": "commandRequest",
					"version": 1,
					"messageType": "commandRequest"
				}
			}));
		}

		function gamecmds(cmd) {
			ws.send(JSON.stringify({
				"body": {
					"origin": {
						"type": "player"
					},
					"commandLine": cmd,
					"version": 1
				},
				"header": {
					"requestId": "00000000-0001-0000-000000000000",
					"messagePurpose": "commandRequest",
					"version": 1,
					"messageType": "commandRequest"
				}
			}));
		}




		function serverinf(msg) {
			a = a + (Date() + " - " + msg) + "\n"
			//console.log("[Server] %s",msg);
			gamecmds("say " + msg);

			//gamecmds("msg @s |\n"+msg);
		}


		log("A new client connected,ID: " + wsi.id);

		/*
				ws.send(JSON.stringify({
					"body": {
						"eventName": "WorldUnloaded"
					},
					"header": {
						"requestId": "233ae098-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "BlockBroken"
					},
					"header": {
						"requestId": "fffdb098-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "BlockPlaced"
					},
					"header": {
						"requestId": "aaaae098-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "BoardTextUpdated"
					},
					"header": {
						"requestId": "0ffa0000-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "AgentCreated"
					},
					"header": {
						"requestId": "0ddbe098-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "AgentCommand"
					},
					"header": {
						"requestId": "0ffae090-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "BossKilled"
					},
					"header": {
						"requestId": "0ffae009-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				/*ws.send(JSON.stringify({
					"body": {
						"eventName": "ItemCrafted"
					},
					"header": {
						"requestId": "affae098-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "ItemDestroyed"
					},
					"header": {
						"requestId": "effae098-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "ItemUsed"
					},
					"header": {
						"requestId": "0f334098-00ff-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "MobKilled"
					},
					"header": {
						"requestId": "0ffae098-00ee-ffff-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "PlayerDied"
					},
					"header": {
						"requestId": "0ffae098-00ff-f333-abbbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "PlayerJoin"
					},
					"header": {
						"requestId": "0ffae098-00ff-ffff-abbb09bbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "PlayerLeave"
					},
					"header": {
						"requestId": "0ffae098-00ff-ffff-aabbbbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));/*
				ws.send(JSON.stringify({
					"body": {
						"eventName": "PlayerTeleported"
					},
					"header": {
						"requestId": "0ffae098-00ff-ffff-abbbbcccbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "PortalBuilt"
					},
					"header": {
						"requestId": "0ffae098-00ff-ffff-abbbbbdddbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));
				ws.send(JSON.stringify({
					"body": {
						"eventName": "PortalUsed"
					},
					"header": {
						"requestId": "0ffae098-00ff-ffff-abbbbbbbbbdf3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));*/
		ws.send(JSON.stringify({
			"body": {
				"eventName": "PlayerMessage"
			},
			"header": {
				"requestId": "0ffae098-00ff-ffff-abbbbbbbbbdf3344",
				"messagePurpose": "subscribe",
				"version": 1,
				"messageType": "commandRequest"
			}
		}));

		ws.on('message',
			function (message) {
				try {
					n = JSON.parse(message).body.eventName

					if (JSON.parse(message).header.messagePurpose == "event") {
						if (n == "PlayerMessage") {
							log("<" + JSON.parse(message).body.properties.Sender + "> " + JSON.parse(message).body.properties.Message);
						}
					} else {

						if (JSON.parse(message).body.statusMessage != undefined && JSON.parse(message).body.statusCode != -2147483648 && settings.log == true) {

							serverinf("\u00a7d" + JSON.parse(message).body.statusMessage)

						} else if (JSON.parse(message).body.statusMessage != undefined && JSON.parse(message).body.statusCode != -2147483648) {

							log(JSON.parse(message).body.statusMessage)

						} else if (JSON.parse(message).body.statusMessage != undefined) {
							throw JSON.parse(message).body.statusMessage
						}
					}
					
				} catch (error) {
					log(error, "e")
				}
				try{
					if(settings.debug){
						log("Received: "+message)
						}
				}catch(error) {
					log(error, "e")
				}
			}
			);
	});
