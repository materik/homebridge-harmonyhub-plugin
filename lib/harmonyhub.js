
let _ = require('lodash');
let Client = require('@harmonyhub/client').getHarmonyClient;
let Explorer = require('@harmonyhub/discover').Explorer;
let Promise = require('promise')

let Activity = require('./activity')

let BUSY_TIMEOUT = 5 * 1000 // ms

function HarmonyHub(log, hub, reset) {
	let self = this;
	self.log = log;
	self.hub = hub;
	self.reset = reset;
	self.activities = []
	self.isBusy = false

	self.log.info('{HarmonyHub} <' + self.id() + '> <' + self.name() + '>');
}

HarmonyHub.find = function(log, reset) {
	log.debug('{HarmonyHub} finding hubs');

	let explorer = new Explorer(61991);
	return new Promise(function(resolve, reject) {
		explorer.on('update', resolve);
		explorer.on('offline', function(hub) {
			explorer.stop()
			reject('offline')
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
			return new HarmonyHub(log, hub, reset)
		})
	})
	.catch(function(err) {
        log.error('{HarmonyHub} find:', err);
		reset()
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
		case 'stateChanged':
			self.client().then(function(client) {
				client.on('stateDigest', callback)
			})
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
				self.disconnect()
			})

			self._client = client
			self._clientTask = null
			return client
		})
		.catch(self.handleError.bind(self));
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
			self.log.info('{HarmonyHub} Found <' + activities.length + '> activities:',
				'<' + _.join(_.map(activities, function(activity) { return activity.name() }), ', ') + '>');
			self.activities = activities
			return activities
		})
		.catch(self.handleError.bind(self));
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
		.catch(self.handleError.bind(self));
}

HarmonyHub.prototype.getActiveActivityId = function() {
	let self = this;
	return self.client()
		.then(function(client) {
			return client.getCurrentActivity()
	    })
		.catch(self.handleError.bind(self));
}

HarmonyHub.prototype.isActivityIdActive = function(activityId) {
	let self = this;
	return self.getActiveActivityId()
		.then(function(activeActivityId) {
			return activeActivityId == activityId
		})
		.catch(self.handleError.bind(self));
}

HarmonyHub.prototype.invalidate = function() {
    this.log.debug('{HarmonyHub} invalidate <' + this.name() + '>')
    this.disconnect()
}

HarmonyHub.prototype.handleError = function(err) {
	if (err && err['code'] == 'EHOSTUNREACH') {
		this.log.error('{HarmonyHub} handleError: Host is unreachable');
		this.reset()
	} else {
		this.log.error('{HarmonyHub} handleError:', err);
		this.disconnect()
	}
}

HarmonyHub.prototype.busy = function() {
	let self = this;
	self.isBusy = true
	self.log.debug('{HarmonyHub} is busy');

	setTimeout(function() {
		self.isBusy = false
		self.log.debug('{HarmonyHub} is free');
	}, BUSY_TIMEOUT)
}

module.exports = HarmonyHub;
