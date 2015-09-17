var _ = require('lodash');
var SmartBuffer = require('smart-buffer');
var CONST = require('./../util/const.json');

function _j(buffer) {
    var data = buffer.toJSON();
    var l = buffer.length;
    console.log('data.length: ', data.data.length, 'l:', l);
}

module.exports = {

    getIseries: function(i, j1, j2) {
        if (i < 0 || i >= this.masterTerrain.iSize) {
            return null;
        }
        j1 = Math.max(0, j1);
        j2 = Math.min(this.masterTerrain.jSize - 1, j2);

        var js = (j2 - j1 + 1);
        var buffer = new SmartBuffer(CONST.encoding, 12 * js);
        for (var j = j1; j <= j2; ++j) {
            this._writeToBuffer(i, j, buffer);
        }
        return buffer.toBuffer();
    },

    _writeToBuffer: function(i, j, buffer) {
        var cell = this.masterTerrain.getCell(i, j);
        cell.dataToBuffer(buffer);
    },

    getJseries: function(j, i1, i2) {
        if (j < 0 || j >= this.masterTerrain.jSize) {
            return null;
        }
        i1 = Math.max(0, i1);
        i2 = Math.min(this.masterTerrain.iSize - 1, i2);

        var buffer = new SmartBuffer(8 * (i2 - i1 + 1));

        for (var i = i1; i <= i2; ++i) {
            this._writeToBuffer(i, j, buffer);
        }
        return buffer.toBuffer();
    },

    boundsFor: function(region) {
        var buffers = [];

        buffers.push(this.getIseries(region.iStart - 1, region.jStart - 1, region.jStart + region.jSize));
        buffers.push(this.getIseries(region.iStart + region.iSize, region.jStart - 1, region.jStart + region.jSize));

        buffers.push(this.getJseries(region.jStart - 1, region.iStart - 1, region.iStart + region.iSize));
        buffers.push(this.getJseries(region.jStart + region.jSize, region.iStart - 1, region.iStart + region.iSize));

        return Buffer.concat(_.compact(buffers));
    }
};