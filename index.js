
var Plugin = require('./lib/plugin');

module.exports = function(homebridge) {
	homebridge.registerPlatform("homebridge-harmonyhub", "HarmonyHub", new Plugin(homebridge), true);
};
