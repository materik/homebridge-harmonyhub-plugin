
let _ = require('lodash');
let Promise = require('promise')

let Accessory = require('./accessory');
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
    log('{HarmonyHubAccessory} cached')
    return new HarmonyHubAccessory(log, null, accessory)
}

HarmonyHubAccessory.prototype.id = function() {
    return this.accessory.id()
}

HarmonyHubAccessory.prototype.name = function() {
    return this.accessory.name()
}

HarmonyHubAccessory.prototype.loadActivityAccessories = function() {
    let self = this;
    return self.accessory
        .subAccessories()
        .then(function(accessories) {
            return _.map()
        })
        .then(function(accessories) {
            self.log('{HarmonyHubAccessory} load', accessories.length, 'accessories')
            self.activityAccessories = accessories
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
        return _.differenceWith(res[1], res[0], function(a, b) {
            return a.id() == b.id()
        })
    })
    .then(function(activities) {
        self.log('{HarmonyHubAccessory} added', accessories.length, 'accessories')
        self.activityAccessories = _.concat(self.activityAccessories, _.map(activities, function(activity) {
            return new ActivityAccessory(log, activity);
        }));
    })
}

module.exports = HarmonyHubAccessory;

