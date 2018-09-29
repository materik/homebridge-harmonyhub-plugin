
var Promise = require('bluebird');
var _ = require('lodash');

function HarmonyHub(log, connection) {
	this.log = log;
	this.log.info("{HarmonyHub} <" + (connection ? connection.hubId : "null") + ">")

	this.connection = connection;
}

HarmonyHub.prototype.getActivitiesAsync = function() {
	this.log("{HarmonyHub} getActivitiesAsync");

	var self = this;
	return Promise.all([
		this.connection.invokeAsync(function(client){
			return client.getActivities();
		}),
		this.connection.invokeAsync(function(client){
			return client.getCurrentActivity();
		})
	])
	.bind(this)
	.spread(function (activities, currentActivity) {
		self.log("{HarmonyHub} Found activities: <" + JSON.stringify(activities) + ">, currently running <" + currentActivity && currentActivity.label + ">");
		return [activities, currentActivity]
	})
	.catch(function (err) {
		self.log.error('{HarmonyHub} Unable to get current activity with error', err);
		throw err;
	});
}

module.exports = HarmonyHub;
