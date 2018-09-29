
var Homebridge = require('./lib/homebridge');
var Service, Characteristic, Accessory, uuid;

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	Accessory = homebridge.hap.Accessory;
	uuid = homebridge.hap.uuid;

	homebridge.registerPlatform("homebridge-harmonyhub", "HarmonyHub", new Homebridge(), true);
};
