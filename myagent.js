#!/usr/bin/env node

//Info & Settings
const version = "3.1";
var settings = {
	looplimit: -1,//-1: no limit
	port: 19110,
	log: true,
	loopinterval: 500,
	debug: false,
	idle: false
};
var key="trnsl.1.1.20181016T200703Z.a98c024489ef7739.25209d509075025dbcecce0de662f5ffea842317";//yandex translate api key

var html = {
	host: 'baidu.com',
	port: 80,
	path: '/index.html'
};
var lang=""
var test = false;
var fn = Date.now()
var a = ""
var reg = new RegExp(/"title":".[^"]*"/gm)
var autoreply = "\u00a7a【自动回复】 您好,我现在有事不在,一会再和您联系。"
function log(msg, type = "i") {
	var c = "";
	switch (type) {
		case "i":
			c = "\x1b[00m[INFO] ";
			console.log(c + new Date().toISOString() + " - " + msg + "\x1b[0m")
			break;
		case "w":
			c = "\x1b[33m[WARN] ";
			console.warn(c + new Date().toISOString() + " - " + msg + "\x1b[0m")
			break;
		case "e":
			c = "\x1b[31m[ERROR] ";
			console.error(c + new Date().toISOString() + " - " + msg + "\x1b[0m")
			break;
		case "f":
			c = "\x1b[41m[FATAL] ";
			console.error(c + new Date().toISOString() + " - " + msg + "\x1b[0m")
			break;
			case "d":
			c = "\x1b[32m[DEBUG] ";
			console.debug(c + new Date().toISOString() + " - " + msg + "\x1b[0m")
			break;
	}
	
	stream.write(c.substr(5) + new Date().toISOString() + " - " + msg) + "\n"
}
function currset(){
	log(JSON.stringify(settings),"d")
}
var request = require("request");


console.log("MyAgent v%s", version);
console.log("Author: LNSSPsd");
console.log("https://github.com/mcpewebsocket-dev/MyAgent");
console.log("https://npmjs.com/myagent");

process.on("uncaughtException", function (error) {
	console.log("[ERROR] uncaughtException: %s.", error.message);
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
	var stream = fs.createWriteStream(".\\logs\\"+Date.now() + ".log", { flags: 'a' });
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
try {
	console.log("\x1b[33m/connect " + network[Object.keys(network)[0]][1].address + ":" + settings.port + "\x1b[0m")
} catch (error) {
	log(error, "e")
}
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
		else if (line == "-log") {
			settings.log = false;
			log("[SET] log=false");
			return;
		}
		else if (line == "+debug") {
			settings.debug = true;
			log("[SET] debug=true");
			return;
		}
		else if (line == "-debug") {
			settings.debug = false;
			log("[SET] debug=false");
			return;
		}
		else if (line == "+idle") {
			settings.idle = true;
			log("[SET] idle=true");
			return;
		}
		else if (line == "-idle") {
			settings.idle = false;
			log("[SET] idle=false");
			return;
		}
		else if (line.substring(0, 8) == "-kickid ") {
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
						"requestId": "ffff0000-0000-0000-0000-000000000000",
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
					"requestId": "0ffae098-00ff-ffff-abbb-bbdf3f44",
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
					"requestId": "ffff0000-0000-0000-0000-00000000",
					"messagePurpose": "commandRequest",
					"version": 1,
					"messageType": "commandRequest"
				}
			}));
		}




		function serverinf(msg) {
			//console.log("[Server] %s",msg);
			gamecmds("say " + msg);

			//gamecmds("msg @s |\n"+msg);
		}


		log("A new client connected,ID: " + wsi.id);

		
				ws.send(JSON.stringify({
					"body": {
						"eventName": "WorldUnloaded"
					},
					"header": {
						"requestId": "233ae098-00ff-ffff-abbb-bbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));/*
				ws.send(JSON.stringify({
					"body": {
						"eventName": "BlockBroken"
					},
					"header": {
						"requestId": "fffdb098-00ff-ffff-abbb-bbbbbbdd3344",
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
						"requestId": "aaaae098-00ff-ffff-abbb-bbbbbbdd3344",
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
						"requestId": "0ffa0000-00ff-ffff-abbb-bbbbbbdd3344",
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
						"requestId": "0ddbe098-00ff-ffff-abbb-bbbbbbdd3344",
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
						"requestId": "0ffae090-00ff-ffff-abbb-bbbbbbdd3344",
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
						"requestId": "0ffae009-00ff-ffff-abbb-bbbbbbdd3344",
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
						"requestId": "affae098-00ff-ffff-abbb-bbbbbbdd3344",
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
						"requestId": "effae098-00ff-ffff-abbb-bbbbbbdd3344",
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
						"requestId": "0f334098-00ff-ffff-abbb-bbbbbbdd3344",
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
						"requestId": "0ffae098-00ee-ffff-abbb-bbbbbbdd3344",
						"messagePurpose": "subscribe",
						"version": 1,
						"messageType": "commandRequest"
					}
				}));*/
				ws.send(JSON.stringify({
					"body": {
						"eventName": "PlayerDied"
					},
					"header": {
						"requestId": "0ffae098-00ff-f333-abbb-bbbbbbdd3344",
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
						"requestId": "0ffae098-00ff-ffff-abbb-09bbbbdd3344",
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
						"requestId": "0ffae098-00ff-ffff-aabb-bbbbbbdd3344",
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
						"requestId": "0ffae098-00ff-ffff-abbb-bcccbbdd3344",
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
						"requestId": "0ffae098-00ff-ffff-abbb-bbdddbdd3344",
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
						"requestId": "0ffae098-00ff-ffff-abbb-bbbbbbdf3344",
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
				"requestId": "0ffae098-00ff-ffff-abbb-bbbbbbdf3344",
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
							var chat = JSON.parse(message).body.properties.Message//玩家消息
							var name = JSON.parse(message).body.properties.Sender//玩家名字
							log("<" + name + "> " + chat);
							if (name != "外部") {
								if (!chat.includes(autoreply) && settings.idle) {//挂机功能
									serverinf(autoreply)
								} 
								//自动百度
								else if (chat.includes("百度")) {
									if (chat.endsWith("百度") || chat.includes("百度吗")) {
										serverinf("百度什么？")
									} else if (!chat.endsWith("百度什么？") && !chat.includes("百度吗")) {
										var query = chat.substring(chat.search("百度") + 2)
										serverinf("§4百§1度§r:")
										log(query)
										try {
											request({ uri: "http://www.baidu.com/s?wd=" + encodeURI(query) },
												function (error, response, body) {
													log(error)
													var array = body.match(reg)
													array.forEach(function (element) {
														serverinf("§b" + JSON.parse("{" + element + "}").title);
													}
													)
												});
										} catch (err) {
											log(err, "e")
										}
									}
								}else{
									try {
										request({ uri: "https://translate.yandex.net/api/v1.5/tr.json/detect?key="+key+"&text="+ encodeURI(chat) },
												function (error, response, body) {
													log(error)
													lang=JSON.parse(body).lang
													if(lang!="zh"){
														try {
															log(lang,"d")
															request({ uri: "https://translate.yandex.net/api/v1.5/tr.json/translate?key="+key+"&text="+ encodeURI(chat)+"&lang="+lang+"-zh"  },
																	function (error, response, body) {
																		log(error)
																		log(body,"d")
																		var t=JSON.parse(body)
																		serverinf("§4[翻译] §c"+lang+"->zh §d"+name+": "+t.text);
																	});
														}catch(e){
															log(e,"e")
														}}
												});
									}catch(e){
										log(e,"e")
									}
									
								}
							}
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
				try {
					if (settings.debug) {
						log("Received: " + message,"d")
					}
				} catch (error) {
					log(error, "e")
				}
			}
		);
	});
	wss.on('close', function (msg) {
	})
