
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Client = require('@harmonyhub/client').getHarmonyClient;
var Queue = require('queue');
var Promise = require('bluebird');
var BluebirdExt = require('./bluebird-ext');

var Events = {
	ConnectionChanged: 'connectionChanged',
	StateDigest: 'stateDigest'
};

var ConnectionStatus = {
	Unknown: 0,
	Connecting: 1,
	Connected: 2,
	PendingConnection: 3,
	Disconnected: 4
};

function HarmonyHubConnection(hubInfo, log, discover) {
	EventEmitter.call(this);

	this.log = log;
	this.log.info("{HarmonyHubConnection}")

	this.hubId = hubInfo.uuid;
	this.hubInfo = hubInfo;
	this._discover = discover;

	var self = this;

	self._discover.on('online', function (info) {
		if (!info || info.uuid != self.hubId) return;
		self._handleConnectionOnline();
	});

	self._discover.on('offline', function (info) {
		if (!info || info.uuid != self.hubId) return;
		self._handleConnectionOffline();
	});
}

util.inherits(HarmonyHubConnection, EventEmitter);

HarmonyHubConnection.createAsync = function(hubInfo, log, discover) {
	var conn = new HarmonyHubConnection(hubInfo, log, discover);
	conn.on('error', (err) => {
		console.error(err);
	});

	return conn.connectAsync(hubInfo)
		.return(conn);
};

HarmonyHubConnection.prototype.connectAsync = function(hubInfo) {
	this.hubInfo = hubInfo;
	this.client = null;
	this.queue = new Queue();
	this.queue.concurrency = 1;
	return this.refreshAsync();
};

HarmonyHubConnection.prototype.disconnectAsync = function() {
	var lastClient = this.client;
	var lastQueue = this.queue;
	this.queue = null;
	this.client = null;
	this._OnConnectionChanged();
	//TODO: Properly cancel running tasks
	if (lastQueue) lastQueue.end();
	if (lastClient) return BluebirdExt.toBlueBird(lastClient.end());
	return Promise.resolve();
};

HarmonyHubConnection.prototype._getClientAsync = function() {
	var client = this.client;
	if (client) {
		return Promise.resolve(client);
	}
	var connTask = this._connTask;
	if (connTask) {
		return connTask;
	}
	var self = this;
	connTask = BluebirdExt.toBlueBird(Client(self.hubInfo.ip))
		.then(function (client) {
			self.log('{HarmonyHubConnection} created new client for hub with uuid ' + self.hubId);

			client._xmppClient.on('offline', self._HandleConnectionOffline.bind(self));

			client.on('stateDigest', function (stateDigest) {
				self.log('{HarmonyHubConnection} got state digest. reemit it');
				self.emit(Events.StateDigest, {
					stateDigest: stateDigest
				});
			});
			self.client = client;
			return client;
		});
	this._connTask = connTask;
	this._OnConnectionChanged();
	return connTask
		.timeout(30 * 1000)
		.finally(function() {
			if (self._connTask == connTask) {
				self._connTask = null;
			}
			self._OnConnectionChanged();
		});
};

Object.defineProperty(HarmonyHubConnection.prototype, 'status', {
	get: function() {
		if (this.client) return ConnectionStatus.Connected;
		if (this._connTask) return ConnectionStatus.Connecting;
		if (this.queue) return ConnectionStatus.PendingConnection;
		if (this.hubInfo) return ConnectionStatus.Disconnected;
		return ConnectionStatus.Unknown;
	}
});

HarmonyHubConnection.prototype._handleConnectionOnline = function() {
	this.log("{HarmonyHubConnection} Hub went online: " + this.hubId);
	return this.refresh();
};

HarmonyHubConnection.prototype._handleConnectionOffline = function() {
	this.log('{HarmonyHubConnection} client for hub ' + this.hubInfo.uuid + ' went offline. re-establish.');
	this.client = undefined;
	return this.refresh();
};

HarmonyHubConnection.prototype.refresh = function() {
	var self = this;
	this.refreshAsync()
		.catch(function(err) {
			self.log(err);
			self._OnConnectionChanged();
		});
};

HarmonyHubConnection.prototype.refreshAsync = function() {
	this._OnConnectionChanged();
	return this.invokeAsync(function(client){
		return client;
	});
};

HarmonyHubConnection.prototype._OnConnectionChanged = function() {
	var last = this._lastStatus;
	var status = this.status;
	if (last == status) return;
	this._lastStatus = status;
	this.emit(Events.ConnectionChanged, status);
};

HarmonyHubConnection.prototype.invokeAsync = function(func) {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.queue.push(resolve);
		startQueueInBackground(self.queue);
	})
	.then(function(cb){
		return self._getClientAsync()
			.then(BluebirdExt.asBlueBird(func))
			.finally(function(){
				setTimeout(cb, 0);
			})
			.catch(function(err){
				throw err;
			});
	});
};

var startQueueInBackground = function(queue) {
	if (queue && !queue.running) {
		setTimeout(queue.start.bind(queue), 0);
	}
};

module.exports = HarmonyHubConnection;
module.exports.HarmonyHubConnection = HarmonyHubConnection;
module.exports.Events = Events;
module.exports.ConnectionStatus = ConnectionStatus;
