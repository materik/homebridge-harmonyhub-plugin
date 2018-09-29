
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
	
	exportedTypes.AccessoryBase = require('./lib/accessory-base')(exportedTypes);
	exportedTypes.ActivityAccessory = require('./lib/activity-accessory')(exportedTypes);
	exportedTypes.Hub = require('./lib/hub')(exportedTypes);
	exportedTypes.HubAccessoryBase = require('./lib/hub-accessory-base')(exportedTypes);

	homebridge.registerPlatform("homebridge-harmonyhub", "HarmonyHub", Homebridge(exportedTypes), true);
};
