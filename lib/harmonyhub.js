
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
	self.isBusy = false

	self.log.info('{HarmonyHub} <' + self.id() + '> <' + self.name() + '>');

	self.explorer.on('online', function(hub) {
		if (!hub || hub.uuid != self.id()) return;
		self.log.warn('{HarmonyHub} online <' + self.name() + '>');
		self.connect();
	});

	self.explorer.on('offline', function(hub) {
		if (!hub || hub.uuid != self.id()) return;
		self.log.warn('{HarmonyHub} offline <' + self.name() + '>');
		self.disconnect();
	});
}

// TODO(materik):
// * handle explorer events online and offline
// * make it possible to run this again
HarmonyHub.find = function(log) {
	log.debug('{HarmonyHub} finding hubs');

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
		log.info('{HarmonyHub} Found <' + hubs.length + '> hubs');
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

HarmonyHub.prototype.on = function(key, callback) {
	let self = this
	switch (key) {
		case 'connectionChanged':
			self.explorer.on('online', callback);
			break;
		case 'stateChanged':
			var stateDigest = function() {
				self.client().then(function(client) {
					client.on('stateDigest', callback)
				})
			}

			stateDigest()
			self.explorer.on('online', function() {
				stateDigest()
			});
			break;
		default:
			self.log.warn('{HarmonyHub} unhandled event <' + key + '>')
			break;
	}
}

HarmonyHub.prototype.client = function() {
	let self = this;
	if (self._client) {
		return Promise.resolve(self._client)
	}
	if (self._clientTask) {
		return self._clientTask
	}
	self._clientTask = Promise.resolve(Client(self.ip()))
		.then(function(client) {
			self.disconnect()
			self.log.info('{HarmonyHub} create new client for <' + self.name() + '>')

			client._xmppClient.on('offline', function() {
				self.log.warn('{HarmonyHub} offline <' + self.name() + '>');
				self.disconnect()
			})

			self._client = client
			self._clientTask = null
			return client
		})
        .catch(function(err) {
            self.log.error('{HarmonyHub} client:', err);
            self.disconnect()
            throw err;
        })
    return self._clientTask
}

HarmonyHub.prototype.connect = function() {
	this.disconnect()
	this.client()
}

HarmonyHub.prototype.disconnect = function() {
	var client = this._client
	this._client = null;

	if (client) {
		client.end()
	} else {
		this.client()
	}
}

HarmonyHub.prototype.getActivities = function() {
	let self = this;
	return self.client()
		.then(function(client) {
			self.log.debug('{HarmonyHub} get activities');
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
			self.log.info("{HarmonyHub} Found <" + activities.length + "> activities: <" + activities + ">");
			self.activities = activities
			return activities
		})
		.catch(function(err) {
			self.log.error('{HarmonyHub} getActivities:', err);
			self.disconnect()
			throw err;
		});
}

HarmonyHub.prototype.setActivityWithId = function(on, activityId) {
	return this.startActivityWithId(on ? activityId : -1)
}

HarmonyHub.prototype.startActivityWithId = function(activityId) {
	let self = this;

	if (self.isBusy) return Promise.resolve()
	self.busy()

	return self.client()
		.then(function(client) {
			if (activityId > 0) {
				self.log.info('{HarmonyHub} start activitiy: <' + activityId + '>');
			} else {
				self.log.info('{HarmonyHub} stop activities');
			}
        	client.startActivity(activityId)
	    })
		.catch(function(err) {
			self.log.error('{HarmonyHub} startActivityWithId:', err);
			self.disconnect()
			throw err;
		});
}

HarmonyHub.prototype.getActiveActivityId = function() {
	let self = this;
	return self.client()
		.then(function(client) {
			return client.getCurrentActivity()
	    })
		.catch(function(err) {
			self.log.error('{HarmonyHub} getActiveActivity:', err);
			self.disconnect()
			throw err;
		});
}

HarmonyHub.prototype.isActivityIdActive = function(activityId) {
	let self = this;
	return self.getActiveActivityId()
		.then(function(activeActivityId) {
			return activeActivityId == activityId
		})
		.catch(function(err) {
			self.log.error('{HarmonyHub} isActivityIdActive:', err);
			throw err;
		});
}

HarmonyHub.prototype.busy = function() {
	let self = this;
	self.isBusy = true
	self.log.debug('{HarmonyHub} is busy');

	setTimeout(function() {
		self.isBusy = false
		self.log.debug('{HarmonyHub} is free');
	}, 5000)
}

module.exports = HarmonyHub;
