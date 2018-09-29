
var util = require('util')

var log = function() {}

function ActivityService(activityAccessory) {
    let self = this
    self.activityAccessory = activityAccessory

    log('{ActivityService} <' + self.id() + '> <' + self.name() + '>')

    HomebridgeService.Switch.call(self, self.name(), self.id())
    
    self.setCharacteristic(HomebridgeCharacteristic.Name, self.name());
}

ActivityService.prototype.id = function() {
    return this.activityAccessory.id()
}

ActivityService.prototype.name = function() {
    return this.activityAccessory.name()
}

module.exports = function(_log) {
    log = _log
    util.inherits(ActivityService, HomebridgeService.Switch)
    ActivityService.prototype.parent = HomebridgeService.Switch
    ActivityService.UUID = HomebridgeService.Switch.UUID
    return ActivityService
}
