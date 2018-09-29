
var _ = require('lodash');
var Explorer = require('@harmonyhub/discover').Explorer;
var Promise = require('promise')

function HarmonyHub(log, hub) {
	var self = this;
	self.log = log;
	self.hub = hub;
	this.connection = new HarmonyHubConnection(self)
	this.activities = []
	self.log('{HarmonyHub} <' + self.name + '>');
}

HarmonyHub.find = function(log) {
	return new Promise(function(resolve, reject) {
		var explorer = new Explorer(61991);
		explorer.on('update', function (hubs) {
			log('{HarmonyHub} Found <' + hubs.length + '> hubs');
			resolve(_.map(hubs, function(hub) {
				return new HarmonyHub(log, hub)
			}));
		});
		explorer.start();
	})
}

HarmonyHub.prototype.name = function() {
    return 'TODO'
};

HarmonyHub.prototype.findActivities = function() {
	var self = this;
	return Promise.all([
		self.connection.getActivities(),
		self.connection.getCurrentActivity()
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
	.catch(function (err) {
		self.log.error('{HarmonyHub} findActivities:', err);
		throw err;
	});
}

module.exports = HarmonyHub;
