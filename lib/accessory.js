
let _ = require('lodash')
let Promise = require('promise')

let Service = require('./service');

function Accessory(log, id, name, isPlatform, accessory) {
    let self = this
    self.log = log
    self.accessory = accessory || 
        (isPlatform ?
            new HomebridgePlatformAccessory(name, id) :
            new HomebridgeAccessory(name, id))

    self.log('{Accessory} <' + self.id() + '> <' + self.name() + '>')

    self.accessory.reachable = true
    self.accessory
        .getService(HomebridgeService.AccessoryInformation)
        .setCharacteristic(HomebridgeCharacteristic.Manufacturer, 'Logitech')
        .setCharacteristic(HomebridgeCharacteristic.Model, 'Harmony')
}

Accessory.fromAccessory = function(log, accessory) {
    log('{Accessory} fromAccessory')
    return new Accessory(log, null, null, null, accessory)
}

Accessory.prototype.id = function() {
    return this.accessory.UUID;
};

Accessory.prototype.name = function() {
    return this.accessory.displayName;
};

Accessory.prototype.addService = function(fn, service) {
    return new Service(this.log, this.accessory.addService(fn, service))
}

Accessory.prototype.getServices = function() {
    let self = this
    return Promise.resolve(self.accessory.services)
        .then(function(services) {
            return _.filter(services, function(service) {
                return service.displayName
            })
        })
};

module.exports = Accessory;
