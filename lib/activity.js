
function Activity(log, activity) {
    var self = this;
    self.log = log
    self.activity = activity
    self.log("{Activity} <" + self.name + ">")
}

Activity.prototype.name = function() {
    return 'TODO'
};

module.exports = Activity;

