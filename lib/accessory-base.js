
var inherit = require('./helper/inherit');

var Accessory, Service, Characteristic, uuid;

module.exports = function(exportedTypes) {
	if (exportedTypes && !Accessory) {
		Accessory = exportedTypes.PlatformAccessory || exportedTypes.Accessory;
		Service = exportedTypes.Service;
		Characteristic = exportedTypes.Characteristic;
		uuid = exportedTypes.uuid;
	}
	return AccessoryBase;
};
module.exports.AccessoryBase = AccessoryBase;

function AccessoryBase(accessory, idKey, name, log) {
	this.log = log;

	if (!accessory) {
		var id = uuid.generate(idKey);
		accessory = new Accessory(name, id);
		accessory.name = name;
		accessory.uuid_base = id;
		if (!accessory.getServices) accessory.getServices = getServices.bind(accessory);
	}
	this.accessory = accessory;

	this.accessory.getService(Service.AccessoryInformation)
		.setCharacteristic(Characteristic.Manufacturer, "Logitech")
		.setCharacteristic(Characteristic.Model, "Harmony");
}

var getServices = function(){
	return this.services;
};
