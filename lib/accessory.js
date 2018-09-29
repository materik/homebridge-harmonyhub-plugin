
function Accessory(log, id, name, accessory) {
    var self = this
    self.accessory = accessory || new HomebridgeAccessory(name, id)

    self.log("{Accessory} <" + self.name() + ">")

    self.accessory
        .getService(HomebridgeService.AccessoryInfomation)
        .setCharacteristic(HomebridgeCharacteristic.Manufacturer, "Logitech")
        .setCharacteristic(HomebridgeCharacteristic.Model, "Harmony")
}

Accessory.cached = function(log, accessory) {
    return new Accessory(log, null, null, accessory)
}

Accessory.prototype.id = function() {
    return self.accessory.uuid_base;
};

Accessory.prototype.name = function() {
    return self.accessory.displayName;
};

