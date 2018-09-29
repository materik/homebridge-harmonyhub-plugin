
let _ = require('lodash');
let Promise = require('promise')

let Accessory = require('./accessory');
let ActivityAccessory = require('./activity-accessory');
var ActivityService = require('./activity-service');

function HarmonyHubAccessory(log, harmonyHub, accessory) {
	let self = this;
	self.log = log;
	self.harmonyHub = harmonyHub
    self.accessory = accessory || new Accessory(log, harmonyHub.id(), harmonyHub.name(), true)
	self.activityAccessories = []
    self.isRegistered = false
    
	self.log('{HarmonyHubAccessory} <' + self.id() + '> <' + self.name() + '>')

    if (self.harmonyHub) {
        self.setHarmonyHub(self.harmonyHub)
    }
}

HarmonyHubAccessory.fromAccessory = function(log, accessory) {
    log('{HarmonyHubAccessory} fromAccessory')
    var accessory = new HarmonyHubAccessory(log, null, accessory)
    accessory.isRegistered = true
    return accessory
}

HarmonyHubAccessory.prototype.id = function() {
    return this.accessory.id()
}

HarmonyHubAccessory.prototype.name = function() {
    return this.accessory.name()
}

HarmonyHubAccessory.prototype.platformAccessory = function() {
    return this.accessory.accessory;
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
        .getServices()
        .then(function(services) {
            return _.filter(services, ActivityService.isInstance)
        })
        .then(function(services) {
            self.log('{HarmonyHubAccessory} found', services.length, 'services')
            return _.map(services, function(service) {
                return ActivityAccessory.fromService(self.log, service)
            })
        })
        .then(function(activityAccessories) {
            self.activityAccessories = activityAccessories
            return activityAccessories
        })
        .catch(function(err) {
            self.log.error('{HarmonyHubAccessory} loadActivityAccessories:', err);
            throw err;
        })
}

HarmonyHubAccessory.prototype.loadActivities = function() {
    let self = this;
    return Promise.all([
            self.loadActivityAccessories(),
            self.harmonyHub.findActivities()
        ])
        .then(function(res) {
            return _.differenceWith(res[1], self.activityAccessories, function(a, b) {
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
            self.log.error('{HarmonyHubAccessory} loadActivities:', err);
            throw err;
        })
}

HarmonyHubAccessory.prototype.setHarmonyHub = function(harmonyHub) {
    this.harmonyHub = harmonyHub
    return this.loadActivities()
}

module.exports = HarmonyHubAccessory;

