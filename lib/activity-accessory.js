
function ActivityAccessory(log, activity) {
	let self = this
	self.log = log
	self.activity = activity
    self.accessory = new Accessory(log, activity.id(), activity.name())
    
	self.log('{ActivityAccessory} <' + activity.id() + '> <' + activity.name() + '>');
}

module.exports = ActivityAccessory;
