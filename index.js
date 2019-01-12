
let Plugin = require('./lib/plugin');

module.exports = function(homebridge) {
    global.HomebridgeAccessory = homebridge.hap.Accessory;
    global.HomebridgeCharacteristic = homebridge.hap.Characteristic;
    global.HomebridgeIdentifier = homebridge.hap.uuid;
    global.HomebridgePlatformAccessory = homebridge.platformAccessory;
    global.HomebridgeService = homebridge.hap.Service;

    homebridge.registerPlatform("homebridge-harmonyhub-plugin", "HarmonyHub", Plugin, true);
};
