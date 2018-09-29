
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

Service.prototype.switch = function(isOn) {
    self.log('{Service} switch <' + self.name() + '> <' + isOn ? 'on' : 'off' + '>')

    return this.service
        .getCharacteristic(HomebridgeCharacteristic.On)
        .setValue(isOn, null, true);
}

module.exports = Service
