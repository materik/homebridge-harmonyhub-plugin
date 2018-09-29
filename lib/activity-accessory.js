
function ActivityAccessory(log, activity) {
	var self = this
	self.log = log
	self.activity = activity
	self.log('{ActivityAccessory} <' + activity.name + '>');
}

module.exports = ActivityAccessory;
