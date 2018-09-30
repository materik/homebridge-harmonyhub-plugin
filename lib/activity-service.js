
var util = require('util')

var log = function() {}

function ActivityService(activity) {
    let self = this
    self.activity = activity

    log('{ActivityService} <' + self.id() + '> <' + self.name() + '>')

    HomebridgeService.Switch.call(self, self.name(), self.id())
    
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

    util.inherits(ActivityService, HomebridgeService.Switch)
    ActivityService.prototype.parent = HomebridgeService.Switch
    ActivityService.UUID = HomebridgeService.Switch.UUID

    return ActivityService
}
