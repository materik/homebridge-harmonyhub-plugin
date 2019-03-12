# homebridge-harmonyhub-plugin

[![](https://img.shields.io/badge/contact-@thematerik-blue.svg?style=flat-square)](http://twitter.com/thematerik)
[![](https://img.shields.io/npm/v/homebridge-harmonyhub-plugin.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-harmonyhub-plugin)
[![](https://img.shields.io/npm/dm/homebridge-harmonyhub-plugin.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-harmonyhub-plugin)

## Features

* Makes all your `HarmonyHub` activities available in `HomeKit`
* Solves the issue with the `HarmonyHub` connection dying after a while due to `MAX_CLIENTS=6`
* Supports the `HarmonyHub` firmware 250 update
* Currently relies on `WebSockets` and not `XMPP`

## Install

```sh
npm install -g homebridge-harmonyhub-plugin
```

## Configuration

Add this to your Homebridge `config.json` file:

```json
"platforms": [
    {
        "platform": "HarmonyHub",
        "name": "homebridge-harmonyhub-plugin",

        // Optional
        "config": {

            // Pass options to the HarmonyHub explorer function
            "explorer": {
                "options": {
                    "ip": "255.255.255.255"
                    // ...
                }
            }
        }
    }
]
```

