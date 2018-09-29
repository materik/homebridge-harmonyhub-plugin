
let _ = require('lodash');
let Client = require('@harmonyhub/client').getHarmonyClient;
let Explorer = require('@harmonyhub/discover').Explorer;
let Promise = require('promise')

function HarmonyHub(log, hub, explorer) {
	let self = this;
	self.log = log;
	self.hub = hub;
	self.explorer = explorer
	self.activities = []
	self.currentActivity = null

	self.log('{HarmonyHub} <' + self.id() + '> <' + self.name() + '> <' + self.ip() + '>');

	self.explorer.on('online', function(hub) {
		if (!hub || hub.uuid != self.id()) return;
		self.log('{HarmonyHub} online <' + self.name() + '>');
		self.connect();
	});

	self.explorer.on('offline', function(hub) {
		if (!hub || hub.uuid != self.id()) return;
		self.log('{HarmonyHub} offline <' + self.name() + '>');
		self.disconnet();
	});
}

HarmonyHub.find = function(log) {
	log('{HarmonyHub} find hubs');

	return new Promise(function(resolve, reject) {
		let explorer = new Explorer(61991);
		explorer.on('update', function (hubs) {
			log('{HarmonyHub} Found <' + hubs.length + '> hubs');
			resolve(_.map(hubs, function(hub) {
				return new HarmonyHub(log, hub, explorer)
			}));
		});
		explorer.start();
	})
}

HarmonyHub.prototype.id = function() {
    return this.hub.uuid;
};

HarmonyHub.prototype.ip = function() {
	return this.hub.ip;
}

HarmonyHub.prototype.name = function() {
    return this.hub.friendlyName;
};

HarmonyHub.prototype.client = function() {
	let self = this;
	if (self._client) {
		return Promise.resolve(self._client)
	}
	return Promise.resolve(Client(self.ip()))
		.then(function(client) {
			self.log('{HarmonyHub} create new client for <' + self.name() + '>')

			client._xmppClient.on('offline', function() {
				self.disconnect()
			})

			self._client = client
			return client
		})
}

HarmonyHub.prototype.connect = function() {
	this.disconnect()
	this.client()
}

HarmonyHub.prototype.disconnect = function() {
	this._client = null;
}

HarmonyHub.prototype.findActivities = function() {
	log('{HarmonyHub} find activities');

	let self = this;
	return Promise.all([
		self.client().then(function(client) {
			return client.getActivities();
		}),
		self.client().then(function(client) { 
			return client.getCurrentActivity()
		})
	])
	.then(function(res) {
		self.log("{HarmonyHub} Found <" + res[0].length + "> activities");
		return [
			_.map(res[0], function(activity) {
				return new Activity(self.log, activity)
			}),
			new Activity(self.log, res[1])
		]
	})
	.then(function(res) {
		self.activities = res[0]
		self.currentActivity = res[1]
		return res
	})
	.catch(function (err) {
		self.log.error('{HarmonyHub} findActivities:', err);
		throw err;
	});
}

module.exports = HarmonyHub;
