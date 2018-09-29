
var Plugin = require('./lib/plugin');

module.exports = function(homebridge) {
    // TODO
    var Service = homebridge.hap.Service;
    var Characteristic = homebridge.hap.Characteristic;
    var Accessory = homebridge.hap.Accessory;
    var uuid = homebridge.hap.uuid;

	homebridge.registerPlatform("homebridge-harmonyhub", "HarmonyHub", Plugin, true);
};
