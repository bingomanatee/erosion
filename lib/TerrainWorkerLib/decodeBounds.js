var _ = require('lodash');
var SmartBuffer = require('smart-buffer');

module.exports = function decodeBounds(data) {

    var points = [];
    var boundsBuffer = new SmartBuffer(data);

    while (boundsBuffer.remaining() > 0) {
        var i = boundsBuffer.readInt16LE();
        var j = boundsBuffer.readInt16LE();
        var height = boundsBuffer.readFloatLE();
        var item = {
            i: i,
            j: j,
            height: height
        };
        points.push(item);
    }

    return points;
};