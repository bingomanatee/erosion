var SmartBuffer = require('smart-buffer');
var CONST = require('./../util/const.json');

module.exports = function arrayOfFloatsToBuffer(data){
    var sBuffer = new SmartBuffer(4 * data.length, CONST.encoding);

    for (var n = 0; n < data.length; ++n){
        sBuffer.writeFloatLE(data[n]);
    }
    return sBuffer.toBuffer();
};