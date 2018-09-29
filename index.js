
var Homebridge = require('./lib/homebridge');

var Service, Characteristic, Accessory, uuid;

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	Accessory = homebridge.hap.Accessory;
	uuid = homebridge.hap.uuid;

	var exportedTypes = {
		Service: homebridge.hap.Service,
		Characteristic: homebridge.hap.Characteristic,
		Accessory: homebridge.hap.Accessory,
		PlatformAccessory: homebridge.platformAccessory,
		uuid: homebridge.hap.uuid
	};
	
	exportedTypes.ActivityAccessory = require('./lib/activity-accessory')(exportedTypes);
	exportedTypes.PlatformAccessory = require('./lib/platform-accessory')(exportedTypes);

	homebridge.registerPlatform("homebridge-harmonyhub", "HarmonyHub", Homebridge(exportedTypes), true);
};
