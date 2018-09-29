
var util = require('util');
var HubConnection = require('./helper/hub-connection.js');
var HubConnectionStatus = HubConnection.ConnectionStatus;
var AccessoryBase = require('./accessory-base').AccessoryBase;

var Service, Characteristic;

module.exports = function(exportedTypes) {
	if (exportedTypes && !Service) {
		Service = exportedTypes.Service;
		Characteristic = exportedTypes.Characteristic;
	}
	return HubAccessoryBase;
};
module.exports.HubAccessoryBase = HubAccessoryBase;

function HubAccessoryBase(accessory, connection, idKey, name, log) {
	if (connection) {
		this.hubId = connection.hubId;
		this.hubInfo = connection.hubInfo;
	} else if (accessory && accessory.context) {
		this.hubId = accessory.context.hubId;
		this.hubInfo = accessory.context.hubInfo;
	}

	var hubName = name || (this.hubInfo && this.hubInfo.friendlyName)
	AccessoryBase.call(this, accessory, this.hubId + idKey, hubName, log);
	
	this.log.info("{HubAccessoryBase} <" + this.hubId + "> <" + hubName + ">")
	this.updateConnection(connection);
}

util.inherits(HubAccessoryBase, AccessoryBase);

HubAccessoryBase.prototype.updateConnection = function(connection) {
	var oldConn = this.connection;
	this.connection = connection;
	this.refreshHubInfo();

	if (oldConn != connection) {
		var self = this;
		if (oldConn) {
			oldConn.removeListener(HubConnection.Events.ConnectionChanged, self._refreshConnection);
		}
		if (connection) {
			connection.addListener(HubConnection.Events.ConnectionChanged, self._refreshConnection);
		}
	}

	this._refreshConnection(connection ? connection.status : null)
};

HubAccessoryBase.prototype._refreshConnection = function(connStatus) {
	var reachable = connStatus != null && connStatus == HubConnectionStatus.Connected;
	this.log("{HubAccessoryBase} Updated reachability of <" + this.hubId + "> to <" + reachable + ">");
	this.accessory.updateReachability(reachable);
};

var setIfNeeded = function(svc, characteristic, value, defaultValue) {
	if (value == null && !svc.testCharacteristic(characteristic)) return;
	svc.setCharacteristic(characteristic, value != null ? value : defaultValue);
};

HubAccessoryBase.prototype.refreshHubInfo = function() {
	var hubInfo = (this.connection && this.connection.hubInfo) || {};

	var ctx = this.accessory.context || (this.accessory.context = {});
	ctx.hubInfo = hubInfo;
	ctx.hubId = this.connection && this.connection.hubId;

	var infoSvc = this.accessory.getService(Service.AccessoryInformation);
	setIfNeeded(infoSvc, Characteristic.FirmwareRevision, hubInfo.current_fw_version, '');
};
