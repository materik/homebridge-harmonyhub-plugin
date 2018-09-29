
function Accessory(log, id, name) {
    var self = this
    self.accessory = new Accessory(name, id)

    self.log("{Accessory} <" + self.name() + ">")

    self.accessory
        .getService(Service.AccessoryInfomation)
        .setCharacteristic(Characteristic.Manufacturer, "Logitech")
        .setCharacteristic(Characteristic.Model, "Harmony")
}

Accessory.prototype.id = function() {
    return self.accessory.uuid_base;
};

Accessory.prototype.name = function() {
    return self.accessory.name;
};

