var SmartBuffer = require('smart-buffer');
var CONST = require('./../util/const.json');

module.exports = function (data) {
    var Terrain = require('./../Terrain');
    console.log('fromData: recieved', data);
    var buffer = new Buffer(data.data, CONST.encoding);
    var sBuffer = new SmartBuffer(buffer, CONST.encoding);

    var iSize = sBuffer.readInt16LE();
    var jSize = sBuffer.readInt16LE();
    var iStart = sBuffer.readInt16LE();
    var jStart = sBuffer.readInt16LE();

    var out = new Terrain(iSize, jSize, 0, iStart, jStart);
    out.each(function (cell) {
        cell.height(sBuffer.readFloatLE());
    });
    console.log('division from data: ', out.toJSON());
    return out;
};