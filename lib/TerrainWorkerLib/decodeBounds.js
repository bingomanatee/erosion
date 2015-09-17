var _ = require('lodash');
var SmartBuffer = require('smart-buffer');
var TerrainCell = require('../TerrainCell');
var CONST = require('./../util/const.json');

module.exports = function decodeBounds(data) {
    var points = [];
    if (typeof data === 'string'){
        data = new Buffer(data, CONST.encoding);
    }
    var boundsBuffer = new SmartBuffer(data, CONST.encoding);

    while (boundsBuffer.remaining() > 0) {
        var item = new TerrainCell(null,0, 0, 0, 'bounds');
        item.bufferToData(boundsBuffer, true);
        points.push(item);
    }

    return points;
};