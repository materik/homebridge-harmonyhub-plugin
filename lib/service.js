
function Service(log, service) {
    let self = this
    self.log = log
    self.service = service
    self.hasListener = false

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

Service.prototype.on = function(key, callback) {
    var self = this
    switch (key) {
        case 'stateChanged':
            if (self.hasListener) {
                return
            }

            self.hasListener = true
            self.service
                .getCharacteristic(HomebridgeCharacteristic.On)
                .on('set', function(on, done) {
                    self.log('{Service} turn <' + self.name() + '> <' + (on ? 'on' : 'off') + '>')
                    if (!done) return

                        self.log.warn(self.service)

                    callback(on ? self.id() : -1, done)
                })
            break;
        default:
            self.log.warn('{HarmonyHub} unhandled event <' + key + '>')
            break;
    }
}

module.exports = Service
