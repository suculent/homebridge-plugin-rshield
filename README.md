# homebridge-plugin-2rshield

This is simple [homebridge](https://github.com/nfarina/homebridge) plugin for ESP8266 Lolin with 24V-6V power breadboard and twin Relay Shield (4 switched 220V outputs).

## Prerequisites

* ESPTool (to load LUA code to ESP8266)
* ESP8266 with NodeMCU firmware
* 2x Relay shields
* Homebridge on local WiFi

## Installation

```
    git clone https://github.com/suculent/homebridge-plugin-2rshield.git
    cd homebridge-plugin-2rshield
    npm install -g .
```

Edit config.lua in the esp8266 folder with your wifi credentials and load all the lua files to your ESP8266 (using ESPTool).

Restart your ESP8266. It should start listening to your MQTT channel. You can test it by sending `ON` or `OFF` to MQTT channel `/relay/4/A` or `/relay/4/B` with default configuration.

Edit your Homebridge configuration based on sample-config.json file.

Restart your homebridge and add the new device.
