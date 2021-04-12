
let _ = require('lodash');

let Accessory = require('./accessory')
let HarmonyHub = require('./harmonyhub');
let HarmonyHubAccessory = require('./harmonyhub-accessory');

function Plugin(log, config, api) {
	let self = this;
	self.log = log
	self.config = config.config
	self.api = api
	self.isDisabled = false
	self.accessories = []

	if (!config) {
		self.log.warn('{Plugin} cannot setup HarmonyHub because config is missing');
		self.isDisabled = true;
		return;
	}

	self.log.debug('{Plugin}')
	self.api.on('didFinishLaunching', function() {
		self.log.debug('{Plugin} didFinishLaunching')
		self.loadAccessories()
	})
}

Plugin.prototype.reset = function() {
	this.log.warn('{Plugin} reset')
	_.each(this.accessories, function(accessory) {
		accessory.invalidate()
	})
	return this.loadAccessories()
}

Plugin.prototype.loadAccessories = function() {
	let self = this;
	self.log.debug('{Plugin} loadAccessories')

	return HarmonyHub.find(self.log, self.config, self.reset.bind(self))
		.then(function(harmonyHubs) {
			return _.map(harmonyHubs, function(harmonyHub) {
				var accessory = _.find(self.accessories, function(accessory) {
					return accessory.id() == harmonyHub.id()
				})
				if (accessory) {
					self.log.debug('{Plugin} use cache for <' + accessory.name() + '>')
					accessory.setHarmonyHub(harmonyHub)
				} else {
					self.log.info('{Plugin} found a new hub <' + harmonyHub.name() + '>')
					accessory = new HarmonyHubAccessory(self.log, harmonyHub);
				}
				return accessory
			});
		})
		.then(function(accessories) {
			return Promise.resolve(accessories)
				.then(function(accessories) {
					return self.register(accessories)
				})
				.then(function() {
					return accessories
				})
		})
		.then(function(accessories) {
			self.accessories = accessories
		})
		.catch(function(err) {
			self.log.error('{Plugin} loadAccessories:', err);
			throw err;
		})
}

Plugin.prototype.register = function(accessories) {
	let self = this

	return Promise.resolve(accessories)
		.then(function(accessories) {
			return _.filter(accessories, function(harmonyHubAccessory) {
				return !harmonyHubAccessory.isRegistered
			})
		})
		.then(function(accessories) {
			return _.map(accessories, function(harmonyHubAccessory) {
				return harmonyHubAccessory.platformAccessory()
			})
		})
		.then(function(accessories) {
			if (accessories.length == 0) {
				return
			}

			self.log.debug('{Plugin} registering <' + accessories.length + '> platform accessories')
			self.api.registerPlatformAccessories('homebridge-harmonyhub-plugin', 'HarmonyHub', accessories)
			_.each(accessories, function(harmonyHubAccessory) {
				harmonyHubAccessory.isRegistered = true
			})
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

	let cachedAccessory = Accessory.fromAccessory(this.log, accessory)
	let isAlreadyConfigured = _.find(this.accessories, function(accessory) {
		return accessory.id() == cachedAccessory.id()
	})

	if (isAlreadyConfigured) {
		this.log.debug('{Plugin} accessory <' + cachedAccessory.name() + '> is already configured')
	} else {
		this.accessories.push(HarmonyHubAccessory.fromAccessory(this.log, cachedAccessory))
		this.log.debug('{Plugin} configureAccessory: <' + cachedAccessory.name() + '>')
	}
};

module.exports = Plugin;
