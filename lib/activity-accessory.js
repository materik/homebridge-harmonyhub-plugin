
var Accessory = require('./accessory')

function ActivityAccessory(log, activity, accessory) {
	let self = this
	self.log = log
	self.activity = activity
    self.accessory = accessory || new Accessory(log, activity.id(), activity.name())
    
	self.log('{ActivityAccessory} <' + self.id() + '> <' + self.name() + '>');
}

ActivityAccessory.cached = function(log, accessory) {
    log('{ActivityAccessory} cached')
    return new ActivityAccessory(log, null, accessory)
}

ActivityAccessory.prototype.id = function() {
    return this.accessory.id()
}

ActivityAccessory.prototype.name = function() {
    return this.accessory.name()
}

module.exports = ActivityAccessory;
