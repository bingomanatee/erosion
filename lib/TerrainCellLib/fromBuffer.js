var SmartBuffer = require('smart-buffer');

module.exports = function (TerrainCell) {
    return function (base, buffer, full) {
        var i = buffer.readInt16LE();
        var j = buffer.readInt16LE();
        var height = buffer.readFloatLE();
        var water = buffer.readFloatLE();
        var sed = buffer.readFloatLE();

        return new TerrainCell(base, i, j, height, water, sed);
    }
};