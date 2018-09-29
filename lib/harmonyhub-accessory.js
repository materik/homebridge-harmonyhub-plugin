
let _ = require('lodash');

let ActivityAccessory = require('./activity-accessory');

function HarmonyHubAccessory(log, harmonyHub, accessory) {
	let self = this;
	self.log = log;
	self.harmonyHub = harmonyHub
    self.accessory = accessory || new Accessory(log, harmonyHub.id(), harmonyHub.name())
	self.activityAccessories = []
    
	self.log('{HarmonyHubAccessory} <' + self.id() + '> <' + self.name() + '>')

    if (self.harmonyHub) {
        self.setHarmonyHub(self.harmonyHub)
    }
}

HarmonyHubAccessory.cached = function(log, accessory) {
    return new HarmonyHubAccessory(log, null, accessory)
}

HarmonyHubAccessory.prototype.id = function() {
    return this.accessory.id()
}

HarmonyHubAccessory.prototype.name = function() {
    return this.accessory.name()
}

HarmonyHubAccessory.prototype.setHarmonyHub = function(harmonyHub) {
    var self = this;
    self.harmonyHub = harmonyHub
    self.harmonyHub.findActivities().then(function(activities) {
        self.activityAccessories = _.map(activities, function(activity) {
            return new ActivityAccessory(log, activity);
        })
    })
}

module.exports = HarmonyHubAccessory;

