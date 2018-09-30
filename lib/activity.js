
function Activity(log, activity) {
    let self = this;
    self.log = log
    self.activity = activity
    
    self.log('{Activity} <' + self.id() + '> <' + self.name() + '>')
}

Activity.prototype.id = function() {
    return this.activity.id;
};

Activity.prototype.name = function() {
    return this.activity.label;
};

module.exports = Activity;

