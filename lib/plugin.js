
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
				var accessory = _.find(self.harmonyHubAccessories, function(accessory) {
					return accessory.id() == harmonyHub.id()
				})
				if (accessory) {
					self.log('{Plugin} use cache for <' + accessory.name() + '>')
					accessory.setHarmonyHub(harmonyHub)
				} else {
					accessory = new HarmonyHubAccessory(self.log, harmonyHub);
				}
				return accessory
			});
		})
		.then(function(harmonyHubAccessories) {
			return Promise.resolve(harmonyHubAccessories)
				.then(function(harmonyHubAccessories) {
					return self.register(harmonyHubAccessories)
				})
				.then(function() {
					return harmonyHubAccessories
				})
		})
		.then(function(harmonyHubAccessories) {
			self.harmonyHubAccessories = harmonyHubAccessories
		})
		.catch(function(err) {
			self.log.error('{Plugin} loadHarmonyHubAccessories:', err);
			throw err;
		})
}

Plugin.prototype.register = function(harmonyHubAccessories) {
	let self = this
	self.log('{Plugin} registering', harmonyHubAccessories.length, 'platform accessories')

	return Promise.resolve(harmonyHubAccessories)
		.then(function(harmonyHubAccessories) {
			return _.filter(harmonyHubAccessories, function(harmonyHubAccessory) {
				return !harmonyHubAccessory.isRegistered
			})
		})
		.then(function(harmonyHubAccessories) {
			return _.map(harmonyHubAccessories, function(harmonyHubAccessory) {
				return harmonyHubAccessory.platformAccessory()
			})
		})
		.then(function(accessories) {
			return self.api.registerPlatformAccessories("homebridge-harmonyhub", "HarmonyHub", accessories)
		})
		.catch(function(err) {
			self.log.error('{Plugin} register:', err);
			throw err;
		})
}

Plugin.prototype.configureAccessory = function(accessory) {
	if (this.isDisabled) {
		return;
	}

	let cachedAccessory = Accessory.loadAccessory(this.log, accessory)
	let isAlreadyConfigured = _.find(this.harmonyHubAccessories, function(accessory) {
		return accessory.id() == cachedAccessory.id()
	})
	if (isAlreadyConfigured) {
		return this.log('{Plugin} accessory <' + cachedAccessory.name() + '> is already configured')
	}

	this.harmonyHubAccessories.push(HarmonyHubAccessory.loadAccessory(this.log, cachedAccessory))
	this.log('{Plugin} configureAccessory: <' + cachedAccessory.name() + '>')
};

module.exports = Plugin;

