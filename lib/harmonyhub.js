
var Explorer = require('@harmonyhub/discover').Explorer;
var Promise = require('promise')

function HarmonyHub(info) {
	this.connection = []
	this.activities = []
}

HarmonyHub.find = function() {
	return new Promise(function(resolve, reject) {
		var explorer = new Explorer(61991);
		explorer.on('update', function (hubs) {
			self.log('{HarmonyHub} Discovered ' + hubs.length + ' hubs');
			resolve(_.map(hubs, new HarmonyHub));
		});
		explorer.start();
	})
}

module.exports = HarmonyHub;
