
var Client = require('@harmonyhub/client').getHarmonyClient;
var promise = require('promise')

function HarmonyHubConnection(log) {
	var self = this;
	self.log = log;
}

module.exports = HarmonyHubConnection;
