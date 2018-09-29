
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
		self.log.warn('{Plugin} cannot setup HarmonyHub because config is missing');
		self.isDisabled = true;
		return;
	}

	self.log('{Plugin}')
	self.api.on('didFinishLaunching', function() {
		self.log('{Plugin} didFinishLaunching')
		self.loadHarmonyHubAccessories()
	})
}

Plugin.prototype.loadHarmonyHubAccessories = function() {
	let self = this;
	self.log('{Plugin} loadHarmonyHubAccessories')

	return HarmonyHub.find(self.log)
		.then(function(harmonyHubs) {
			return _.map(harmonyHubs, function(harmonyHub) {
				let accessory = _.find(self.harmonyHubAccessories, function(accessory) {
					return accessory.id() == harmonyHub.id()
				})
				if (accessory) {
					self.log('{Plugin} use cache for <' + accessory.name() + '>')
					accessory.setHarmonyHub(harmonyHub)
					return accessory
				} else {
					return new HarmonyHubAccessory(self.log, harmonyHub);
				}
			});
		})
		.then(function(harmonyHubs) {
			self.harmonyHubAccessories = harmonyHubs
		})
		.catch(function(err) {
			self.log.error('{Plugin} loadHarmonyHubAccessories:', err);
			throw err;
		})
}

Plugin.prototype.configureAccessory = function(accessory) {
	if (this.isDisabled) {
		return;
	}

	let cachedAccessory = Accessory.cached(this.log, accessory)
	let isAlreadyConfigured = _.find(this.harmonyHubAccessories, function(accessory) {
		return accessory.id() == cachedAccessory.id()
	})
	if (isAlreadyConfigured) {
		return this.log('{Plugin} accessory <' + cachedAccessory.name() + '> is already configured')
	}

	this.harmonyHubAccessories.push(HarmonyHubAccessory.cached(this.log, cachedAccessory))
	this.log('{Plugin} configureAccessory: <' + cachedAccessory.name() + '>')
};

module.exports = Plugin;

