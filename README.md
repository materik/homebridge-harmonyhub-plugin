# homebridge-harmonyhub [![](https://img.shields.io/badge/contact-@thematerik-blue.svg?style=flat-square)](http://twitter.com/thematerik)

[HarmonyHub](http://www.logitech.com/en-us/product/harmony-hub) plugin for [Homebridge](https://github.com/nfarina/homebridge)

# Background

The project started off as a fork of [KraigM/homebridge-harmonyhub](https://github.com/KraigM/homebridge-harmonyhub) as I set out to solve the issue with the `HarmonyHub` connection crashing after a while. However, I ended up refactoring the entire plugin why I made it it's own repository.

# Install

***WARNING: Install on your own risk***

As of `0.1.0` I have "solved" the issue with the `HarmonyHub` connection but I wouldn't recommend anyone to use it yet as a crash of `homebridge` and restarting it with the help of `pm2` is the current solution. It's obviously not any good but it works relyably for me and I, at least, think I know how to solve it in the long run. Hopefully having a new release out soon.

```sh
npm install -g materik/homebridge-harmonyhub#0.1.0
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

# Issues

I have disabled issues for know since I don't want anyone else to use it yet but
as soon as I have a stable release I would love feedback. Thanks for your
patience!

