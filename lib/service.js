
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

Service.prototype.turn = function(on) {
    return this.service
        .getCharacteristic(HomebridgeCharacteristic.On)
        .setValue(on);
}

Service.prototype.handleStateChange = function(done) {
    var self = this
    return new Promise(function(resolve, reject) {
        self.service.getCharacteristic(HomebridgeCharacteristic.On)
            .on('set', function(on, callback, doIgnore) {
                self.log('{Service} turn <' + self.name() + '> <' + (on ? 'on' : 'off') + '>')
                if (!doIgnore) return callback()
                resolve([on ? self.id() : -1, callback])  
            })
            .on('change', done)
    })
}

module.exports = Service
