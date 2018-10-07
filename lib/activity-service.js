
let util = require('util')

var log = function() {}
var Service = undefined

function ActivityService(activity) {
    let self = this
    self.activity = activity

    log.debug('{ActivityService} <' + self.id() + '> <' + self.name() + '>')

    Service.call(self, self.name(), self.id())
    
    self.setCharacteristic(HomebridgeCharacteristic.Name, self.name());
}

ActivityService.isInstance = function(service) {
    return service instanceof ActivityService ||
        ActivityService.UUID === service.UUID &&
        service.subtype != null;
}

ActivityService.prototype.id = function() {
    return this.activity.id()
}

ActivityService.prototype.name = function() {
    return this.activity.name()
}

module.exports = function(_log) {
    log = _log
    Service = HomebridgeService.Switch

    util.inherits(ActivityService, Service)
    ActivityService.prototype.parent = Service
    ActivityService.UUID = Service.UUID

    return ActivityService
}
