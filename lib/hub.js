
var Promise = require('bluebird');
var ActivityAccessory = require('./activity-accessory').ActivityAccessory;
var _ = require('lodash');

function Hub(log, connection) {
	this.log = log;
	this.log.info("{Hub} <" + (connection ? connection.hubId : "null") + ">")

	this.connection = connection;
}

Hub.prototype.updateConnection = function(connection) {
	this.log.info("{Hub} updateConnection")

	this.connection = connection;
	_.forEach(this._accessories, function(acc){
		if (acc.updateConnection) acc.updateConnection(connection);
	});
};

Hub.prototype.getAccessoriesAsync = function() {
	this.log.info("{Hub} getAccessoriesAsync")

	if (this._accessories) {
		return Promise.resolve(this._accessories);
	}
	return this.updateAccessoriesAsync();
};

Hub.prototype.updateAccessoriesAsync = function(cachedAccessories) {
	this.log.info("{Hub} updateAccessoriesAsync")

	var self = this;
	var conn = this.connection;

	var activityCachedAcc = _.find(cachedAccessories, function (acc) {
		return acc.context.typeKey = ActivityAccessory.typeKey;
	});
	var activityAcc = _.find(this._accessories, function (a) { return a instanceof ActivityAccessory; });
	if (!activityAcc) activityAcc = new ActivityAccessory(activityCachedAcc, this.log, conn);
	var activityTask = activityAcc.initAsync().return(activityAcc);

	return Promise.all([
			activityTask
		])
		.tap(function(accessories){
			self._accessories = accessories;
		});
};

module.exports = Hub;
