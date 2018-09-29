
function Activity(log, activity) {
    var self = this;
    self.log = log
    self.activity = activity
    
    self.log("{Activity} <" + self.name() + ">")
}

Activity.prototype.id = function() {
    return this.activity.id
};

Activity.prototype.name = function() {
    return this.activity.label
};

module.exports = Activity;

