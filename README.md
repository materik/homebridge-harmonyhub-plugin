# homebridge-harmonyhub [![](https://img.shields.io/badge/contact-@thematerik-blue.svg?style=flat-square)](http://twitter.com/thematerik)

[HarmonyHub](http://www.logitech.com/en-us/product/harmony-hub) plugin for [Homebridge](https://github.com/nfarina/homebridge)

> Solves the issue with the `HarmonyHub` connection dying after a while due to `MAX_CLIENTS=6`

**NOTE:** I mainly wrote this package for my own benefit, but if it works well for you too, you're very welcome to use it. I'm also happy to respond to issues but if I'm not experiencing the same problem you're having with my setup, it's going to take a while before I get to it. I'm really sorry for that. PRs are instead encouraged.

# Install

```sh
npm install -g materik/homebridge-harmonyhub#0.4.0
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
