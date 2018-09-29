
var Discover = require('@harmonyhub/discover').Explorer;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var Hub = require('./hub');
var Connection = require('./helper/hub-connection');
var AccessoryBase = require('./accessory-base').AccessoryBase;

var Events = {
	DiscoveredHubs: 'discoveredHubs'
};

module.exports = function() {
	return Homebridge;
};
module.exports.Events = Events;
module.exports.Homebridge = Homebridge;

var singleton = null;

function Homebridge(log, config, api) {
	EventEmitter.call(this);

	this.log = log;

	if (!config) {
		this.log.warn("{Homebridge} cannot use HarmonyHub because config is missing");
		this.disabled = true;
		return;
	}

	this.log.info("{Homebridge} " + JSON.stringify(config));

	if (singleton) {
		this.log.warn("{Homebridge} singleton has already been created");
		this.disabled = true;
		return;
	} else {
		singleton = this
	}

	var self = this;
	self._discoveredHubs = [];
	self._cachedAccessories = [];
	self._hubs = {};
	self._hubIndex = [];
	self._isInitialized = false;
	self._autoAddNewHubs = false;

	self._discover = new Discover(61991);
	self._discover.on('update', function (hubs) {
		self.log('{Homebridge} received update event from harmonyhubjs-discover. there are ' + hubs.length + ' hubs');
		self._discoveredHubs = hubs;
		_.forEach(self._discoveredHubs, self._handleDiscoveredHubAsync.bind(self));
		self.emit(Events.DiscoveredHubs, hubs);
	});
	self._discover.start();

	if (api) {
		self._api = api;
		self._api.on('didFinishLaunching', self._finishInitialization.bind(self));
	}
}
util.inherits(Homebridge, EventEmitter);

Homebridge.prototype._finishInitialization = function() {
	var self = this;
	return this._finishInitializationAsync()
		.catch(function(err) {
			self.log.error('{Homebridge} Error finishing initialization of HarmonyHub: ' + (err ? (err.stack || err.message || err) : err));
		});
};

Homebridge.prototype._finishInitializationAsync = function() {
	this.log("{Homebridge} Finalizing Plugin Launch");

	var self = this;
	return Promise
		.map(self._cachedAccessories, function(acc) {
			acc.updateReachability(false);
			var hubId = acc && acc.context && acc.context.hubId;
			if (!hubId) return;
			var hub = self._hubs[hubId];
			if (hub) return;
			hub = new Hub(self.log);
			self._hubs[hubId] = hub;
			self._hubIndex.push(hubId);
			return self._refreshHubAccessoriesAsync(hubId, hub, false);
		})
		.then(function(){
			self._autoAddNewHubs = true;
			return this._discoveredHubs || [];
		})
		.map(self._handleDiscoveredHubAsync.bind(self))
		.then(function() {
			self._isInitialized = true;
		});
};

Homebridge.prototype._handleDiscoveredHubAsync = function(hubInfo) {
	if (!this._autoAddNewHubs) return;

	var hubId = hubInfo.uuid;
	if (!hubId) return;

	var hub = this._hubs[hubId];
	if (hub && hub.connection) return;

	var conn = new Connection(hubInfo, this.log, this._discover);
	if (!hub) {
		hub = new Hub(this.log, conn);
		this._hubs[hubId] = hub;
		this._hubIndex.push(hubId);
	} else {
		hub.updateConnection(conn);
	}

	return conn.connectAsync(hubInfo)
		.then(this._refreshHubAccessoriesAsync.bind(this, hubId, hub, true));
};

Homebridge.prototype._refreshHubAccessoriesAsync = function(hubId, hub, doRegister) {
	var self = this;
	var cachedAccList = _.filter(self._cachedAccessories, function(acc) {
		return acc && acc.context && acc.context.hubId == hubId;
	});
	var task = hub.updateAccessoriesAsync(cachedAccList);
	if (doRegister) {
		task = task
			.tap(function(accList) {
				if (!self._api) return;
				accList = _.map(accList, function(acc) {
					return (acc instanceof AccessoryBase) ? acc.accessory : acc;
				});

				var oldAccList = _.difference(cachedAccList, accList);
				var newAccList = _.difference(accList, cachedAccList);

				self.log("{Homebridge} Already registered accessories: " + JSON.stringify(oldAccList));
				self.log("{Homebridge} Register platform accessories: " + JSON.stringify(newAccList));
				self._api.registerPlatformAccessories("homebridge-harmonyhub", "HarmonyHub", newAccList);
			});
	}
	return task;
};

Homebridge.prototype.configureAccessory = function(accessory) {
	if (singleton && singleton != this) {
		return singleton.configureAccessory(accessory)
	}
	if (this.disabled) {
		return false;
	}

	this.log("{Homebridge} Configure Accessory: " + accessory.displayName);
	this._cachedAccessories.push(accessory);
};
