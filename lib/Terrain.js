var _ = require('lodash');
var TerrainCell = require('./TerrainCell');
var DIMENSION_SIZE = 2 * 4;
var SmartBuffer = require('smart-buffer');
var CONST = require('./util/const.json');

function Terrain(iSize, jSize, values, iStart, jStart) {
    this.iSize = iSize;
    this.jSize = jSize;
    this.iStart = iStart || 0;
    this.jStart = jStart || 0;
    this._cells = [];

    if (_.isArray(values)) {
        if (values.length != iSize * jSize) {
            console.log('strange count of data: ', values.length, 'expected', iSize * jSize);
        }
        for (var i = 0; i < this.iSize; ++i) {
            for (var j = 0; j < this.jSize; ++j) {
                this._cells.push(new TerrainCell(this, i, j, values.shift()));
            }
        }
    } else {
        for (var i = 0; i < this.iSize; ++i) {
            for (var j = 0; j < this.jSize; ++j) {
                var value = (typeof values === 'function') ? values(i, j, iSize, jSize) : values;
                var cell = new TerrainCell(this, i, j, value);
                this._cells.push(cell);
            }
        }
    }
}

Terrain.prototype = _.extend({

    neighborCells: function (i, j, includeCenter) {
        var cell = this._getCell(i, j);
        if (!cell) {
            throw new Error('cannot get neighbors for cell ' + i + ', ' + j);
        }
        return includeCenter ? cell.neighbors().concat([cell]) : cell.neighbors();
    },

    setBounds: function (bounds) {
        this._bounds = bounds;
        this._boundsIndex = bounds.reduce(function (out, bound) {
            out[bound.i + ',' + bound.j] = bound;
            return out;
        }, {});
    },

    getBounds: function () {
        return this._bounds;
    },

    iMax: function () {
        return this.iStart + this.iSize - 1;
    },

    jMax: function () {
        return this.jStart + this.jSize - 1;
    },

    getBoundsCell: function (ii, jj) {
        if (!this._boundsIndex) {
            return null;
        }
        var index = ii + ',' + jj;
        if (this._boundsIndex[index]) {
            return this._boundsIndex[index];
        } else {
            return null;
        }
    },

    _getCell: function (ii, jj) {
        var i = ii - this.iStart;
        var j = jj - this.jStart;
        if (i >= 0
          && i < this.iSize
          && j >= 0
          && j < this.jSize) {
            return this._cells[i * this.jSize + j]
        } else {
            // console.log(['out of range getHeight', i, j, 'from', JSON.stringify(this.toJSON())].join(' '));
            return null;
        }

    },

    getHeight: function (i, j, checkBounds) {
        return this._getCell(i, j, checkBounds).value;
    },

    divide: function (number) {
        //   console.log('dividing', this.toString(), 'by', number);
        var iSize1, iSize2, jSize1, jSize2;
        var iStart1, iStart2, jStart1, jStart2;

        if (number == 1) {
            return [this];
        }

        iStart1 = jStart1 = 0;
        iStart2 = jStart2 = 0;
        jSize1 = jSize2 = this.jSize;
        iSize1 = iSize2 = this.iSize;

        if (this.iSize <= this.jSize) {
            jSize1 = jStart2 = Math.floor(this.jSize / 2);
            jSize2 = this.jSize - jSize1;
        } else {
            iSize1 = iStart2 = Math.floor(this.iSize / 2);
            iSize2 = this.iSize - iSize1;
        }

        //    console.log('size: ', this.iSize, this.jSize);

        //    console.log('iStart1', iStart1, 'jStart1:' , jStart1, 'iSize1', iSize1 ,'jSize1:', jSize1);
        //    console.log('iStart2', iStart2, 'jStart2:' , jStart2, 'iSize2', iSize2 ,'jSize2:', jSize2);
        var terrain1 = new Terrain(iSize1, jSize1,
          this.slice(iStart1, jStart1, iSize1, jSize1),
          this.iStart,
          this.jStart);
        var terrain2 = new Terrain(iSize2, jSize2,
          this.slice(iStart2, jStart2, this.iSize, this.jSize),
          iStart2 + this.iStart,
          jStart2 + this.jStart);

        var divide1 = Math.floor(number / 2);
        var divide2 = number - divide1;

        return terrain1.divide(divide1).concat(terrain2.divide(divide2));
    }
}, require('./TerrainLib/bounds'), require('./TerrainLib/io'), require('./TerrainLib/change'));

// this.iSize, this.jSize, this.iStart, this.jStart
Terrain.fromData = function (data, encoding) {
    console.log('fromData recieved data: ', data.length);
    if (!encoding) {
        encoding = CONST.encoding;
    }

    var buffer = new Buffer(data, encoding);
    console.log('fromData: ', buffer.length, encoding);
    var sBuffer = new SmartBuffer(buffer, encoding);
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
    } catch(err){
        console.log('error ', err, 'at length', heights.length);
    }
    var out = new Terrain(iSize, jSize, heights, iStart, jStart);
  //  console.log('division from data: ', out.toJSON());
    return out;
};

module.exports = Terrain;