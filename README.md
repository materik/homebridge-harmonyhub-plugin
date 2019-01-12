# homebridge-harmonyhub-plugin

[![](https://img.shields.io/badge/contact-@thematerik-blue.svg?style=flat-square)](http://twitter.com/thematerik)
[![](https://img.shields.io/npm/v/homebridge-harmonyhub-plugin.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-harmonyhub-plugin)
[![](https://img.shields.io/npm/dm/homebridge-harmonyhub-plugin.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-harmonyhub-plugin)

> Solves the issue with the `HarmonyHub` connection dying after a while due to `MAX_CLIENTS=6`, also supports the Hub firmware 206 update.

## Install

```sh
npm install -g homebridge-harmonyhub-plugin
```

## Configuration

Add this to your Homebridge `config.json`:

```json
"platforms": [
    {
        "platform": "Harmonyhub",
        "name": "homebridge-harmonyhub-plugin"
    }
]
```

