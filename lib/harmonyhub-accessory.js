
var _ = require('lodash');

var ActivityAccessory = require('./activity-accessory');

function HarmonyHubAccessory(log, harmonyHub) {
	var self = this;
	self.log = log;
	self.harmonyHub = harmonyHub
	self.activityAccessories = []
	self.log('{HarmonyHubAccessory} <' + harmonyHub.name + '>')

	self.harmonyHub.findActivities().then(function(activities) {
		self.activityAccessories = _.map(activities, new ActivityAccessory)
	})
}

module.exports = HarmonyHubAccessory;

