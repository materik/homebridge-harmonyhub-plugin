
var util = require('util');

module.exports = { };

var mixin = function(Class, MixinClass, doOverride) {
	var mixinMethods = MixinClass.prototype || MixinClass;
	var cls = Class.prototype || Class;
	for (var mn in mixinMethods) {
		if (!doOverride && cls[mn] != undefined) return;
		cls[mn] = mixinMethods[mn];
	}
};

module.exports.changeBase = function(Class, BaseClass) {
	var orig = Class.prototype;
	util.inherits(Class, BaseClass);
	Class.prototype.parent = BaseClass.prototype;
	mixin(Class, orig, true);
};
