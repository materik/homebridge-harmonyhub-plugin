
var listeners = {}

function Service(log, service) {
    let self = this
    self.log = log
    self.service = service

    self.log('{Service} <' + self.id() + '> <' + self.name() + '>')
}

Service.prototype.id = function() {
    return this.service.subtype
}

Service.prototype.name = function() {
    return this.service.displayName;
}

Service.prototype.hasListener = function() {
    return listeners[this.id()]
}

Service.prototype.set = function(on) {
    this.log('{Service} set <' + this.name() + '> <' + (on ? 'on' : 'off') + '>')
    this.service.updateCharacteristic(HomebridgeCharacteristic.On, on)
}

Service.prototype.onSetAndGet = function(setCallback, getCallback) {
    var self = this
    
    if (self.hasListener()) return
    listeners[self.id()] = true

    self.service
        .getCharacteristic(HomebridgeCharacteristic.On)
        .on('set', function(on, callback) {
            self.log('{Service} turn <' + self.name() + '> <' + (on ? 'on' : 'off') + '>')
            setCallback(on, self.id(), callback)
        })
        .on('get', function(callback) {
            self.log('{Service} update <' + self.name() + '>')
            getCallback(self.id(), callback)
        })
        .on('change', function(change) {
            self.log('{Service} change <' + self.name() + '>')
            self.set(change.newValue)
        })
}

module.exports = Service
