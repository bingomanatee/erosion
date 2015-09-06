var _ = require('lodash');
var SmartBuffer = require('smart-buffer');

function _j(buffer) {
    var data = buffer.toJSON();
    var l = buffer.length;
    console.log('data.length: ', data.data.length, 'l:', l);
}

module.exports = {

    getIseries: function (i, j1, j2) {
        if (i < 0 || i >= this.masterTerrain.iSize) {
            return null;
        }
        j1 = Math.max(0, j1);
        j2 = Math.min(this.masterTerrain.jSize, j2);

        var js = (j2 - j1 + 1);
        var buffer = new SmartBuffer('hex', 12 * js);
        var offset = 0;

        for (var j = j1; j <= j2; ++j) {
            this._writeToBuffer(i, j, buffer);
        }
        return buffer.toBuffer();
    },

    _writeToBuffer: function (i, j, buffer) {
        var height = this.masterTerrain.getHeight(i, j);
        buffer.writeInt16LE(i);
        buffer.writeInt16LE(j);
        buffer.writeFloatLE(height);
    },

    getJseries: function (j, i1, i2) {
        if (j < 0 || j >= this.masterTerrain.jSize) {
            return null;
        }
        var i1 = Math.max(0, i1);
        var i2 = Math.min(this.masterTerrain.iSize, i2);

        var buffer = new Buffer(8 * (i2 - i1 + 1));
        var offset = 0;

        for (var i = i1; i <= i2; ++i) {
            offset = this._writeToBuffer(i, j, buffer, offset);
        }
        return buffer;
    },

    boundsFor: function (region) {
        var buffers = [];

        buffers.push(this.getIseries(region.iStart - 1, region.jStart - 1, region.jStart + region.jSize));
        buffers.push(this.getIseries(region.iStart + region.iSize, region.jStart - 1, region.jStart + region.jSize));

        buffers.push(this.getJseries(region.jStart - 1, region.iStart - 1, region.iStart + region.iSize));
        buffers.push(this.getJseries(region.jStart + region.jSize, region.iStart - 1, region.iStart + region.iSize));

        return Buffer.concat(_.compact(buffers));
    }
};