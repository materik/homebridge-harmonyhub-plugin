
let _ = require('lodash');

let Accessory = require('./accessory')
let HarmonyHub = require('./harmonyhub');
let HarmonyHubAccessory = require('./harmonyhub-accessory');

function Plugin(log, config, api) {
	let self = this;
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
		self.log('{Plugin} didFinishLaunching')

		HarmonyHub.find(log).then(function(harmonyHubs) {
			self.harmonyHubAccessories = _.map(harmonyHubs, function(harmonyHub) {
				let accessory = _.find(self.harmonyHubAccessories, function(accessory) {
					return accessory.id() == harmonyHub.id()
				})
				if (accessory) {
					self.log('{Plugin} use cache for <' + harmonyHub.name() + '>')
					accessory.setHarmonyHub(harmonyHub)
					return accessory
				} else {
					return new HarmonyHubAccessory(log, harmonyhub);
				}
			});
		});
	})
}

Plugin.prototype.configureAccessory = function(accessory) {
	if (this.isDisabled) {
		return;
	}

	let cachedAccessory = Accessory.cached(this.log, accessory)
	this.harmonyHubAccessories.push(HarmonyHubAccessory.cached(this.log, cachedAccessory))
	this.log('{Plugin} configureAccessory: <' + cachedAccessory.name() + '>')
};

module.exports = Plugin;

