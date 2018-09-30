
let _ = require('lodash');
let Client = require('@harmonyhub/client').getHarmonyClient;
let Explorer = require('@harmonyhub/discover').Explorer;
let Promise = require('promise')

let Activity = require('./activity')

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
		self.disconnect();
	});
}

HarmonyHub.find = function(log) {
	log('{HarmonyHub} find hubs');

	let explorer = new Explorer(61991);
	return new Promise(function(resolve, reject) {
		explorer.on('update', function (hubs) {
			resolve(hubs);
		});
		explorer.start();
	})
	.then(function(hubs) {
		return _.filter(hubs, function(hub) {
			return hub.ip
		})
	})
	.then(function(hubs) {
		log('{HarmonyHub} Found <' + hubs.length + '> hubs');
		return _.map(hubs, function(hub) {
			return new HarmonyHub(log, hub, explorer)
		})
	})
	.catch(function(err) {
        log.error('{HarmonyHub} find:', err);
        throw err;
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
				self.log('{HarmonyHub} offline <' + self.name() + '>');
				self.disconnect()
			})

			client.on('stateDigest', function(stateDigest) {
				self.log('{HarmonyHub} stateDigest <' + JSON.stringify(stateDigest) + '>');
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

HarmonyHub.prototype.getActivities = function() {
	let self = this;
	return self.client()
		.then(function(client) {
			self.log('{HarmonyHub} get activities');
			return client.getActivities();
		})
		.then(function(activities) {
			return _.filter(activities, function(activity) {
				return activity.id > 0
			})
		})
		.then(function(activities) {
			return _.map(activities, function(activity) {
				return new Activity(self.log, activity)
			})
		})
		.then(function(activities) {
			self.log("{HarmonyHub} Found <" + activities.length + "> activities");
			self.activities = activities
			return activities
		})
		.catch(function(err) {
			self.log.error('{HarmonyHub} getActivities:', err);
			throw err;
		});
}

HarmonyHub.prototype.startActivityWithId = function(activityId) {
	let self = this;
	return self.client()
		.then(function(client) {
			self.log('{HarmonyHub} start activitiy: <' + activityId + '>');
        	return client.startActivity(activityId)
	    })
		.catch(function(err) {
			self.log.error('{HarmonyHub} startActivityWithId:', err);
			throw err;
		});
}

module.exports = HarmonyHub;
