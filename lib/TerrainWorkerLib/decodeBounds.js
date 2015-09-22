var _ = require('lodash');
var SmartBuffer = require('smart-buffer');
var TerrainCell = require('../TerrainCell');
var CONST = require('./../util/const.json');

module.exports = function decodeBounds(buffer) {
    var points = [];
    var boundsBuffer = new SmartBuffer(buffer, CONST.encoding);
    console.log('decodeBounds: buffer:', buffer, boundsBuffer.length);

    while (boundsBuffer.remaining() > 0) {
        var bufferCell = TerrainCell.fromBuffer(boundsBuffer);
        bufferCell.meta = 'buffer';
        points.push(bufferCell);
    }

    return points;
};