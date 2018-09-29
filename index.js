
var Plugin = require('./lib/plugin');

module.exports = function(homebridge) {
    global.Service = homebridge.hap.Service;
    global.Characteristic = homebridge.hap.Characteristic;
    global.Accessory = homebridge.hap.Accessory;
    global.uuid = homebridge.hap.uuid;

	homebridge.registerPlatform("homebridge-harmonyhub", "HarmonyHub", Plugin, true);
};
