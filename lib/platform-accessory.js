
var util = require('util');
var HubConnection = require('./harmonyhub-connection.js');
var HubConnectionStatus = HubConnection.ConnectionStatus;

var Service, Characteristic;

module.exports = function(exportedTypes) {
	if (exportedTypes && !Service) {
		Service = exportedTypes.Service;
		Characteristic = exportedTypes.Characteristic;
	}
	return PlatformAccessory;
};
module.exports.PlatformAccessory = PlatformAccessory;

function PlatformAccessory(accessory, connection, idKey, name, log) {
	if (connection) {
		this.hubId = connection.hubId;
		this.hubInfo = connection.hubInfo;
	} else if (accessory && accessory.context) {
		this.hubId = accessory.context.hubId;
		this.hubInfo = accessory.context.hubInfo;
	}
	var hubName = name || (this.hubInfo && this.hubInfo.friendlyName)

	this.log = log;
	this.log.info("{PlatformAccessory} <" + hubName + ">");

	if (!accessory) {
		var id = uuid.generate(idKey);
		accessory = new Accessory(name, id);
		accessory.name = name;
		accessory.uuid_base = id;
	}

	this.accessory = accessory;
	this.accessory.getService(Service.AccessoryInformation)
		.setCharacteristic(Characteristic.Manufacturer, "Logitech")
		.setCharacteristic(Characteristic.Model, "Harmony");

	this._refreshConnection = refreshConnection.bind(this);
	this.updateConnection(connection);
}

PlatformAccessory.prototype.updateConnection = function(connection) {
	this.log.info("{PlatformAccessory} updateConnection");

	var oldConn = this.connection;
	this.connection = connection;
	this.refreshHubInfo();

	if (oldConn != connection) {
		if (oldConn) {
			oldConn.removeListener(HubConnection.Events.ConnectionChanged, this._refreshConnection);
		}
		if (connection) {
			connection.addListener(HubConnection.Events.ConnectionChanged, this._refreshConnection);
		}
	}

	this._refreshConnection(connection ? connection.status : null)
};

var refreshConnection = function(connStatus) {
	var reachable = connStatus != null && connStatus == HubConnectionStatus.Connected;
	this.log("{PlatformAccessory} Updated reachability of <" + this.hubId + "> to <" + reachable + ">");
	this.accessory.updateReachability(reachable);
};

var setIfNeeded = function(svc, characteristic, value, defaultValue) {
	if (value == null && !svc.testCharacteristic(characteristic)) return;
	svc.setCharacteristic(characteristic, value != null ? value : defaultValue);
};

PlatformAccessory.prototype.refreshHubInfo = function() {
	this.log.info("{PlatformAccessory} refreshHubInfo");

	var hubInfo = (this.connection && this.connection.hubInfo) || {};

	var ctx = this.accessory.context || (this.accessory.context = {});
	ctx.hubInfo = hubInfo;
	ctx.hubId = this.connection && this.connection.hubId;

	var infoSvc = this.accessory.getService(Service.AccessoryInformation);
	setIfNeeded(infoSvc, Characteristic.FirmwareRevision, hubInfo.current_fw_version, '');
};
