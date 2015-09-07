var SmartBuffer = require('smart-buffer');
var CONST = require('./../util/const.json');

module.exports = function (data) {
    var Terrain = require('./../Terrain');
    //console.log('fromData recieved data: ', data.length);

    var buffer = new Buffer(data, CONST.encoding);
   //console.log('fromData: ', buffer.length, encoding);
    var sBuffer = new SmartBuffer(buffer, CONST.encoding);
    //   console.log('sbuffer: ', sBuffer);

    var iSize = sBuffer.readInt16LE();
    var jSize = sBuffer.readInt16LE();
    var iStart = sBuffer.readInt16LE();
    var jStart = sBuffer.readInt16LE();
    var heights = [];
    try {
        while (heights.length < iSize * jSize) {
            heights.push(sBuffer.readFloatLE());
        }
        if (heights.length != iSize * jSize) {
            console.log('strange height count: ', heights.length, 'expected', iSize * jSize);
        }
    } catch (err) {
        console.log('error ', err, 'at length', heights.length);
    }
    var out = new Terrain(iSize, jSize, heights, iStart, jStart);
    //  console.log('division from data: ', out.toJSON());
    return out;
};