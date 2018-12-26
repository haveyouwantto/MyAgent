# MyAgent
The Minecraft agent generator & controller written in node.js

[![MyAgent](pmyagent.png)](https://github.com/mcpewebsocket-dev/MyAgent)

**[MyAgent Project](http://agent.vanillahh.online)**

[![Discord](https://img.shields.io/badge/chat-on%20discord-7289da.svg)](https://discord.gg/ntaa8z8)
[![CircleCI](https://circleci.com/gh/mcpewebsocket-dev/MyAgent.svg?style=svg)](https://circleci.com/gh/mcpewebsocket-dev/MyAgent)
[![MyAgent NPM](https://img.shields.io/badge/npm-myagent-blue.svg)](https://www.npmjs.com/myagent)
[![MyAgent Version](https://img.shields.io/badge/dynamic/json.svg?label=myagent%20version&url=https%3A%2F%2Fraw.githubusercontent.com%2Fmcpewebsocket-dev%2FMyAgent%2Fmaster%2Fpackage.json&query=%24.version&colorB=yellowgreen)](https://github.com/mcpewebsocket-dev/MyAgent)
## Considerations
Agent Commands doesn't work in Minecraft Bedrock 1.7~1.8.x, that means you can't create or control Agent in this version.
## Available Minecraft Versions
iOS: 0.16 ~ 1.6  
Android: 0.16 ~ 1.9b  
Windows 10: 0.16 ~ 1.9b  
PC(Minecraft Java Edition): Not Compatible  
Apple TV: 0.16 ~ 1.1.5  
Also compatible with Minecraft China Edition and Minecraft Education Edition
## Fast install
### Global Install
Execute `npm i myagent -g` to install myagent.  
Execute `myagent` command to start myagent.  
`myagentctl` is the tool to change myagent's config.
### Normal Install
Execute `npm i myagent` to install myagent.  
Execute `npx myagent` to start myagent.
## MyAgent Binary File
You can download builded binary file of myagent in CircleCI.(Stopped Update)
## MyAgent Control
MyAgent Control can set the config of myagent.  
`myagentctl set <config> <value>` to set a config.  
`myagentctl rmconf` to remove config file of myagent (back to default configs)
## Execute myagent from source code
First,Clone a copy of myagent  
And then,please execute following command:
```
npm install
```
At last,execute command:`node myagent.js`
## Run
Install Node.JS First,And then execute:
```
npm i myagent -g
myagent
```
## Connect
type command in game:
`/connect [ip]:[port]`  
`[ip]` is IP of the server where you hosting myagent.  
`[port]` is the ip of myagent. Default value is 19131.
## Report a bug
Submit a issue to report bug.
## LICENSE
[GNU GPL v3](LICENSE)
## Author & Maintainers.
### Author
[LNSSPsd](https://github.com/LNSSPsd)
### Maintainers
[許嘉鋅](https://github.com/TheXuJiaXin),[LNSSPsd](https://github.com/LNSSPsd),[CAIMEO](https://github.com/CAIMEOX) &amp; [Torrekie](https://github.com/Torrekie).
## Contact Us
MJTG QQ Group:`590352162`
