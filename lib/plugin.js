
var _ = require('lodash');

var HarmonyHub = require('./harmonyhub');
var HarmonyHubAccessory = require('./harmonyhub-accessory');

function Plugin(log, config, api) {
	var self = this;
	self.log = log
	self.config = config
	self.api = api
	self.isDisabled = false
	self.harmonyHubAccessories = []

	if (!self.config) {
		self.log.warn("{Plugin} cannot setup HarmonyHub because config is missing");
		self.isDisabled = true;
		return;
	}

	self.log("{Plugin}")

	HarmonyHub.find(log).then(function(harmonyHubs) {
		self.harmonyHubAccessories = _.map(harmonyHubs, function(harmonyHub) {
			return new HarmonyHubAccessory(log, harmonyhub);
		});
	});
}

