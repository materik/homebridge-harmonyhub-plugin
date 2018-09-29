
var HarmonyHub = require('./harmonyhub');
var HarmonyHubAccessory = require('./harmonyhub-accessory');

function Plugin(homebridge) {
	var self = this;
	self.harmonyHubAccessories = []

	var Service = homebridge.hap.Service;
	var Characteristic = homebridge.hap.Characteristic;
	var Accessory = homebridge.hap.Accessory;
	var uuid = homebridge.hap.uuid;

	HarmonyHub.find().then(function(harmonyHubs) {
		self.harmonyHubAccessories = _.map(harmonyHubs, new HarmonyHubAccessory);
	})
}

