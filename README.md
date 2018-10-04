# homebridge-harmonyhub [![](https://img.shields.io/badge/contact-@thematerik-blue.svg?style=flat-square)](http://twitter.com/thematerik)

[HarmonyHub](http://www.logitech.com/en-us/product/harmony-hub) plugin for [Homebridge](https://github.com/nfarina/homebridge)

> Solves the issue with the `HarmonyHub` connection dying after a while due to `MAX_CLIENTS=6`

# Install

```sh
npm install -g materik/homebridge-harmonyhub#0.2.0
```

# Configuration

Add this to your Homebridge `config.json`:

```json
"platforms": [
    {
        "platform": "HarmonyHub",
        "name": "HarmonyHub"
    }
]
```

