
function Activity(log, activity, id, name) {
    let self = this;
    self.log = log
    self.activity = activity

    self._id = id || HomebridgeIdentifier.generate(activity.id);
    self._name = name || activity.label;
    
    self.log('{Activity} <' + self.id() + '> <' + self.name() + '>')
}

Activity.fromService = function(log, service) {
    log('{Activity} fromService')
    return new Activity(log, {}, service.subtype, service.displayName)
}

Activity.prototype.id = function() {
    return this._id;
};

Activity.prototype.name = function() {
    return this._name;
};

module.exports = Activity;

