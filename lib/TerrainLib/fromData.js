var SmartBuffer = require('smart-buffer');
var CONST = require('./../util/const.json');

module.exports = function (data, full) {
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

    var out = new Terrain(iSize, jSize, 0, iStart, jStart);
    out.each(function(cell){
       cell.updateFromBuffer(sBuffer, full);
    });
    //  console.log('division from data: ', out.toJSON());
    return out;
};