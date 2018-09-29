
var _ = require('lodash');

var ActivityAccessory = require('./activity-accessory');

function HarmonyHubAccessory(log, harmonyHub) {
	var self = this;
	self.log = log;
	self.harmonyHub = harmonyHub
    self.accessory = new Accessory(log, harmonyHub.id(), harmonyHub.name())
	self.activityAccessories = []
    
	self.log('{HarmonyHubAccessory} <' + harmonyHub.name() + '>')

	self.harmonyHub.findActivities().then(function(activities) {
		self.activityAccessories = _.map(activities, function(activity) {
            return new ActivityAccessory(log, activity);
        })
	})
}

module.exports = HarmonyHubAccessory;

