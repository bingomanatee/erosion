var _ = require('lodash');
var SmartBuffer = require('smart-buffer');
var TerrainCell = require('../TerrainCell');
var CONST = require('./../util/const.json');

module.exports = function decodeBounds(data, encoding) {
    if (!encoding) {
        encoding = CONST.encoding;
    }
    var points = [];
    var boundsBuffer = new SmartBuffer(data, encoding);

    while (boundsBuffer.remaining() > 0) {
        var i = boundsBuffer.readInt16LE();
        var j = boundsBuffer.readInt16LE();
        var height = boundsBuffer.readFloatLE();
        var item = new TerrainCell(null, i, j, height, 'bounds');
        points.push(item);
    }

    return points;
};