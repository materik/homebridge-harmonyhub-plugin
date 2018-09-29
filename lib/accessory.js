
function Accessory(log, id, name, accessory) {
    let self = this
    self.log = log
    self.accessory = accessory || new HomebridgeAccessory(name, id)

    self.log('{Accessory} <' + self.id() + '> <' + self.name() + '>')

    self.accessory
        .getService(HomebridgeService.AccessoryInformation)
        .setCharacteristic(HomebridgeCharacteristic.Manufacturer, 'Logitech')
        .setCharacteristic(HomebridgeCharacteristic.Model, 'Harmony')
}

Accessory.cached = function(log, accessory) {
    return new Accessory(log, null, null, accessory)
}

Accessory.prototype.id = function() {
    console.log(JSON.stringify(this.accessory, null, 4))
    return this.accessory.uuid_base;
};

Accessory.prototype.name = function() {
    return this.accessory.displayName;
};

