
let _ = require('lodash');
let Promise = require('promise')

let Accessory = require('./accessory');
let ActivityAccessory = require('./activity-accessory');
var ActivityService = require('./activity-service');
var Service = require('./service');

function HarmonyHubAccessory(log, harmonyHub, accessory) {
	let self = this;
	self.log = log;
	self.harmonyHub = harmonyHub
    self.accessory = accessory || new Accessory(log, harmonyHub.id(), harmonyHub.name(), true)
    self.services = []
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
    let self = this
    self.log('{HarmonyHubAccessory} addActivity <' + activity.name() + '>')

    let activityAccessory = new ActivityAccessory(self.log, activity)
    let service = self.accessory.addService(ActivityService(self.log), activityAccessory)

    return new Service(self.log, service)
}

HarmonyHubAccessory.prototype.updateStates = function() {
    let self = this;
    if (!self.services) return;

    self.log('{HarmonyHubAccessory} update states for <' + self.services.length + '> services')

    return self.harmonyHub.client()
        .then(function(client) {
            return client.getCurrentActivity()
        })
        .then(function(activity) {
            return new Activity(self.log, activity)
        })
        .then(function(activity) {
            _.each(self.services, function(service) {
                service.switch(activity.id() == service.id())
            })
        })
        .catch(function(err) {
            self.log.error('{HarmonyHubAccessory} updateStates:', err);
            throw err;
        })
}

HarmonyHubAccessory.prototype.handleStateChanges = function() {
    let self = this;
    if (!self.services) return;

    self.log('{HarmonyHubAccessory} handle switches for <' + self.services.length + '> services')

    _.each(self.services, function(service) {
        self.handleStateChange(service)
    })
}

HarmonyHubAccessory.prototype.handleStateChange = function(service) {
    let self = this
    return new Promise(function(resolve, reject) {
        let c = service.getCharacteristic(HomebridgeCharacteristic.On)
        c.on('set', function(isOn, callback, doIgnore) {
            if (doIgnore) return callback()
            resolve([isOn ? service.subtype : -1, callback])  
        })
    })
    .then(function(res) {
        return Promise.all([self.harmonyHub.client(), res])
    })
    .then(function(res) {
        self.log('{HarmonyHubAccessory} switch', res[1], 'on')
        res[0].startActivity(res[1])
        res[2]()
    })
    .catch(function(err) {
        self.log.error('{HarmonyHubAccessory} handleSwitch:', err);
        throw err;
    })
}

HarmonyHubAccessory.prototype.loadActivityAccessories = function() {
    let self = this;
    return self.accessory
        .getServices()
        .then(function(services) {
            return _.filter(services, ActivityService.isInstance)
        })
        .then(function(services) {
            return _.map(services, function(service) {
                return new Service(self.log, service)
            })
        })
        .then(function(services) {
            self.log('{HarmonyHubAccessory} found', services.length, 'services')
            return services
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
            let oldServices = res[0]
            return Promise.resolve(res[1])
                .then(function(activities) {
                    return _.differenceWith(activities, oldServices, function(activity, service) {
                        return activity.id() == service.id()
                    })
                })
                .then(function(activities) {
                    self.log('{HarmonyHubAccessory} adding', activities.length, 'activities')
                    return _.map(activities, function(activity) {
                        return self.addActivity(activity)
                    })
                })
                .then(function(newServices) {
                    return _.concat(oldServices, newServices)
                })
        })
        .then(function(services) {
            self.services = services
            self.updateStates()
            self.handleStateChanges()
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

