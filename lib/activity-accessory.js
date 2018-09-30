
var Accessory = require('./accessory')

// TODO: behövs denna, börja med att testa att commentera ut accessory

function ActivityAccessory(log, activity, accessory) {
	let self = this
	self.log = log
	self.activity = activity

    //self.accessory = accessory || new Accessory(log, HomebridgeIdentifier.generate(activity.id()), activity.name())
    
	self.log('{ActivityAccessory} <' + self.id() + '> <' + self.name() + '>');
}

ActivityAccessory.fromAccessory = function(log, accessory) {
    log('{ActivityAccessory} fromAccessory')
    return new ActivityAccessory(log, null, accessory)
}

ActivityAccessory.prototype.id = function() {
    return this.activity.id()
}

ActivityAccessory.prototype.activityId = function() {
    return this.activity.id()
}

ActivityAccessory.prototype.name = function() {
    return this.activity.name()
}

module.exports = ActivityAccessory;
