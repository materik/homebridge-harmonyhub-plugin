
let _ = require('lodash');
let Promise = require('promise')

let Accessory = require('./accessory');
let ActivityAccessory = require('./activity-accessory');
var ActivityService = require('./activity-service');

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
    log('{HarmonyHubAccessory} cached')
    return new HarmonyHubAccessory(log, null, accessory)
}

HarmonyHubAccessory.prototype.id = function() {
    return this.accessory.id()
}

HarmonyHubAccessory.prototype.name = function() {
    return this.accessory.name()
}

HarmonyHubAccessory.prototype.addActivity = function(activity) {
    this.log('{HarmonyHubAccessory} addActivity <' + activity.name() + '>')

    let activityAccessory = new ActivityAccessory(this.log, activity)
    this.accessory.addService(ActivityService(this.log), activityAccessory)
    this.activityAccessories.push(activityAccessory)
}

HarmonyHubAccessory.prototype.loadActivityAccessories = function() {
    let self = this;
    return self.accessory
        .subAccessories()
        .then(function(accessories) {
            return _.map(accessories, function(accessory) {
                return ActivityAccessory.cached(self.log, accessory)
            })
        })
        .then(function(accessories) {
            self.log('{HarmonyHubAccessory} load', accessories.length, 'accessories')
            return accessories
        })
}

HarmonyHubAccessory.prototype.setHarmonyHub = function(harmonyHub) {
    let self = this;
    self.harmonyHub = harmonyHub
    Promise.all([
        self.loadActivityAccessories(),
        self.harmonyHub.findActivities()
    ])
    .then(function(res) {
        self.activityAccessories = res[0]
        return _.differenceWith(res[1], res[0], function(a, b) {
            return a.id() == b.id()
        })
    })
    .then(function(activities) {
        self.log('{HarmonyHubAccessory} adding', activities.length, 'activities')
        _.each(activities, function(activity) {
            self.addActivity(activity)
        })
    })
    .catch(function(err) {
        self.log.error('{HarmonyHubAccessory} setHarmonyHub:', err);
        throw err;
    })
}

module.exports = HarmonyHubAccessory;

