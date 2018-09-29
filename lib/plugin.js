
var _ = require('lodash');

var Accessory = require('./accessory')
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

	self.api.on('didFinishLaunching', function() {
		HarmonyHub.find(log).then(function(harmonyHubs) {
			self.harmonyHubAccessories = _.map(harmonyHubs, function(harmonyHub) {
				return new HarmonyHubAccessory(log, harmonyhub);
			});
		});
	})
}

Plugin.prototype.configureAccessory = function(accessory) {
	if (this.isDisabled) {
		return;
	}

	let accessory = Accessory.cached(accessory)
	this.harmonyHubAccessories.push(HarmonyHubAccessory.cached(accessory))
	this.log('{Plugin} configureAccessory: <' + accessory.name() + '>')
};

module.exports = Plugin;

