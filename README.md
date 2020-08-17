# League 
**The TDM gamemode**, based on the GTA V [RAGE:MP](http://rage.mp/)
**Discord**: [League,  RAGE:MP Gamemode](https://discord.gg/pwTZ6SS)

### Requirements

1. [MongoDB Community server](https://www.mongodb.com/try/download/community) v4.4.0 or above
2. Setup the connection config.json (./serverside/assets/config.json)
For example
```json
{
  "DB": {
    "HOSTNAME": "localhost",
    "PORT": "27017",
    "USERNAME": "root",
    "PASSWORD": "root",
    "DATABASE": "league"
  }
}
```
### Installation

If you don't have typescript compiler
```bash
$ yarn add global typescript
```

Install dependecies
```bash
$ yarn
```

### Build the gamemode

```bash
$ yarn build
```

### Flexibility with watch mode

For **development** with the watch mode it's recommended to change the build paths in cef/clientside/serverside to your server's folders for more flexibility.
For example (in the clientside), change the `webpack.common.js` to something like this:
```js
const path = require('path')
const fs = require('fs')

// Let's imagine that GIT folder in the %RAGEMP%/server-files/league
// And we are in the %RAGEMP%/server-files/league/clientside
// So make the path to the server client_packages
// To avoid the build project any time when files are changed
const outputPath = path.resolve("..", "..", "client_packages", "league")

// check if directory exists
fs.statSync(outputPath)

// other code in webpack.common.js...
```


### Roadmap

[Roadmap](./roadmap.md) (ru)

### License

[ISC LICENSE](./LICENSE)