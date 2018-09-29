
let _ = require('lodash')
let Promise = require('promise')

function Accessory(log, id, name, accessory) {
    let self = this
    self.log = log
    self.accessory = accessory || new HomebridgeAccessory(name, id)

    self.log('{Accessory} <' + self.id() + '> <' + self.name() + '>')

    self.accessory
        .getService(HomebridgeService.AccessoryInformation)
        .setCharacteristic(HomebridgeCharacteristic.Manufacturer, 'Logitech')
        .setCharacteristic(HomebridgeCharacteristic.Model, 'Harmony')
}

Accessory.cached = function(log, accessory) {
    log('{Accessory} cached')
    return new Accessory(log, null, null, accessory)
}

Accessory.prototype.id = function() {
    return this.accessory.UUID;
};

Accessory.prototype.name = function() {
    return this.accessory.displayName;
};

Accessory.prototype.addService = function(fn, service) {
    return this.accessory.addService(fn, service)
}

Accessory.prototype.subAccessories = function() {
    let self = this
    return Promise.resolve(self.accessory.services)
        .then(function(services) {
            return _.filter(services, function(service) {
                return service.displayName
            })
        })
        .then(function(services) {
            return _.map(services, function(service) {
                return Accessory.cached(self.log, service)
            })
        });
};

module.exports = Accessory;

