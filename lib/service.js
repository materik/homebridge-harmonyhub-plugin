
var listeners = {}

function Service(log, service) {
    let self = this
    self.log = log
    self.service = service

    self.log.debug('{Service} <' + self.id() + '> <' + self.name() + '>')
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
    this.log.debug('{Service} set <' + this.name() + '> <' + (on ? 'on' : 'off') + '>')
    this.service.updateCharacteristic(HomebridgeCharacteristic.On, on)
}

Service.prototype.onSetAndGet = function(setCallback, getCallback) {
    var self = this
    
    if (self.hasListener()) return
    listeners[self.id()] = true

    self.service
        .getCharacteristic(HomebridgeCharacteristic.On)
        .on('set', function(on, callback) {
            self.log.info('{Service} turn <' + self.name() + '> <' + (on ? 'on' : 'off') + '>')
            setCallback(on, self.id(), callback)
        })
        .on('get', function(callback) {
            self.log.debug('{Service} update <' + self.name() + '>')
            getCallback(self.id(), callback)
        })
        .on('change', function(change) {
            self.log.debug('{Service} change <' + self.name() + '>')
            self.set(change.newValue)
        })
}

module.exports = Service
