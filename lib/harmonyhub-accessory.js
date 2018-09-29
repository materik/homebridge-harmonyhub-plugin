
let _ = require('lodash');

let ActivityAccessory = require('./activity-accessory');

function HarmonyHubAccessory(log, harmonyHub, accessory) {
	let self = this;
	self.log = log;
	self.harmonyHub = harmonyHub
    self.accessory = accessory || new Accessory(log, harmonyHub.id(), harmonyHub.name())
	self.activityAccessories = []
    
	self.log('{HarmonyHubAccessory} <' + self.name() + '>')

    if (self.harmonyHub) {
        self.setHarmonyHub(self.harmonyHub)
    }
}

HarmonyHubAccessory.cached = function(log, accessory) {
    return new HarmonyHubAccessory(log, null, accessory)
}

HarmonyHubAccessory.prototype.id = function() {
    return self.accessory.id()
}

HarmonyHubAccessory.prototype.name = function() {
    return self.accessory.name()
}

HarmonyHubAccessory.prototype.setHarmonyHub = function(harmonyHub) {
    self.harmonyHub = harmonyHub
    self.harmonyHub.findActivities().then(function(activities) {
        self.activityAccessories = _.map(activities, function(activity) {
            return new ActivityAccessory(log, activity);
        })
    })
}

module.exports = HarmonyHubAccessory;

