
var _ = require('lodash');
var Explorer = require('@harmonyhub/discover').Explorer;
var Promise = require('promise')

function HarmonyHub(log, hub) {
	var self = this;
	self.log = log;
	self.hub = hub;
	this.connection = []
	this.activities = []
	self.log('{HarmonyHub} ' + JSON.stringify(hub));
}

HarmonyHub.find = function(log) {
	return new Promise(function(resolve, reject) {
		var explorer = new Explorer(61991);
		explorer.on('update', function (hubs) {
			log('{HarmonyHub} Found ' + hubs.length + ' hubs');
			resolve(_.map(hubs, function(hub) {
				return new HarmonyHub(log, hub)
			}));
		});
		explorer.start();
	})
}

HarmonyHub.prototype.name = function() {
    return 'TODO'
};

HarmonyHub.prototype.findActivities = function() {
	// TODO
}

module.exports = HarmonyHub;
