var _ = require('lodash');
var SmartBuffer = require('smart-buffer');
var TerrainCell = require('../TerrainCell');

module.exports = function decodeBounds(data) {

    var points = [];
    var boundsBuffer = new SmartBuffer(data);

    while (boundsBuffer.remaining() > 0) {
        var i = boundsBuffer.readInt16LE();
        var j = boundsBuffer.readInt16LE();
        var height = boundsBuffer.readFloatLE();
        var item = new TerrainCell(null, i, j, height, true);
        points.push(item);
    }

    return points;
};