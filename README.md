# materik/homebridge-harmonyhub

[![](https://img.shields.io/badge/contact-@thematerik-blue.svg?style=flat-square)](http://twitter.com/thematerik)
[![](https://img.shields.io/npm/v/materik/homebridge-harmonyhub.svg?style=flat-square)](https://www.npmjs.com/package/materik/homebridge-harmonyhub)
[![](https://img.shields.io/npm/dm/materik/homebridge-harmonyhub.svg?style=flat-square)](https://www.npmjs.com/package/materik/homebridge-harmonyhub)

> Solves the issue with the `HarmonyHub` connection dying after a while due to `MAX_CLIENTS=6`

## Install

```sh
npm install -g materik/homebridge-harmonyhub#0.5.1
```

## Configuration

Add this to your Homebridge `config.json`:

```json
"platforms": [
    {
        "platform": "HarmonyHub",
        "name": "HarmonyHub"
    }
]
```

