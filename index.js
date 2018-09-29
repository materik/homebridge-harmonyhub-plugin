
let Plugin = require('./lib/plugin');

module.exports = function(homebridge) {
    global.HomebridgeService = homebridge.hap.Service;
    global.HomebridgeCharacteristic = homebridge.hap.Characteristic;
    global.HomebridgeAccessory = homebridge.hap.Accessory;
    global.HomebridgeIdentifier = homebridge.hap.uuid;

	homebridge.registerPlatform("homebridge-harmonyhub", "HarmonyHub", Plugin, true);
};
